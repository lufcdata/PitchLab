(()=>{
  const gold=window.PitchLabPassingGolden;
  const bible=window.PitchLabMetricBible;
  if(!gold||!bible){
    console.error('[Gold Metric Bible] Passing Golden engine or Bible missing; passing family not attached.');
    return;
  }
  const surfaces=Object.freeze(['pitch','leaders','matchStats']);
  const eventDef=(label,golden,test)=>Object.freeze({label,kind:'event',surfaces,golden:Object.freeze(golden),test,status:'GOLD_LOCKED'});
  const isSuccess=e=>String((e?.outcomeType?.displayName??e?.outcomeType?.name??e?.outcomeType?.value??e?.outcomeType) || '').toLowerCase()==='successful';
  const endInFinalThird=e=>Number(e?.endX)>=200/3;
  const isStatPass=gold.isStatPass;

  const defs=Object.freeze({
    allpasses:eventDef('Total Passes',[411,326],isStatPass),
    successful:eventDef('Successful Passes',[321,232],e=>isStatPass(e)&&isSuccess(e)),
    unsuccessful:eventDef('Unsuccessful Passes',[90,94],e=>isStatPass(e)&&!isSuccess(e)),
    final_third_passes:eventDef('Final Third Passes',[110,92],e=>isStatPass(e)&&endInFinalThird(e)),
    final_third_passes_success:eventDef('Successful Final Third Passes',[72,38],e=>isStatPass(e)&&endInFinalThird(e)&&isSuccess(e))
  });

  if(typeof FILTERS!=='undefined'){
    for(const [key,def] of Object.entries(defs))FILTERS[key]=def.test;
  }
  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,...defs});
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),...Object.keys(defs)])]);

  const passAccuracy=Object.freeze({
    label:'Pass Accuracy',kind:'derived',surfaces:Object.freeze(['matchStats']),status:'GOLD_LOCKED',
    validation:Object.freeze([78.1,71.2]),numerator:'successful',denominator:'allpasses'
  });
  bible.derivedRegistry=Object.freeze({...bible.derivedRegistry,pass_accuracy:passAccuracy});

  window.PitchLabGoldPassingFamily=Object.freeze({
    version:'GOLD_PASSING_FAMILY_V1_2026-08-28',defs,passAccuracy,fixture:'whoscored:1983552'
  });
  document.dispatchEvent(new CustomEvent('pitchlab:gold-passing-family-ready',{
    detail:{version:window.PitchLabGoldPassingFamily.version,keys:Object.freeze(Object.keys(defs))}
  }));
})();
