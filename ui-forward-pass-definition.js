(()=>{
  const bible=window.PitchLabMetricBible;
  const passing=window.PitchLabPassingGolden;
  if(!bible||!passing){
    console.error('[PitchLab] Metric Bible or Golden passing engine missing; directional pass definition not attached.');
    return;
  }

  const outcome=e=>String((e?.outcomeType?.displayName??e?.outcomeType?.name??e?.outcomeType?.value??e?.outcomeType)||'').toLowerCase();
  const isSuccess=e=>outcome(e)==='successful';

  // HEADLINE FORWARD PASS
  // This is a separate Opta concept from the mutually-exclusive directional taxonomy below.
  // Forest 244 / Leeds 211 = Gold statistical passes with positive longitudinal movement.
  const isForwardPass=e=>passing.isStatPass(e)&&Number(e?.endX)>Number(e?.x);
  const isSuccessfulForwardPass=e=>isForwardPass(e)&&isSuccess(e);

  // OPTA DIRECTIONAL PASS TAXONOMY
  // Use physical pitch scaling (105m x 68m) before applying +/-45 degree sectors.
  // The three user-facing direction buckets are Forward, Sideways and Backward; left/right
  // lateral sectors are combined as Sideways. They form an exact partition of isStatPass.
  // Forest: 149 forward + 193 sideways + 69 backward = 411.
  // Leeds:  135 forward + 142 sideways + 49 backward = 326.
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
    if(d>=45&&d<135)return 'side';
    if(d>=135||d<-135)return 'backward';
    return 'side';
  };
  const isDirectionalForwardPass=e=>passing.isStatPass(e)&&compassDirection(e)==='forward';
  const isSidePass=e=>passing.isStatPass(e)&&compassDirection(e)==='side';
  const isBackwardPass=e=>passing.isStatPass(e)&&compassDirection(e)==='backward';
  const isSuccessfulSidePass=e=>isSidePass(e)&&isSuccess(e);
  const isSuccessfulBackwardPass=e=>isBackwardPass(e)&&isSuccess(e);

  if(typeof FILTERS!=='undefined'){
    FILTERS.forward=isForwardPass;
    FILTERS.forward_success=isSuccessfulForwardPass;
    FILTERS.side=isSidePass;
    FILTERS.side_success=isSuccessfulSidePass;
    FILTERS.backward=isBackwardPass;
    FILTERS.backward_success=isSuccessfulBackwardPass;
  }

  const forwardDef=Object.freeze({
    label:'Forward Passes',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'GOLD_LOCKED',
    definition:'Headline Opta Forward Pass: Gold statistical pass with positive longitudinal movement (endX > x). This is not the directional Forward sector.',
    controls:Object.freeze({forest:244,leeds:211}),
    percentageControls:Object.freeze({forest:59.4,leeds:64.7}),
    test:isForwardPass
  });
  const forwardSuccessDef=Object.freeze({
    label:'Successful Forward Passes',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'RAW_RECONCILED_PENDING_HEADLINE_CONTROL',
    definition:'Headline Forward Pass with successful outcome.',
    observedFixtureCounts:Object.freeze({forest:164,leeds:126}),
    test:isSuccessfulForwardPass
  });
  const sideDef=Object.freeze({
    label:'Side Passes',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'GOLD_LOCKED',
    definition:'Gold statistical pass in either lateral +/-45-to-135 degree physical-pitch sector; the two lateral sectors are combined as Sideways.',
    controls:Object.freeze({forest:193,leeds:142}),
    partitionProof:'Forest 149+193+69=411; Leeds 135+142+49=326.',
    test:isSidePass
  });
  const backwardDef=Object.freeze({
    label:'Backward Passes',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'GOLD_LOCKED',
    definition:'Gold statistical pass in the backward +/-45 degree sector around the direction toward own goal, using physical 105m x 68m pitch scaling.',
    controls:Object.freeze({forest:69,leeds:49}),
    partitionProof:'Forest 149+193+69=411; Leeds 135+142+49=326.',
    test:isBackwardPass
  });
  const sideSuccessDef=Object.freeze({
    label:'Successful Side Passes',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'RAW_RECONCILED_PENDING_HEADLINE_CONTROL',
    definition:'Successful pass in the Gold directional Sideways population.',
    observedFixtureCounts:Object.freeze({forest:171,leeds:120}),
    test:isSuccessfulSidePass
  });
  const backwardSuccessDef=Object.freeze({
    label:'Successful Backward Passes',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'RAW_RECONCILED_PENDING_HEADLINE_CONTROL',
    definition:'Successful pass in the Gold directional Backward population.',
    observedFixtureCounts:Object.freeze({forest:65,leeds:44}),
    test:isSuccessfulBackwardPass
  });

  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,
    forward:forwardDef,forward_success:forwardSuccessDef,
    side:sideDef,side_success:sideSuccessDef,
    backward:backwardDef,backward_success:backwardSuccessDef
  });
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),'forward','forward_success','side','side_success','backward','backward_success'])]);

  window.PitchLabForwardPassDefinition=Object.freeze({
    version:'OPTA_PASS_DIRECTION_V4_2026-08-28',
    keys:Object.freeze(['forward','forward_success','side','side_success','backward','backward_success']),
    headlineControls:Object.freeze({forward:Object.freeze({forest:244,leeds:211}),forwardPct:Object.freeze({forest:59.4,leeds:64.7})}),
    directionalControls:Object.freeze({
      forward:Object.freeze({forest:149,leeds:135}),
      side:Object.freeze({forest:193,leeds:142}),
      backward:Object.freeze({forest:69,leeds:49}),
      total:Object.freeze({forest:411,leeds:326})
    }),
    observations:Object.freeze({
      headlineForwardSuccess:Object.freeze({forest:164,leeds:126}),
      directionalSideSuccess:Object.freeze({forest:171,leeds:120}),
      directionalBackwardSuccess:Object.freeze({forest:65,leeds:44})
    }),
    compassDirection,directionalForwardTest:isDirectionalForwardPass,
    test:isForwardPass,backwardTest:isBackwardPass,sideTest:isSidePass,
    successfulTest:isSuccessfulForwardPass,successfulBackwardTest:isSuccessfulBackwardPass,successfulSideTest:isSuccessfulSidePass
  });

  document.dispatchEvent(new CustomEvent('pitchlab:forward-pass-definition-ready',{
    detail:{version:window.PitchLabForwardPassDefinition.version,keys:window.PitchLabForwardPassDefinition.keys}
  }));
})();
