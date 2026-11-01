const THEMES=[
  {
    "name": "小宝日常",
    "color": "#dceaf7",
    "items": [
      "歪头小宝",
      "睡觉小宝",
      "伸懒腰小宝",
      "舔爪小宝",
      "翻肚小宝",
      "探头小宝",
      "踩奶小宝",
      "打哈欠小宝"
    ]
  },
  {
    "name": "猫咪美食",
    "color": "#f9e7cb",
    "items": [
      "小鱼干",
      "猫罐头",
      "猫条",
      "猫粮碗",
      "冻干",
      "鸡胸肉",
      "饮水机",
      "猫草"
    ]
  },
  {
    "name": "温馨猫窝",
    "color": "#dcebdc",
    "items": [
      "猫窝",
      "猫爬架",
      "猫抓板",
      "猫吊床",
      "小毯子",
      "猫背包",
      "猫门",
      "窗边软垫"
    ]
  }
];
const CARDS=THEMES.flatMap((theme,t)=>theme.items.map((name,i)=>({id:t*8+i,name,image:'/assets/cards/'+String((t===2?24:t*8)+i).padStart(2,'0')+'.jpg',color:theme.color,theme:t})));
const LEVELS=[
  {
    "name": "和小宝碰个爪",
    "count": 9,
    "kinds": 3,
    "theme": 0,
    "height": 230,
    "layers": 1,
    "difficulty": "轻松教学"
  },
  {
    "name": "小宝的极限挑战",
    "count": 216,
    "kinds": 24,
    "theme": 2,
    "height": 460,
    "layout": "irregular",
    "difficulty": "极难"
  },
  {
    "name": "小宝的千张挑战",
    "count": 1000,
    "bonusCount": 1,
    "kinds": 24,
    "theme": 2,
    "height": 460,
    "layout": "irregular",
    "difficulty": "千张挑战"
  }
];
function unlockedTheme(maxLevel){return maxLevel>=2?2:0;}
module.exports={THEMES,CARDS,LEVELS,unlockedTheme};
