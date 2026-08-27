(()=>{
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const oc=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const ok=e=>oc(e)!=='unsuccessful';
  const hq=(e,...q)=>typeof hasQ==='function'&&hasQ(e,...q);
  const surfaces=Object.freeze(['pitch','leaders','matchStats']);
  const eventDef=(label,golden,test)=>Object.freeze({label,kind:'event',surfaces,golden:Object.freeze(golden),test,status:'GOLD_LOCKED'});

  // Predicates copied unchanged from the signed-off Golden V2 engine.
  const recovery=e=>['ballrecovery','keeperpickup','claim'].includes(et(e));
  const tackleWon=e=>et(e)==='tackle';
  const groundWon=e=>et(e)==='tackle'||(et(e)==='takeon'&&ok(e))||(et(e)==='foul'&&ok(e)&&!hq(e,'AerialFoul'));
  const aerialWon=e=>(et(e)==='aerial'&&ok(e))||(et(e)==='foul'&&ok(e)&&hq(e,'AerialFoul'));
  const duelsWon=e=>groundWon(e)||aerialWon(e);

  const defs=Object.freeze({
    recoveries:eventDef('Ball Recoveries',[47,43],recovery),
    tackles_won:eventDef('Tackles Won',[8,19],tackleWon),
    ground_duels_won:eventDef('Ground Duels Won',[31,41],groundWon),
    aerial_duels_won:eventDef('Aerial Duels Won',[30,25],aerialWon),
    duels_won:Object.freeze({label:'Duels Won',kind:'event',surfaces,test:duelsWon,status:'DERIVED_FROM_GOLD_COMPONENTS'})
  });

  if(typeof FILTERS!=='undefined'){
    for(const [key,def] of Object.entries(defs))FILTERS[key]=def.test;
  }

  const bible=window.PitchLabMetricBible;
  if(!bible){
    console.error('[Gold Metric Bible] Base registry missing; recovery/duel family not attached.');
    return;
  }
  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,...defs});
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),...Object.keys(defs)])]);

  window.PitchLabGoldRecoveryDuelsFamily=Object.freeze({
    version:'GOLD_RECOVERY_DUELS_FAMILY_V1_2026-08-28',defs,fixture:'whoscored:1983552',
    firstHalf:Object.freeze({recoveries:Object.freeze([23,24])})
  });
  document.dispatchEvent(new CustomEvent('pitchlab:gold-recovery-duels-family-ready',{
    detail:{version:window.PitchLabGoldRecoveryDuelsFamily.version,keys:Object.freeze(Object.keys(defs))}
  }));
})();
