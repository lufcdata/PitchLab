(()=>{
  const bible=window.PitchLabMetricBible;
  const passing=window.PitchLabPassingGolden;
  if(!bible||!passing){
    console.error('[PitchLab] Metric Bible or Golden passing engine missing; Progressive Pass definition not attached.');
    return;
  }

  const outcome=e=>String((e?.outcomeType?.displayName??e?.outcomeType?.name??e?.outcomeType?.value??e?.outcomeType)||'').toLowerCase();
  const isSuccess=e=>outcome(e)==='successful';
  const ATTACKING_TWO_THIRDS_X=100/3;

  // WhoScored coordinates are percentages. Convert to PitchLab's 105m x 68m pitch
  // before comparing distance to the centre of the opposition goal (100, 50).
  const distanceToGoal=e=>{
    const x=Number(e?.x),y=Number(e?.y);
    if(!Number.isFinite(x)||!Number.isFinite(y))return NaN;
    return Math.hypot((100-x)*1.05,(50-y)*0.68);
  };
  const endDistanceToGoal=e=>{
    const x=Number(e?.endX),y=Number(e?.endY);
    if(!Number.isFinite(x)||!Number.isFinite(y))return NaN;
    return Math.hypot((100-x)*1.05,(50-y)*0.68);
  };

  const isProgressivePass=e=>{
    if(!passing.isStatPass(e)||!isSuccess(e)||Number(e?.x)<ATTACKING_TWO_THIRDS_X)return false;
    const start=distanceToGoal(e),end=endDistanceToGoal(e);
    return Number.isFinite(start)&&start>0&&Number.isFinite(end)&&end<=start*0.75;
  };

  if(typeof FILTERS!=='undefined')FILTERS.progressive=isProgressivePass;

  const progressiveDef=Object.freeze({
    label:'Progressive Passes',
    kind:'event',
    surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'AUTHORITATIVE_DEFINITION_PENDING_GOLD_CONTROL',
    definition:'Completed statistical pass starting in the attacking two-thirds that finishes at least 25% closer to the centre of the opposition goal.',
    observedFixtureCounts:Object.freeze({forest:27,leeds:8}),
    test:isProgressivePass
  });

  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,progressive:progressiveDef});
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),'progressive'])]);

  const option=document.querySelector('#metric option[value="progressive"]');
  if(option)option.textContent='Progressive Passes';

  window.PitchLabProgressivePassDefinition=Object.freeze({
    version:'PROGRESSIVE_PASS_25_PERCENT_V1_2026-08-28',
    key:'progressive',
    startX:ATTACKING_TWO_THIRDS_X,
    requiredDistanceReduction:0.25,
    observedFixtureCounts:Object.freeze({forest:27,leeds:8}),
    test:isProgressivePass
  });

  document.dispatchEvent(new CustomEvent('pitchlab:progressive-pass-definition-ready',{
    detail:{version:window.PitchLabProgressivePassDefinition.version,key:'progressive'}
  }));
})();
