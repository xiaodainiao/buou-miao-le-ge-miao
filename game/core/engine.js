
const {CARDS,LEVELS}=require('./cards');
function rng(seed){let s=seed>>>0;return()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};}
function shuffled(a,random){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function overlap(a,b){const epsilon=0.01;return a.x+epsilon<b.x+b.size&&b.x+epsilon<a.x+a.size&&a.y+epsilon<b.y+b.size&&b.y+epsilon<a.y+a.size;}
const geometryCache=new WeakMap();
function geometry(tiles){let g=geometryCache.get(tiles);if(g&&g.length===tiles.length)return g;
const blockers=new Map(),children=new Map(),fullCover=new Map();for(const t of tiles){blockers.set(t,[]);children.set(t,[]);fullCover.set(t,[]);}
for(let i=0;i<tiles.length;i++)for(let j=i+1;j<tiles.length;j++){const a=tiles[i],b=tiles[j];if(a.z===b.z||!overlap(a,b))continue;const lower=a.z<b.z?a:b,upper=a.z<b.z?b:a;blockers.get(lower).push(upper);children.get(upper).push(lower);if(upper.x<=lower.x+.01&&upper.y<=lower.y+.01&&upper.x+upper.size>=lower.x+lower.size-.01&&upper.y+upper.size>=lower.y+lower.size-.01)fullCover.get(lower).push(upper);}
g={length:tiles.length,blockers,children,fullCover,sorted:tiles.slice().sort((a,b)=>a.z-b.z||a.id-b.id)};geometryCache.set(tiles,g);return g;}
function available(state,tile){if(!tile||tile.removed)return false;const g=geometry(state.tiles),list=g.blockers.get(tile);return !!list&&!list.some(t=>!t.removed);}
function renderTiles(state){const g=geometry(state.tiles);return g.sorted.filter(t=>!t.removed&&!g.fullCover.get(t).some(u=>!u.removed));}
function orderTiles(tiles,random){const g=geometry(tiles),degree=new Map(),ready=[],out=[];let live=0;for(const t of tiles){if(t.removed)continue;live++;const n=g.blockers.get(t).filter(u=>!u.removed).length;degree.set(t,n);if(n===0)ready.push(t);}
while(ready.length){const i=Math.floor(random()*ready.length),t=ready[i];ready[i]=ready[ready.length-1];ready.pop();out.push(t.id);for(const lower of g.children.get(t)){if(lower.removed)continue;const n=degree.get(lower)-1;degree.set(lower,n);if(n===0)ready.push(lower);}}if(out.length!==live)throw Error('布局存在循环遮挡');return out;}
function layout(level,random){const tiles=[],add=(x,y,size,z,zone='main',bonus=false)=>tiles.push({id:tiles.length,x,y,size,z,zone,bonus,removed:false,card:0});
if(level===0){for(let row=0;row<3;row++)for(let col=0;col<3;col++)add(49+col*69,20+row*65,54,0);return tiles;}
const sideCount=level===2?48:12,bonusCount=LEVELS[level].bonusCount||0,mainCount=LEVELS[level].count-sideCount*2-bonusCount;if(bonusCount)add(148,208,44,0,'main',true);
const clusters=[[72,65],[212,70],[142,164],[67,270],[217,278],[145,377]];
const clamp=(n,min,max)=>Math.round(Math.max(min,Math.min(max,n))*10)/10;
const scatter=()=>{const c=clusters[Math.floor(random()*clusters.length)];return [clamp(c[0]+(random()-.5)*85,28,268),clamp(c[1]+(random()-.5)*95,18,394)];};
for(let i=0;i<mainCount;i++){let x,y;
if(i<32){[x,y]=scatter();}
else {const recent=tiles.slice(Math.max(0,tiles.length-90)),base=recent[Math.floor(random()*recent.length)],mode=Math.floor(random()*5),sx=random()<.5?-1:1,sy=random()<.5?-1:1;
if(mode===0){x=base.x;y=base.y;}
else if(mode===1){x=base.x+sx*22;y=base.y;}
else if(mode===2){x=base.x+sx*34;y=base.y+sy*34;}
else if(mode===3){x=base.x+sx*(8+random()*28);y=base.y+sy*(7+random()*29);}
else {[x,y]=scatter();}}
add(clamp(x,28,268),clamp(y,18,394),44,i+bonusCount);
}
let leftY=174,rightY=180;
for(let depth=0;depth<sideCount;depth++){const step=level===2?1+random()*1.1:3+random()*3;leftY+=step;rightY+=step;add(clamp(4+random()*5,4,9),clamp(leftY,170,275),44,mainCount+bonusCount+10+depth*2,'left');add(clamp(287+random()*6,287,293),clamp(rightY,175,280),44,mainCount+bonusCount+11+depth*2,'right');}
return tiles;}
function makeSequence(groups,random,hard){if(!hard)return shuffled(groups,random).flatMap(id=>[id,id,id]);
const pending={};groups.forEach(id=>pending[id]=(pending[id]||0)+1);const tray={},result=[];let copies=groups.length*3,slots=0;
while(copies){const open=Object.keys(pending).filter(id=>pending[id]>0&&!tray[id]),active=Object.keys(tray);let id;
if(open.length&&slots<=4&&(!active.length||random()<0.72)){id=open[Math.floor(random()*open.length)];pending[id]--;tray[id]=1;slots++;}
else {const doubles=active.filter(id=>tray[id]===2),choices=slots>=5&&doubles.length?doubles:active;if(!choices.length)throw Error('无可用的安全出牌');id=choices[Math.floor(random()*choices.length)];if(tray[id]===2){delete tray[id];slots-=2;}else {tray[id]=2;slots++;}}
if(slots>6)throw Error('生成序列超过安全槽位');result.push(+id);copies--;}
if(slots!==0)throw Error('生成序列未完全配对');return result;}
function create(level,seed=Date.now()){if(!LEVELS[level])throw Error('关卡不存在');const random=rng(seed),cfg=LEVELS[level],pool=shuffled(CARDS.filter(c=>c.theme<=cfg.theme).map(c=>c.id),random).slice(0,cfg.kinds),tiles=layout(level,random),witness=orderTiles(tiles,random);
if(tiles.length!==cfg.count)throw Error('布局数量与关卡不符');
const normalCount=cfg.count-(cfg.bonusCount||0);if(normalCount%3)throw Error('普通卡牌数量必须为3的倍数');
const groups=Array.from({length:normalCount/3},(_,i)=>pool[i%pool.length]),sequence=makeSequence(groups,random,level>0);let index=0;
witness.forEach(id=>{const tile=tiles[id];tile.card=tile.bonus?0:sequence[index++];});
return {version:6,level,seed,tiles,tray:[],stash:[],status:'playing',moves:0,matched:0,bonusCollected:0,tools:{undo:1,shuffle:1,stash:1,revive:1},previous:null,witness};}
function remaining(s){return s.tiles.filter(t=>!t.removed).length;}
function updateStatus(s){s.status=remaining(s)===0&&s.tray.length===0&&s.stash.length===0?'won':s.tray.length>=7?'lost':'playing';}
function put(s,card){const last=s.tray.lastIndexOf(card);s.tray.splice(last<0?s.tray.length:last+1,0,card);if(s.tray.filter(c=>c===card).length===3){s.tray=s.tray.filter(c=>c!==card);s.matched++;s.previous=null;return true;}return false;}
function pick(s,id){if(s.status!=='playing')return {ok:false};const tile=s.tiles.find(t=>t.id===id);if(!available(s,tile))return {ok:false,reason:'先移开压住它的上层卡牌'};
if(tile.bonus){tile.removed=true;s.moves++;s.bonusCollected=(s.bonusCollected||0)+1;s.previous=null;updateStatus(s);return {ok:true,bonus:true,matched:false,status:s.status};}
s.previous={id,source:'board',tray:s.tray.slice(),moves:s.moves};tile.removed=true;s.moves++;const matched=put(s,tile.card);updateStatus(s);return {ok:true,matched,status:s.status};}
function takeStash(s,index){if(s.status!=='playing'||!Number.isInteger(index)||index<0||index>=s.stash.length)return {ok:false};const card=s.stash[index];s.previous={source:'stash',index,card,tray:s.tray.slice(),moves:s.moves};s.stash.splice(index,1);s.moves++;const matched=put(s,card);updateStatus(s);return {ok:true,matched,status:s.status};}
function undo(s){if(s.status!=='playing'||!s.tools.undo||!s.previous)return false;const p=s.previous;s.tray=p.tray;s.moves=p.moves;if(p.source==='board')s.tiles.find(t=>t.id===p.id).removed=false;else s.stash.splice(p.index,0,p.card);s.previous=null;s.tools.undo--;return true;}
function store(s,revive=false){const key=revive?'revive':'stash';if((revive?s.status!=='lost':s.status!=='playing')||!s.tools[key]||s.stash.length||!s.tray.length)return false;s.stash=s.tray.splice(0,3);s.tools[key]--;s.previous=null;updateStatus(s);return true;}
function reshuffle(s){if(s.status!=='playing'||!s.tools.shuffle||s.stash.length)return {ok:false,reason:'请先取回寄存卡牌，再洗牌'};const count=s.tiles.filter(t=>!t.removed&&!t.bonus).length;if(!count)return {ok:false,reason:remaining(s)?'只剩奖励牌，直接点击即可':'场上没有可洗的卡牌'};
const needed=s.tray.reduce((m,id)=>(m[id]=(m[id]||0)+1,m),{});let virtual=s.tray.length;const random=rng(s.seed+s.moves+101),sequence=[];
for(const id of Object.keys(needed).sort((a,b)=>needed[b]-needed[a])){const n=3-needed[id];if(virtual+n-1>=7)return {ok:false,reason:'槽位太满，请先使用寄存道具'};for(let i=0;i<n;i++)sequence.push(+id);virtual-=needed[id];}
const bag={};s.tiles.filter(t=>!t.removed&&!t.bonus).forEach(t=>{bag[t.card]=(bag[t.card]||0)+1;});sequence.forEach(id=>bag[id]--);
if(Object.values(bag).some(n=>n<0||n%3!==0))throw Error('卡牌数量异常');
const groups=[];Object.keys(bag).forEach(id=>{for(let i=0;i<bag[id]/3;i++)groups.push(+id);});
sequence.push(...makeSequence(groups,random,s.level>0));if(sequence.length!==count)throw Error('洗牌数量异常');
const witness=orderTiles(s.tiles,random);let assigned=0;witness.forEach(id=>{if(!s.tiles[id].bonus)s.tiles[id].card=sequence[assigned++];});s.witness=witness;s.previous=null;s.tools.shuffle--;return {ok:true};}
module.exports={create,available,pick,takeStash,undo,store,reshuffle,remaining,rng,overlap,renderTiles};
