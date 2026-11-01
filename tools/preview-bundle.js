
function bundle(source,kind){return '(function(){const module={exports:{}};const require=()=>window.CARD_DATA;\n'+source+'\nwindow.'+(kind==='cards'?'CARD_DATA':'GAME_ENGINE')+'=module.exports;})();';}
module.exports={bundle};
