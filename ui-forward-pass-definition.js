(()=>{
  const bible=window.PitchLabMetricBible;
  const passing=window.PitchLabPassingGolden;
  if(!bible||!passing){
    console.error('[PitchLab] Metric Bible or Golden passing engine missing; Forward Pass definition not attached.');
    return;
  }

  const outcome=e=>String((e?.outcomeType?.displayName??e?.outcomeType?.name??e?.outcomeType?.value??e?.outcomeType)||'').toLowerCase();
  const isSuccess=e=>outcome(e)==='successful';

  const qualifierAngle=e=>{
    for(const q of (e?.qualifiers||[])){
      const t=q?.type||{};
      if(Number(t?.value)===213||String(t?.displayName||'').toLowerCase()==='angle'){
        const a=Number(q?.value);
        if(Number.isFinite(a))return a;
      }
    }
    return NaN;
  };

  const coordinateForward=e=>{
    const x=Number(e?.x),endX=Number(e?.endX);
    return Number.isFinite(x)&&Number.isFinite(endX)&&endX>x;
  };

  // Opta qualifier 213 stores pass angle in radians relative to the attacking direction.
  // A forward pass occupies the forward half-plane: angle < pi/2 or > 3pi/2.
  // Coordinate fallback is the exact geometric equivalent: endX > x.
  const isForwardDirection=e=>{
    const a=qualifierAngle(e);
    if(!Number.isFinite(a))return coordinateForward(e);
    const twoPi=Math.PI*2;
    const n=((a%twoPi)+twoPi)%twoPi;
    return n<Math.PI/2||n>3*Math.PI/2;
  };

  const isForwardPass=e=>passing.isStatPass(e)&&isForwardDirection(e);
  const isSuccessfulForwardPass=e=>isForwardPass(e)&&isSuccess(e);

  if(typeof FILTERS!=='undefined'){
    FILTERS.forward=isForwardPass;
    FILTERS.forward_success=isSuccessfulForwardPass;
  }

  const forwardDef=Object.freeze({
    label:'Forward Passes',
    kind:'event',
    surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'GOLD_LOCKED',
    definition:'Statistical pass whose Opta Angle qualifier lies in the forward half-plane (within 90 degrees of the attacking direction); coordinate fallback endX > x.',
    controls:Object.freeze({forest:244,leeds:211}),
    test:isForwardPass
  });

  const forwardSuccessDef=Object.freeze({
    label:'Successful Forward Passes',
    kind:'event',
    surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'DERIVED_FROM_GOLD_COMPONENTS_PENDING_HEADLINE_CONTROL',
    definition:'Forward Pass with successful outcome.',
    observedFixtureCounts:Object.freeze({forest:164,leeds:126}),
    test:isSuccessfulForwardPass
  });

  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,forward:forwardDef,forward_success:forwardSuccessDef});
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),'forward','forward_success'])]);

  window.PitchLabForwardPassDefinition=Object.freeze({
    version:'FORWARD_PASS_ANGLE_V1_2026-08-28',
    keys:Object.freeze(['forward','forward_success']),
    controls:Object.freeze({forest:244,leeds:211}),
    test:isForwardPass,
    successfulTest:isSuccessfulForwardPass
  });

  document.dispatchEvent(new CustomEvent('pitchlab:forward-pass-definition-ready',{
    detail:{version:window.PitchLabForwardPassDefinition.version,keys:window.PitchLabForwardPassDefinition.keys}
  }));
})();
