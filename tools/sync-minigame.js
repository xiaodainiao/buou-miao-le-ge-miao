'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),src=path.join(root,'miniprogram'),dest=path.join(root,'game');
const {CARDS}=require(path.join(src,'core/cards.js'));
for(const name of ['cards.js','engine.js']){fs.mkdirSync(path.join(dest,'core'),{recursive:true});fs.copyFileSync(path.join(src,'core',name),path.join(dest,'core',name));}
for(const c of CARDS){const rel=c.image.replace(/^\//,'');const target=path.join(dest,rel);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(src,rel),target);}
fs.copyFileSync(path.join(src,'assets/card-set.json'),path.join(dest,'assets/card-set.json'));
console.log('Synced shared engine and '+CARDS.length+' approved images to game/');
