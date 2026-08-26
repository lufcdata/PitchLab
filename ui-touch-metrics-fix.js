(()=>{
  function install(){
    if(typeof FILTERS==='undefined')return false;
    const isTouch=e=>e?.isTouch===true&&Number.isFinite(Number(e?.x))&&Number.isFinite(Number(e?.y));
    const inOppBox=e=>isTouch(e)&&Number(e.x)>=83&&Number(e.x)<=100&&Number(e.y)>=21.1&&Number(e.y)<=78.9;
    FILTERS.touches=isTouch;
    FILTERS.touch_box=inOppBox;
    return true;
  }
  if(install())return;
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    if(install()||tries>100)clearInterval(timer);
  },25);
})();