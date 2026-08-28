(()=>{
  const bible=window.PitchLabMetricBible;
  const passing=window.PitchLabPassingGolden;
  if(!bible||!passing){
    console.error('[PitchLab] Metric Bible or Golden passing engine missing; directional pass definition not attached.');
    return;
  }

  const outcome=e=>String((e?.outcomeType?.displayName??e?.outcomeType?.name??e?.outcomeType?.value??e?.outcomeType)||'').toLowerCase();
  const isSuccess=e=>outcome(e)==='successful';

  // Headline Opta Forward Passes are the Gold statistical-pass population with
  // positive longitudinal movement. Forest 244 / Leeds 211 is independently
  // confirmed by Forward Pass %: 244/411=59.4%, 211/326=64.7%.
  const isForwardPass=e=>passing.isStatPass(e)&&Number(e?.endX)>Number(e?.x);
  const isSuccessfulForwardPass=e=>isForwardPass(e)&&isSuccess(e);

  // Keep the separate four-way compass reconstruction available for forensic work.
  // It reproduces BBC-displayed 149/135 forward-sector and 69/49 backward-sector
  // values, but these are NOT the headline Opta Forward Pass metric.
  const signedAngle=e=>{
    const x=Number(e?.x),y=Number(e?.y),endX=Number(e?.endX),endY=Number(e?.endY);
    if(![x,y,endX,endY].every(Number.isFinite))return NaN;
    return Math.atan2((endY-y)*0.68,(endX-x)*1.05);
  };
  const compassDirection=e=>{
    const a=signedAngle(e);
    if(!Number.isFinite(a))return null;
    const d=a*180/Math.PI;
    if(d>=-45&&d<45)return 'forward';
    if(d>=45&&d<135)return 'left';
    if(d>=135||d<-135)return 'backward';
    return 'right';
  };
  const isBackwardCompassPass=e=>passing.isStatPass(e)&&compassDirection(e)==='backward';
  const isSuccessfulBackwardCompassPass=e=>isBackwardCompassPass(e)&&isSuccess(e);

  if(typeof FILTERS!=='undefined'){
    FILTERS.forward=isForwardPass;
    FILTERS.forward_success=isSuccessfulForwardPass;
    FILTERS.backward=isBackwardCompassPass;
    FILTERS.backward_success=isSuccessfulBackwardCompassPass;
  }

  const forwardDef=Object.freeze({
    label:'Forward Passes',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'GOLD_LOCKED',
    definition:'Gold statistical pass with positive longitudinal movement (endX > x).',
    controls:Object.freeze({forest:244,leeds:211}),
    percentageControls:Object.freeze({forest:59.4,leeds:64.7}),
    test:isForwardPass
  });
  const backwardDef=Object.freeze({
    label:'Backward Passes',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'DEFINITION_UNDER_INVESTIGATION',
    definition:'Current compatibility predicate uses the backward sector of the separate four-way compass reconstruction; do not treat as a secured headline Opta Backward Pass definition.',
    candidateControls:Object.freeze({forest:69,leeds:49}),
    test:isBackwardCompassPass
  });
  const forwardSuccessDef=Object.freeze({
    label:'Successful Forward Passes',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'RAW_RECONCILED_PENDING_HEADLINE_CONTROL',
    definition:'Headline Forward Pass with successful outcome.',
    observedFixtureCounts:Object.freeze({forest:164,leeds:126}),
    note:'BBC 149-135 is not assumed to be Successful Forward Passes; that hypothesis conflicts with this raw successful headline-forward population and remains unresolved.',
    test:isSuccessfulForwardPass
  });
  const backwardSuccessDef=Object.freeze({
    label:'Successful Backward Passes',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'DEFINITION_UNDER_INVESTIGATION',
    definition:'Successful event in the provisional four-way backward compass sector; parent headline Backward Pass definition is unresolved.',
    observedFixtureCounts:Object.freeze({forest:60,leeds:42}),
    test:isSuccessfulBackwardCompassPass
  });

  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,
    forward:forwardDef,forward_success:forwardSuccessDef,
    backward:backwardDef,backward_success:backwardSuccessDef
  });
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),'forward','forward_success','backward','backward_success'])]);

  window.PitchLabForwardPassDefinition=Object.freeze({
    version:'OPTA_FORWARD_HEADLINE_V3_2026-08-28',
    keys:Object.freeze(['forward','forward_success','backward','backward_success']),
    controls:Object.freeze({forward:Object.freeze({forest:244,leeds:211}),forwardPct:Object.freeze({forest:59.4,leeds:64.7})}),
    candidateControls:Object.freeze({compassForward:Object.freeze({forest:149,leeds:135}),compassBackward:Object.freeze({forest:69,leeds:49})}),
    observations:Object.freeze({forwardSuccess:Object.freeze({forest:164,leeds:126}),compassBackwardSuccess:Object.freeze({forest:60,leeds:42})}),
    compassDirection,test:isForwardPass,backwardTest:isBackwardCompassPass,
    successfulTest:isSuccessfulForwardPass,successfulBackwardTest:isSuccessfulBackwardCompassPass
  });

  document.dispatchEvent(new CustomEvent('pitchlab:forward-pass-definition-ready',{
    detail:{version:window.PitchLabForwardPassDefinition.version,keys:window.PitchLabForwardPassDefinition.keys}
  }));
})();
