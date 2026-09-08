(()=>{
  const install=()=>{
    const nav=document.querySelector('.nav');if(!nav||nav.dataset.seasonLink==='1')return;
    nav.dataset.seasonLink='1';
    const b=document.createElement('button');b.type='button';b.textContent='Season Performance';b.dataset.seasonNav='1';
    b.addEventListener('click',()=>{window.parent.location.href='season-performance.html'});
    nav.appendChild(b);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();