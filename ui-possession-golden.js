(()=>{
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const eventType=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const has=(e,...qs)=>typeof hasQ==='function'&&hasQ(e,...qs);
  const sec=e=>Number(e?.minute||0)*60+Number(e?.second||0);

  // LOCKED GOLDEN POSSESSION V1
  // WhoScored / Opta possession unit = Pass event excluding ThrowIn.
  // Forest v Leeds (1983552): FT 56.3-43.7, 1H 51.9-48.1, 2H 60.7-39.3.
  const possessionUnit=e=>eventType(e)==='pass'&&!has(e,'ThrowIn');

  function windowEvents(){
    if(typeof events==='undefined'||!Array.isArray(events))return [];
    const from=document.getElementById('fromRange'),to=document.getElementById('toRange');
    if(!from||!to)return events;
    const max=Math.max(5400,...events.map(sec));
    let a=+from.value,b=+to.value;if(b<=a)b=Math.min(100,a+1);
    const lo=a/100*max,hi=b/100*max;
    return events.filter(e=>sec(e)>=lo&&sec(e)<=hi);
  }
  function teamCount(list,name){
    return list.filter(e=>typeof teamName==='function'&&teamName(e)===name&&possessionUnit(e)).length;
  }
  function pair(list,home,away){
    const h=teamCount(list,home),a=teamCount(list,away),total=h+a;
    return total?[h/total*100,a/total*100]:[0,0];
  }
  function patch(){
    const body=document.getElementById('matchStatsBody');
    if(!body||typeof raw==='undefined'||!raw)return;
    const row=[...body.querySelectorAll('.match-stats-row')].find(r=>r.querySelector('.match-stats-row__label')?.textContent?.trim()==='Possession');
    if(!row)return;
    const home=raw.home?.name,away=raw.away?.name;if(!home||!away)return;
    const [h,a]=pair(windowEvents(),home,away);
    // Match Stats pct rows add the % presentation themselves. Keep the Golden values numeric
    // here so the UI renders 56.3% rather than 56.3%%.
    const hv=row.querySelector('.match-stats-row__value--home'),av=row.querySelector('.match-stats-row__value--away');
    if(hv)hv.textContent=h.toFixed(1);
    if(av)av.textContent=a.toFixed(1);
    const bars=row.querySelectorAll('.match-stats-row__bar');
    if(bars[0])bars[0].style.width=`${h}%`;
    if(bars[1])bars[1].style.width=`${a}%`;
  }

  window.PitchLabPossession={
    version:'POSSESSION_GOLDEN_V1_2026-08-27',
    possessionUnit,pair,
    definition:'Pass events excluding ThrowIn; team share of both teams possession units',
    forestLeedsControls:{full:[56.3,43.7],firstHalf:[51.9,48.1],secondHalf:[60.7,39.3]}
  };

  setInterval(patch,350);
  ['fromRange','toRange'].forEach(id=>document.getElementById(id)?.addEventListener('input',patch));
  document.addEventListener('click',()=>setTimeout(patch,0));
  setTimeout(patch,0);
})();