(()=>{
  const bible=window.PitchLabMetricBible;
  const passing=window.PitchLabPassingGolden;
  if(!bible||!passing){
    console.error('[PitchLab] Metric Bible or Golden passing engine missing; directional pass definition not attached.');
    return;
  }

  const outcome=e=>String((e?.outcomeType?.displayName??e?.outcomeType?.name??e?.outcomeType?.value??e?.outcomeType)||'').toLowerCase();
  const isSuccess=e=>outcome(e)==='successful';

  // Use the full-precision event coordinates for directional boundaries. WhoScored's
  // qualifier 213 Angle is rounded and can move boundary events into the wrong sector.
  // Physical 105 x 68 scaling preserves the provider geometry represented by q213.
  const signedAngle=e=>{
    const x=Number(e?.x),y=Number(e?.y),endX=Number(e?.endX),endY=Number(e?.endY);
    if(![x,y,endX,endY].every(Number.isFinite))return NaN;
    return Math.atan2((endY-y)*0.68,(endX-x)*1.05);
  };

  // Opta/BBC directional controls for Forest 0-1 Leeds reconcile exactly when the
  // statistical-pass population is split into four 90-degree sectors:
  // Forward +/-45; Left 45..135; Backward >135 from forward; Right -135..-45.
  const direction=e=>{
    const a=signedAngle(e);
    if(!Number.isFinite(a))return null;
    const d=a*180/Math.PI;
    if(d>=-45&&d<45)return 'forward';
    if(d>=45&&d<135)return 'left';
    if(d>=135||d<-135)return 'backward';
    return 'right';
  };

  const isDirectionalPass=e=>passing.isStatPass(e);
  const isForwardPass=e=>isDirectionalPass(e)&&direction(e)==='forward';
  const isBackwardPass=e=>isDirectionalPass(e)&&direction(e)==='backward';
  const isSuccessfulForwardPass=e=>isForwardPass(e)&&isSuccess(e);
  const isSuccessfulBackwardPass=e=>isBackwardPass(e)&&isSuccess(e);

  if(typeof FILTERS!=='undefined'){
    FILTERS.forward=isForwardPass;
    FILTERS.forward_success=isSuccessfulForwardPass;
    FILTERS.backward=isBackwardPass;
    FILTERS.backward_success=isSuccessfulBackwardPass;
  }

  const forwardDef=Object.freeze({
    label:'Forward Passes',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'GOLD_LOCKED',
    definition:'Statistical pass whose full-precision coordinate-derived direction is within 45 degrees of straight forward.',
    controls:Object.freeze({forest:149,leeds:135}),test:isForwardPass
  });
  const backwardDef=Object.freeze({
    label:'Backward Passes',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'GOLD_LOCKED',
    definition:'Statistical pass whose full-precision coordinate-derived direction is within 45 degrees of straight backward.',
    controls:Object.freeze({forest:69,leeds:49}),test:isBackwardPass
  });
  const forwardSuccessDef=Object.freeze({
    label:'Successful Forward Passes',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'DERIVED_FROM_GOLD_COMPONENTS_PENDING_HEADLINE_CONTROL',
    definition:'Forward Pass with successful outcome.',
    observedFixtureCounts:Object.freeze({forest:85,leeds:68}),
    test:isSuccessfulForwardPass
  });
  const backwardSuccessDef=Object.freeze({
    label:'Successful Backward Passes',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'DERIVED_FROM_GOLD_COMPONENTS_PENDING_HEADLINE_CONTROL',
    definition:'Backward Pass with successful outcome.',
    observedFixtureCounts:Object.freeze({forest:60,leeds:42}),
    test:isSuccessfulBackwardPass
  });

  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,
    forward:forwardDef,forward_success:forwardSuccessDef,
    backward:backwardDef,backward_success:backwardSuccessDef
  });
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),'forward','forward_success','backward','backward_success'])]);

  window.PitchLabForwardPassDefinition=Object.freeze({
    version:'OPTA_DIRECTIONAL_PASS_V2_2026-08-28',
    keys:Object.freeze(['forward','forward_success','backward','backward_success']),
    controls:Object.freeze({forward:Object.freeze({forest:149,leeds:135}),backward:Object.freeze({forest:69,leeds:49})}),
    observations:Object.freeze({forwardSuccess:Object.freeze({forest:85,leeds:68}),backwardSuccess:Object.freeze({forest:60,leeds:42})}),
    direction,test:isForwardPass,backwardTest:isBackwardPass,
    successfulTest:isSuccessfulForwardPass,successfulBackwardTest:isSuccessfulBackwardPass
  });

  document.dispatchEvent(new CustomEvent('pitchlab:forward-pass-definition-ready',{
    detail:{version:window.PitchLabForwardPassDefinition.version,keys:window.PitchLabForwardPassDefinition.keys}
  }));
})();
