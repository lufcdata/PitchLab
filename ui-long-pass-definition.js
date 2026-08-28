(()=>{
  const bible=window.PitchLabMetricBible;
  const passing=window.PitchLabPassingGolden;
  if(!bible||!passing){
    console.error('[PitchLab] Metric Bible or Golden passing engine missing; Long Ball definition not attached.');
    return;
  }
  const hasQualifier=(e,name)=>(e?.qualifiers||[]).some(q=>String(q?.type?.displayName||'').toLowerCase()===name.toLowerCase());
  const outcome=e=>String((e?.outcomeType?.displayName??e?.outcomeType?.name??e?.outcomeType?.value??e?.outcomeType)||'').toLowerCase();
  const isLongBall=e=>passing.isStatPass(e)&&hasQualifier(e,'Longball');
  const isAccurateLongBall=e=>isLongBall(e)&&outcome(e)==='successful';
  const isInaccurateLongBall=e=>isLongBall(e)&&outcome(e)!=='successful';

  if(typeof FILTERS!=='undefined'){
    FILTERS.long_passes=isLongBall;
    FILTERS.accurate_long_passes=isAccurateLongBall;
    FILTERS.inaccurate_long_passes=isInaccurateLongBall;
  }

  const totalDef=Object.freeze({
    label:'Total Long Balls',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'GOLD_LOCKED',
    definition:'Gold statistical pass carrying Opta/WhoScored Longball qualifier.',
    controls:Object.freeze({forest:71,leeds:58}),test:isLongBall
  });
  const accurateDef=Object.freeze({
    label:'Accurate Long Balls',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'DERIVED_FROM_GOLD_COMPONENTS_PENDING_HEADLINE_CONTROL',
    definition:'Total Long Ball with successful outcome.',test:isAccurateLongBall
  });
  const inaccurateDef=Object.freeze({
    label:'Inaccurate Long Balls',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'DERIVED_FROM_GOLD_COMPONENTS_PENDING_HEADLINE_CONTROL',
    definition:'Total Long Ball with unsuccessful outcome.',test:isInaccurateLongBall
  });

  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,
    long_passes:totalDef,accurate_long_passes:accurateDef,inaccurate_long_passes:inaccurateDef
  });
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),'long_passes','accurate_long_passes','inaccurate_long_passes'])]);
  window.PitchLabLongPassDefinition=Object.freeze({version:'OPTA_LONG_BALL_V1_2026-08-28',controls:Object.freeze({forest:71,leeds:58}),test:isLongBall,accurateTest:isAccurateLongBall,inaccurateTest:isInaccurateLongBall});
  document.dispatchEvent(new CustomEvent('pitchlab:long-pass-definition-ready',{detail:{version:window.PitchLabLongPassDefinition.version}}));
})();
