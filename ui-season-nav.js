(()=>{
  const parentPath=()=>{try{return new URL(window.parent.location.href).pathname}catch(_){return location.pathname}};
  const go=path=>{try{window.parent.location.href=path}catch(_){location.href=path}};
  const install=()=>{
    const nav=document.querySelector('.nav');if(!nav)return;
    const isSeason=/season-performance\.html$/i.test(parentPath());
    let season=[...nav.querySelectorAll('button')].find(b=>b.dataset.seasonNav==='1');
    if(!season){
      season=document.createElement('button');season.type='button';season.textContent='Season Performance';season.dataset.seasonNav='1';
      season.addEventListener('click',()=>go('season-performance.html'));
      nav.appendChild(season);
    }
    const pitch=[...nav.querySelectorAll('button')].find(b=>b.textContent.trim()==='Pitch Events');
    if(pitch&&!pitch.dataset.pitchEventsNav){
      pitch.dataset.pitchEventsNav='1';
      pitch.addEventListener('click',()=>{if(isSeason)go('index.html')});
    }
    nav.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
    (isSeason?season:pitch)?.classList.add('active');
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();