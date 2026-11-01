
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {bundle}=require('./preview-bundle');
const root=path.resolve(__dirname,'..'),host='127.0.0.1',port=4173;
http.createServer((req,res)=>{const route=req.url.split('?')[0],files={'/':'preview/index.html','/cards.js':'miniprogram/core/cards.js','/engine.js':'miniprogram/core/engine.js'};
if(/^\/assets\/cards\/(?:0[0-9]|1[0-5]|2[4-9]|3[01])\.jpg$/.test(route)){const p=path.join(root,'miniprogram',route.slice(1));if(fs.existsSync(p)){res.setHeader('Content-Type','image/jpeg');res.setHeader('Cache-Control','no-cache');res.end(fs.readFileSync(p));return;}}
const file=files[route];if(!file){res.writeHead(404);res.end('Not found');return;}res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':'application/javascript; charset=utf-8');const src=fs.readFileSync(path.join(root,file),'utf8');res.end(file.endsWith('.html')?src:bundle(src,route==='/cards.js'?'cards':'engine'));}).listen(port,host,()=>console.log('Preview: http://'+host+':'+port));
