'use strict';
const C={bg:'#faf7f0',ink:'#34474b',green:'#547a68',muted:'#849285',paper:'#fffdf6',soft:'#eeeee5',board:'#e2efcf',gold:'#c49430'};
function round(ctx,x,y,w,h,r=12){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function fill(ctx,x,y,w,h,color,r=12){ctx.fillStyle=color;round(ctx,x,y,w,h,r);ctx.fill();}
function text(ctx,str,x,y,size=14,color=C.ink,align='left',bold=false){ctx.font=(bold?'bold ':'')+size+'px sans-serif';ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(String(str),x,y);}
function wrap(ctx,str,x,y,width,size=14,color=C.muted,lineHeight=24){let line='',rows=0;ctx.font=size+'px sans-serif';for(const c of str){if(c==='\n'||ctx.measureText(line+c).width>width){text(ctx,line,x,y+rows*lineHeight,size,color);line=c==='\n'?'':c;rows++;}else line+=c;}if(line){text(ctx,line,x,y+rows*lineHeight,size,color);rows++;}return rows*lineHeight;}
module.exports={C,round,fill,text,wrap};
