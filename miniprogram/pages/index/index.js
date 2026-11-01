
const E=require('../../core/engine');
const {CARDS,THEMES,LEVELS,unlockedTheme}=require('../../core/cards');
const SAVE='xiaobao_save_v6_three_levels',PROGRESS='xiaobao_progress_v4_two_levels',SOUND='xiaobao_sound_v1';
Page({
 data:{screen:'home',sound:true,unlocked:1,cleared:{},hasSave:false,levelItems:[],album:[],albumCount:8,themeNames:THEMES.map(t=>t.name),themeFilter:-1,canvasHeight:230,totalLevels:LEVELS.length,exposed:0,artReady:false,modal:'',message:'',traySlots:[],stashCards:[],tools:{},levelNumber:1,levelName:'初次见面',remaining:9,bonusCollected:0,moves:0,matched:0},
 onLoad(){const progress=this.read(PROGRESS)||{};if(progress.cleared&&progress.cleared[1])progress.unlocked=Math.max(3,Number(progress.unlocked)||1);this.setData({unlocked:Math.max(1,Math.min(LEVELS.length,Number(progress.unlocked)||1)),cleared:progress.cleared||{},sound:this.read(SOUND)!==false,hasSave:!!this.readSave()});this.refreshMenus();},
 read(key){try{return wx.getStorageSync(key);}catch(e){return null;}},
 readSave(){const s=this.read(SAVE);return s&&Number.isInteger(s.level)&&LEVELS[s.level]&&Array.isArray(s.tiles)&&Array.isArray(s.tray)&&Array.isArray(s.stash)&&s.tools&&['playing','lost'].includes(s.status)?s:null;},
 onResize(){if(this.data.screen==='game')wx.nextTick(()=>this.initCanvas());},
 onHide(){if(this._saveTimer)clearTimeout(this._saveTimer);this.save();this._busy=false;},
 onUnload(){if(this._saveTimer)clearTimeout(this._saveTimer);this.save();if(this._audio)try{this._audio.close();}catch(e){}},
 save(){if(this.game&&['playing','lost'].includes(this.game.status)){try{wx.setStorageSync(SAVE,this.game);this.setData({hasSave:true});}catch(e){this.toast('存档空间不足，本局暂未保存');}}},
 queueSave(){if(this._saveTimer)clearTimeout(this._saveTimer);this._saveTimer=setTimeout(()=>{this._saveTimer=null;this.save();},200);},
 refreshMenus(){const maxTheme=unlockedTheme(this.data.unlocked),filter=this.data.themeFilter;
 this.setData({levelItems:LEVELS.map((l,i)=>({...l,index:i,number:i+1,locked:i+1>this.data.unlocked,cleared:!!this.data.cleared[i],stars:this.data.cleared[i]||0})),albumCount:(maxTheme+1)*8,album:CARDS.filter(c=>filter<0||c.theme===filter).map(c=>({...c,locked:c.theme>maxTheme}))});},
 toast(title){wx.showToast({title,icon:'none',duration:1800});},
 showLevels(){this.setData({screen:'levels'});this.refreshMenus();},
 showAlbum(){this.setData({screen:'album',themeFilter:-1});this.refreshMenus();},
 showGuide(){this.setData({screen:'guide'});},
 filterTheme(e){this.setData({themeFilter:Number(e.currentTarget.dataset.index)});this.refreshMenus();},
 toggleSound(){const sound=!this.data.sound;this.setData({sound});try{wx.setStorageSync(SOUND,sound);}catch(e){}if(sound)this.tone();},
 home(){this.save();this.setData({screen:'home',modal:''});},
 chooseLevel(e){const i=Number(e.currentTarget.dataset.index);if(i+1>this.data.unlocked){this.toast('先陪小宝完成前面的关卡吧');return;}this.start(i);},
 startFirst(){this.start(Math.min(this.data.unlocked-1,LEVELS.length-1));},
 resumeSave(){const save=this.readSave();if(!save){this.toast('暂无可恢复的存档');this.setData({hasSave:false});return;}this.game=save;this.mountGame();},
 start(level){this.game=E.create(level);this.mountGame();},
 mountGame(){this._busy=false;this.setData({screen:'game',modal:this.game.status==='lost'?'lost':'',message:''});this.sync();wx.nextTick(()=>this.initCanvas());},
 sync(){const s=this.game;if(!s)return;this.setData({levelNumber:s.level+1,levelName:LEVELS[s.level].name,remaining:E.remaining(s),bonusCollected:s.bonusCollected||0,exposed:s.tiles.filter(t=>E.available(s,t)).length,moves:s.moves,matched:s.matched,tools:{...s.tools},traySlots:Array.from({length:7},(_,i)=>s.tray[i]===undefined?{empty:true,key:i}:{...CARDS[s.tray[i]],key:i}),stashCards:s.stash.map((id,index)=>({...CARDS[id],index})),canUndo:!!s.previous&&s.tools.undo>0});},
 initCanvas(){if(this.data.screen!=='game')return;wx.createSelectorQuery().in(this).select('#board').fields({node:true,size:true,rect:true}).exec(res=>{const item=res&&res[0];if(!item||!item.node)return;this.canvas=item.node;this.ctx=this.canvas.getContext('2d');this._rect=item;this._width=item.width;this._height=item.width*LEVELS[this.game.level].height/340;this.setData({canvasHeight:this._height});const info=wx.getWindowInfo?wx.getWindowInfo():wx.getSystemInfoSync();const dpr=info.pixelRatio||1;this.canvas.width=Math.round(item.width*dpr);this.canvas.height=Math.round(this._height*dpr);this.ctx.scale(dpr,dpr);this.loadCardArt();this.draw();});},
 loadCardArt(){const epoch=this._artEpoch=(this._artEpoch||0)+1;this._cardImages={};this.setData({artReady:false});const ids=[...new Set(this.game.tiles.filter(t=>!t.removed).map(t=>t.card))];let loaded=0,failed=0;if(!ids.length){this.setData({artReady:true});return;}
 const settled=()=>{if(epoch!==this._artEpoch)return;loaded++;if(loaded===ids.length){this.setData({artReady:failed===0});if(failed)this.toast('图片加载失败，请返回小窝后重试');this.draw();}};
 for(const id of ids){const image=this.canvas.createImage();image.onload=()=>{if(epoch!==this._artEpoch)return;this._cardImages[id]=image;settled();};image.onerror=()=>{if(epoch!==this._artEpoch)return;failed++;settled();};image.src=CARDS[id].image;}},
 rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();},
 draw(){if(!this.ctx||!this.game||this.data.screen!=='game')return;const ctx=this.ctx,k=this._width/340;ctx.clearRect(0,0,this._width,this._height);ctx.save();ctx.scale(k,k);const cards=E.renderTiles(this.game);
for(const tile of cards){const active=E.available(this.game,tile),x=tile.x,y=tile.y,w=tile.size;ctx.globalAlpha=1;ctx.fillStyle=active?'#7d9d70':'#8c9787';this.rounded(ctx,x,y+5,w,w,5);ctx.fill();ctx.fillStyle=active?'#fffdf6':'#adb8a4';this.rounded(ctx,x,y,w,w,5);ctx.fill();ctx.strokeStyle=tile.bonus?'#c49430':active?'#546b45':'#7c8874';ctx.lineWidth=tile.bonus?2.5:1.2;ctx.stroke();const image=this._cardImages&&this._cardImages[tile.card];if(image){ctx.globalAlpha=active?1:0.4;ctx.drawImage(image,x+3,y+3,w-6,w-6);}else{ctx.fillStyle='#7f9486';ctx.textAlign='center';ctx.font='14px sans-serif';ctx.fillText('…',x+w/2,y+w/2);}ctx.globalAlpha=1;if(tile.bonus){ctx.fillStyle='#b18727';ctx.font='bold 10px sans-serif';ctx.textAlign='right';ctx.fillText('福',x+w-4,y+13);}if(!active){ctx.fillStyle='rgba(45,65,35,0.22)';this.rounded(ctx,x,y,w,w,5);ctx.fill();}}ctx.restore();},
 onBoardTouch(e){if(!this.data.artReady){this.toast('卡牌图片加载中，请稍候');return;}if(this._busy||this.data.modal||!this.game||this.game.status!=='playing')return;const touch=e.changedTouches&&e.changedTouches[0];if(!touch||!this._rect)return;
 const k=this._width/340,x=(touch.clientX-this._rect.left)/k,y=(touch.clientY-this._rect.top)/k;
 const tiles=this.game.tiles.filter(t=>!t.removed).sort((a,b)=>b.z-a.z||b.id-a.id),tile=tiles.find(t=>x>=t.x&&x<=t.x+t.size&&y>=t.y&&y<=t.y+t.size);if(!tile)return;this.act(()=>E.pick(this.game,tile.id));},
 takeStash(e){this.act(()=>E.takeStash(this.game,Number(e.currentTarget.dataset.index)));},
 act(action){if(this._busy||this.data.modal)return;this._busy=true;try{const result=action();if(result&&result.ok){this.tone(result.matched||result.bonus);this.setData({message:result.bonus?'小宝奖励牌已收集，不占收集槽':result.matched?'三张凑齐，小宝开心 +1':'选得好，留意下面露出的卡牌'});this.afterMove();}else if(result&&result.reason)this.toast(result.reason);}finally{this._busy=false;}},
 afterMove(){this.sync();this.draw();if(this.game.status==='won'){this.finish();}else {this.queueSave();if(this.game.status==='lost')this.setData({modal:'lost'});}},
 finish(){const s=this.game,used=Object.values(s.tools).reduce((n,left)=>n+1-left,0),stars=used===0?3:used<=2?2:1,cleared={...this.data.cleared,[s.level]:Math.max(stars,this.data.cleared[s.level]||0)},unlocked=Math.min(LEVELS.length,Math.max(this.data.unlocked,s.level+2));
 this.setData({cleared,unlocked,modal:'won',stars,hasSave:false});try{wx.setStorageSync(PROGRESS,{cleared,unlocked});wx.removeStorageSync(SAVE);}catch(e){this.toast('进度保存失败，请检查存储空间');}this.refreshMenus();},
 useUndo(){if(this.data.modal)return;if(!E.undo(this.game)){this.toast('只能撤回最近一次尚未消除的选牌');return;}this.afterMove();},
 useShuffle(){this.act(()=>E.reshuffle(this.game));},
 useStore(){if(this.data.modal)return;if(!E.store(this.game)){this.toast('寄存区需为空，道具每局限用一次');return;}this.afterMove();},
 revive(){if(!E.store(this.game,true)){this.toast('复活需有空的寄存区，且每局限一次');return;}this.setData({modal:''});this.afterMove();},
 restart(){const index=this.game.level;wx.showModal({title:'重新挑战？',content:'本关将重新开始，当前牌局会被替换。',confirmText:'重新开始',success:res=>{if(res.confirm)this.start(index);}});},
 nextLevel(){const n=this.game.level+1;if(n>=LEVELS.length){this.setData({screen:'levels',modal:''});return;}this.start(n);},
 pause(){if(this.game.status==='playing'){this.save();this.setData({modal:'paused'});}},
 continueGame(){this.setData({modal:''});},
 tone(matched=false){if(!this.data.sound||!wx.createWebAudioContext)return;try{const a=this._audio||(this._audio=wx.createWebAudioContext());if(a.state==='suspended')a.resume();const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=matched?784:523;g.gain.value=0.045;o.connect(g);g.connect(a.destination);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.12);o.start();o.stop(a.currentTime+0.14);}catch(e){}},
 noop(){},
 onShareAppMessage(){return {title:'来陪布偶瞄了个喵，收集24种可爱卡牌！',path:'/pages/index/index'};}
});
