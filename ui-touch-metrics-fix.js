(()=>{
  function install(){
    if(typeof FILTERS==='undefined')return false;
    const isTouch=e=>e?.isTouch===true;
    const inOppBox=e=>isTouch(e)&&Number.isFinite(Number(e?.x))&&Number(e.x)>=((105-16.5)/105*100);
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