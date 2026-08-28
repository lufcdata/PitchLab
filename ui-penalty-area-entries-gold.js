(()=>{
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const BOX_X=((105-16.5)/105)*100;
  const BOX_Y_MIN=21.1,BOX_Y_MAX=78.9;
  const hasCoords=(x,y)=>Number.isFinite(Number(x))&&Number.isFinite(Number(y));
  const inBox=(x,y)=>hasCoords(x,y)&&Number(x)>=BOX_X&&Number(y)>=BOX_Y_MIN&&Number(y)<=BOX_Y_MAX;
  const penaltyAreaEntry=e=>et(e)==='pass'&&hasCoords(e?.x,e?.y)&&hasCoords(e?.endX,e?.endY)&&!inBox(e.x,e.y)&&inBox(e.endX,e.endY);

  const def=Object.freeze({
    label:'Penalty Area Entries',
    kind:'event',
    surfaces:Object.freeze(['pitch','leaders','matchStats']),
    test:penaltyAreaEntry,
    validations:Object.freeze({
      'whoscored:1983552':Object.freeze({fixture:'Nottingham Forest 0-1 Leeds',expected:Object.freeze([36,21])})
    }),
    status:'GOLD_LOCKED',
    notes:'All pass attempts crossing from outside the opposition penalty area to inside it; pass outcome is not part of the definition.'
  });

  if(typeof FILTERS!=='undefined')FILTERS.penalty_area_entries=penaltyAreaEntry;

  const bible=window.PitchLabMetricBible;
  if(bible){
    bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,penalty_area_entries:def});
    bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),'penalty_area_entries'])]);
  }

  const sel=document.getElementById('metric');
  if(sel){
    let group=[...sel.querySelectorAll('optgroup')].find(g=>g.label==='Passing');
    if(!group){group=document.createElement('optgroup');group.label='Passing';sel.appendChild(group)}
    let o=sel.querySelector('option[value="penalty_area_entries"]');
    if(!o){o=document.createElement('option');o.value='penalty_area_entries';group.appendChild(o)}
    o.textContent='Penalty Area Entries';
  }

  if(typeof lineMetric==='function'){
    const baseLineMetric=lineMetric;
    lineMetric=key=>baseLineMetric(key)||key==='penalty_area_entries';
  }

  window.PitchLabPenaltyAreaEntriesGold=Object.freeze({
    version:'PENALTY_AREA_ENTRIES_GOLD_V1_2026-08-28',def,penaltyAreaEntry,
    geometry:Object.freeze({xMin:BOX_X,yMin:BOX_Y_MIN,yMax:BOX_Y_MAX})
  });
  document.dispatchEvent(new CustomEvent('pitchlab:penalty-area-entries-gold-ready',{detail:{version:window.PitchLabPenaltyAreaEntriesGold.version}}));
})();
