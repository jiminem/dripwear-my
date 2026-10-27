const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const {get,put}=require('@vercel/blob');
const read=(name,fallback)=>{try{return JSON.parse(fs.readFileSync(path.join(root,'.private',name),'utf8'));}catch{return fallback;}};
(async()=>{if(!process.env.BLOB_READ_WRITE_TOKEN)throw Error('Production storage credentials are missing.');if(await get('private/store-state.json',{access:'private',useCache:false})){console.log('Cloud state already exists; no data overwritten.');return;}
const content=read('content.json',{heroDescription:'Jersey sublimation, original kit design, teamwear, and custom apparel made to give your team a stronger identity.',catalogTitle:'Your team. Your options',whatsappNumber:'601153903625',albums:[]});
const auth=read('auth.json',null),setup=auth?null:read('bootstrap.json',null);if(!auth&&!setup)throw Error('No local admin setup state exists. Start the local server first.');
const uploads=[...new Set(content.albums.flatMap(a=>a.images.map(im=>im.src)))];for(const src of uploads){if(!/^uploads\/[a-f0-9]{32}\.(png|jpg|webp)$/.test(src))throw Error('Unexpected upload path.');await put(src,fs.readFileSync(path.join(root,src)),{access:'private',addRandomSuffix:false,contentType:src.endsWith('.jpg')?'image/jpeg':src.endsWith('.png')?'image/png':'image/webp'});}
await put('private/store-state.json',JSON.stringify({auth,setup,content,stats:read('analytics.json',{}),sessions:{},attempts:{},uploads}),{access:'private',addRandomSuffix:false,contentType:'application/json'});
console.log('Migrated storefront settings, '+uploads.length+' photos and analytics to private cloud storage. Existing admin password preserved: '+!!auth+'.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
