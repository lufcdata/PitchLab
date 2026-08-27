(()=>{
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const hq=(e,...q)=>typeof hasQ==='function'&&hasQ(e,...q);
  const coords=e=>Number.isFinite(Number(e?.x))&&Number.isFinite(Number(e?.y));
  const shotFamily=e=>['goal','missedshots','savedshot','shotonpost'].includes(et(e))&&!hq(e,'OwnGoal');
  const defs=Object.freeze({
    big_chances:Object.freeze({label:'Big Chances',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),test:e=>shotFamily(e)&&hq(e,'BigChance'),validation:Object.freeze({fixture:'whoscored:1903384',expected:Object.freeze([4,1])}),status:'GOLD_LOCKED'}),
    big_chances_created:Object.freeze({label:'Big Chances Created',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),test:e=>hq(e,'BigChanceCreated'),validation:Object.freeze({fixture:'whoscored:1903384',expected:Object.freeze([4,0])}),status:'GOLD_LOCKED'}),
    chances_created:Object.freeze({label:'Chances Created',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),test:e=>hq(e,'KeyPass'),validation:Object.freeze({fixture:'whoscored:1903384',expected:Object.freeze([14,7])}),status:'GOLD_LOCKED'}),
    assists:Object.freeze({label:'Assists',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),test:e=>hq(e,'IntentionalGoalAssist'),validation:Object.freeze({fixture:'whoscored:1903384',expected:Object.freeze([2,0])}),status:'GOLD_LOCKED'}),
    headed_clearances:Object.freeze({label:'Headed Clearances',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),test:e=>et(e)==='clearance'&&coords(e)&&!hq(e,'BlockedCross')&&hq(e,'Head'),validation:Object.freeze({fixture:'whoscored:1903384',expected:Object.freeze([10,38])}),status:'GOLD_LOCKED'})
  });

  // Compatibility bridge: preserve legacy key semantics while introducing explicit stable keys.
  if(typeof FILTERS!=='undefined'){
    FILTERS.big_chances=defs.big_chances.test;
    FILTERS.big_chances_custom=defs.big_chances.test;
    FILTERS.big_chances_created=defs.big_chances_created.test;
    FILTERS.bigchances=defs.big_chances_created.test;
    FILTERS.chances_created=defs.chances_created.test;
    FILTERS.assists=defs.assists.test;
    FILTERS.headed_clearances=defs.headed_clearances.test;
  }

  // Extend the public canonical registry without disturbing the original Forest-Leeds control map.
  const bible=window.PitchLabMetricBible;
  if(bible){
    bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,...defs});
    bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),...Object.keys(defs)])]);
  }

  const sel=document.getElementById('metric');
  if(sel){
    const ensureGroup=label=>{let g=[...sel.querySelectorAll('optgroup')].find(x=>x.label===label);if(!g){g=document.createElement('optgroup');g.label=label;sel.appendChild(g)}return g};
    const ensure=(group,value,text)=>{let o=sel.querySelector(`option[value="${value}"]`);if(!o){o=document.createElement('option');o.value=value;ensureGroup(group).appendChild(o)}o.textContent=text;return o};
    ensure('Attacking','big_chances','Big Chances');
    ensure('Attacking','bigchances','Big Chances Created');
    ensure('Attacking','chances_created','Chances Created');
    ensure('Attacking','assists','Assists');
    ensure('Defensive','headed_clearances','Headed Clearances');
  }

  window.PitchLabGoldAttackingFamily=Object.freeze({version:'GOLD_ATTACKING_DEFENSIVE_5_V1_2026-08-27',defs,fixture:'whoscored:1903384'});
  document.dispatchEvent(new CustomEvent('pitchlab:gold-attacking-family-ready',{detail:{version:window.PitchLabGoldAttackingFamily.version,keys:Object.freeze(Object.keys(defs))}}));
})();
