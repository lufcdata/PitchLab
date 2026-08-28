(()=>{
  function label(){
    const clock=window.PitchLabCanonicalTime;if(!clock)return;
    const {lo,hi,max}=clock.bounds();
    const fromLabel=lo<0.5?'0:00':clock.formatClock(lo),toLabel=hi>=max-0.5?'FT':clock.formatClock(hi);
    const leaders=document.getElementById('leadersScope'),team=document.getElementById('team');
    if(leaders){const scope=team?.value==='Both'?'Both Teams':(team?.value||'Both Teams');leaders.textContent=`${scope} · ${fromLabel}–${toLabel}`}
    const stats=document.getElementById('matchStatsScope');if(stats){const text=stats.textContent||'';const prefix=text.includes('·')?text.split('·')[0].trim():'';stats.textContent=prefix?`${prefix} · ${fromLabel}–${toLabel}`:`${fromLabel}–${toLabel}`}
  }
  const rerender=()=>requestAnimationFrame(label);
  document.addEventListener('pitchlab:canonical-time-ready',rerender);document.addEventListener('pitchlab:match-loaded',rerender);
  ['fromRange','toRange','team','metric','player'].forEach(id=>{const el=document.getElementById(id);el?.addEventListener('input',rerender);el?.addEventListener('change',rerender)});
  const root=document.body;new MutationObserver(rerender).observe(root,{childList:true,subtree:true,characterData:true});
  window.PitchLabTimeLabelSync=Object.freeze({version:'TIME_LABEL_SYNC_V1_2026-08-28',refresh:label});rerender();
})();
