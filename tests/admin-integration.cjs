const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'.private','test-'+Date.now()),base='http://localhost:4175',origin=base;
const child=spawn(process.execPath,['server.cjs'],{cwd:root,env:{...process.env,PORT:'4175',DRIP_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});let cookie='',csrf='';
async function req(route,method='GET',data,headers={}){return fetch(base+route,{method,headers:{Origin:origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CSRF-Token':csrf}:{}),...headers},body:data===undefined?undefined:JSON.stringify(data)});}
(async()=>{await new Promise((resolve,reject)=>{child.once('error',reject);const timeout=setTimeout(()=>reject(Error('Server did not start')),10000);child.stdout.on('data',s=>{if(s.toString().includes('Local:')){clearTimeout(timeout);resolve();}});});
assert.equal((await req('/api/admin/content')).status,401);assert.equal((await req('/api/admin/analytics')).status,401);
for(const p of ['/.private/auth.json','/server.cjs','/admin-backend.cjs','/README.md','/%2eprivate/bootstrap.json'])assert.equal((await req(p)).status,404);
assert.equal((await req('/api/admin/setup','POST',{token:'bad',password:'test password123'})).status,403);
const token=JSON.parse(fs.readFileSync(path.join(dir,'bootstrap.json'),'utf8'));let r=await req('/api/admin/setup','POST',{token,password:'test-password-only-123'});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];csrf=(await r.json()).csrf;
assert.equal((await req('/api/admin/setup','POST',{token,password:'test-password-only-123'})).status,403);
let content=await (await req('/api/admin/content')).json();assert.equal((await req('/api/admin/content','PUT',content,{'X-CSRF-Token':'bad'})).status,403);assert.equal((await req('/api/admin/content','PUT',content,{Origin:'http://evil.test'})).status,403);
assert.equal((await req('/api/admin/upload','POST',{data:'data:image/png;base64,AAAA'})).status,400);
r=await req('/api/admin/upload','POST',{data:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aScsAAAAASUVORK5CYII='});assert.equal(r.status,200);const image=(await r.json()).src;assert.equal((await req('/'+image)).status,200);
content.albums=[{id:'test-album',title:'Test album',type:'Feedback',description:'Integration test',published:false,cover:image,images:[{src:image,alt:'Test image'}]}];assert.equal((await req('/api/admin/content','PUT',content)).status,200);assert.equal((await (await req('/api/content')).json()).albums.length,0);
content.albums[0].published=true;assert.equal((await req('/api/admin/content','PUT',content)).status,200);assert.equal((await (await req('/api/content')).json()).albums[0].images.length,1);
assert.equal((await req('/api/track','POST',{event:'album'},{Cookie:''})).status,200);const stats=await (await req('/api/admin/analytics')).json();assert.equal(Object.values(stats)[0].album,1);
assert.equal((await req('/api/admin/logout','POST',{})).status,200);assert.equal((await req('/api/admin/content')).status,401);cookie='';csrf='';assert.equal((await req('/api/admin/login','POST',{password:'wrong'})).status,401);r=await req('/api/admin/login','POST',{password:'test-password-only-123'});assert.equal(r.status,200);assert(r.headers.get('set-cookie').includes('HttpOnly'));
console.log('Passed: private setup, password login, session protection, CSRF/origin rejection, private-file denial, image validation, upload, draft/published albums, analytics and logout.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>child.kill());
