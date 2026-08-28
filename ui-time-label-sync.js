(()=>{
  let queued=false;
  const setText=(el,value)=>{if(el&&el.textContent!==value)el.textContent=value};
  function label(){
    queued=false;const clock=window.PitchLabCanonicalTime;if(!clock)return;
    const {lo,hi,max}=clock.bounds();const fromLabel=lo<0.5?'0:00':clock.formatClock(lo),toLabel=hi>=max-0.5?'FT':clock.formatClock(hi);
    const leaders=document.getElementById('leadersScope'),team=document.getElementById('team');
    if(leaders){const scope=team?.value==='Both'?'Both Teams':(team?.value||'Both Teams');setText(leaders,`${scope} · ${fromLabel}–${toLabel}`)}
    const stats=document.getElementById('matchStatsScope');if(stats){const text=stats.textContent||'',prefix=text.includes('·')?text.split('·')[0].trim():'';setText(stats,prefix?`${prefix} · ${fromLabel}–${toLabel}`:`${fromLabel}–${toLabel}`)}
  }
  const rerender=()=>{if(queued)return;queued=true;requestAnimationFrame(label)};
  document.addEventListener('pitchlab:canonical-time-ready',rerender);document.addEventListener('pitchlab:match-loaded',rerender);
  ['fromRange','toRange','team','metric','player'].forEach(id=>{const el=document.getElementById(id);el?.addEventListener('input',rerender);el?.addEventListener('change',rerender)});
  new MutationObserver(rerender).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.PitchLabTimeLabelSync=Object.freeze({version:'TIME_LABEL_SYNC_V2_2026-08-28',refresh:label});rerender();
})();
