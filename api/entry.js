const {handle}=require('../cloud-backend.cjs');
module.exports=async(req,res)=>{const url=new URL(req.url,'https://localhost');const route=url.searchParams.get('__route')||url.pathname;await handle(req,res,route);};
