const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dest=path.join(root,'dist');fs.mkdirSync(dest,{recursive:true});
for(const name of ['index.html','mobile-preview.html','styles.css','theme.css','layout.css','albums.css','config.js','catalog-data.js','app.js','albums.js','admin.html','admin.css','admin.js'])fs.copyFileSync(path.join(root,name),path.join(dest,name));
fs.cpSync(path.join(root,'assets'),path.join(dest,'assets'),{recursive:true});console.log('Built public storefront assets only. Private data and server source excluded.');
