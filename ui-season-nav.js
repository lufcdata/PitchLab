(()=>{
  const parentPath=()=>{try{return new URL(window.parent.location.href).pathname}catch(_){return location.pathname}};
  const go=path=>{try{window.parent.location.href=path}catch(_){location.href=path}};
  const install=()=>{
    const nav=document.querySelector('.nav');if(!nav)return;
    const path=parentPath(),isSeason=/season-performance\.html$/i.test(path),isCompared=/matches-compared\.html$/i.test(path);
    let season=[...nav.querySelectorAll('button')].find(b=>b.dataset.seasonNav==='1');
    if(!season){season=document.createElement('button');season.type='button';season.textContent='Season Performance';season.dataset.seasonNav='1';season.addEventListener('click',()=>go('season-performance.html'));nav.appendChild(season)}
    let compared=[...nav.querySelectorAll('button')].find(b=>b.dataset.matchesComparedNav==='1');
    if(!compared){compared=document.createElement('button');compared.type='button';compared.textContent='Matches Compared';compared.dataset.matchesComparedNav='1';compared.addEventListener('click',()=>go('matches-compared.html'));nav.appendChild(compared)}
    const pitch=[...nav.querySelectorAll('button')].find(b=>b.textContent.trim()==='Pitch Events');
    if(pitch&&!pitch.dataset.pitchEventsNav){pitch.dataset.pitchEventsNav='1';pitch.addEventListener('click',()=>{if(isSeason||isCompared)go('index.html')})}
    nav.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
    (isCompared?compared:isSeason?season:pitch)?.classList.add('active');
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();