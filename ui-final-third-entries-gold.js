(()=>{
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const finalThirdEntry=e=>et(e)==='pass'&&Number.isFinite(Number(e?.x))&&Number.isFinite(Number(e?.endX))&&Number(e.x)<200/3&&Number(e.endX)>=200/3;
  const def=Object.freeze({
    label:'Final Third Entries',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),test:finalThirdEntry,
    validations:Object.freeze({
      'whoscored:1983552':Object.freeze({fixture:'Nottingham Forest 0-1 Leeds',expected:Object.freeze([60,63]),firstHalf:Object.freeze([24,37])}),
      'whoscored:1903384':Object.freeze({fixture:'Bournemouth 2-2 Leeds',expected:Object.freeze([71,53])})
    }),
    status:'GOLD_LOCKED'
  });

  if(typeof FILTERS!=='undefined')FILTERS.final_third_entries=finalThirdEntry;

  const bible=window.PitchLabMetricBible;
  if(bible){
    bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,final_third_entries:def});
    bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),'final_third_entries'])]);
  }

  const sel=document.getElementById('metric');
  if(sel){
    let group=[...sel.querySelectorAll('optgroup')].find(g=>g.label==='Passing');
    if(!group){group=document.createElement('optgroup');group.label='Passing';sel.appendChild(group)}
    let o=sel.querySelector('option[value="final_third_entries"]');
    if(!o){o=document.createElement('option');o.value='final_third_entries';group.appendChild(o)}
    o.textContent='Final Third Entries';
    const into=sel.querySelector('option[value="into_final_third"]');
    if(into)group.insertBefore(o,into);
  }

  window.PitchLabFinalThirdEntriesGold=Object.freeze({version:'FINAL_THIRD_ENTRIES_GOLD_V1_2026-08-27',def,finalThirdEntry});
  document.dispatchEvent(new CustomEvent('pitchlab:final-third-entries-gold-ready',{detail:{version:window.PitchLabFinalThirdEntriesGold.version}}));
})();
