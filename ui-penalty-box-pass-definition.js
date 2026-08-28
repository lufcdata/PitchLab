(()=>{
  const bible=window.PitchLabMetricBible;
  const passing=window.PitchLabPassingGolden;
  if(!bible||!passing){
    console.error('[PitchLab] Metric Bible or Golden passing engine missing; penalty-box pass definition not attached.');
    return;
  }

  const outcome=e=>String((e?.outcomeType?.displayName??e?.outcomeType?.name??e?.outcomeType?.value??e?.outcomeType)||'').toLowerCase();
  const isSuccess=e=>outcome(e)==='successful';
  const endInOppBox=e=>{
    const x=Number(e?.endX),y=Number(e?.endY);
    return Number.isFinite(x)&&Number.isFinite(y)&&x>=83&&x<=100&&y>=21.1&&y<=78.9;
  };
  const isBoxPass=e=>passing.isStatPass(e)&&endInOppBox(e);
  const isSuccessfulBoxPass=e=>isBoxPass(e)&&isSuccess(e);
  const isUnsuccessfulBoxPass=e=>isBoxPass(e)&&!isSuccess(e);

  if(typeof FILTERS!=='undefined'){
    FILTERS.box_passes=isBoxPass;
    FILTERS.box_passes_success=isSuccessfulBoxPass;
    FILTERS.box_passes_unsuccess=isUnsuccessfulBoxPass;
  }

  const surfaces=Object.freeze(['pitch','leaders','matchStats']);
  const totalDef=Object.freeze({
    label:'Passes Into Penalty Box',kind:'event',surfaces,
    status:'AUTHORITATIVE_DEFINITION_PENDING_GOLD_CONTROL',
    definition:'Gold statistical pass whose end coordinate is inside the opposition penalty area (x 83-100, y 21.1-78.9).',
    observedFixtureCounts:Object.freeze({forest:22,leeds:15}),
    test:isBoxPass
  });
  const successDef=Object.freeze({
    label:'Successful Passes Into Penalty Box',kind:'event',surfaces,
    status:'AUTHORITATIVE_DEFINITION_PENDING_GOLD_CONTROL',
    definition:'Successful outcome within the canonical Passes Into Penalty Box population.',
    observedFixtureCounts:Object.freeze({forest:9,leeds:3}),
    test:isSuccessfulBoxPass
  });
  const unsuccessDef=Object.freeze({
    label:'Unsuccessful Passes Into Penalty Box',kind:'event',surfaces,
    status:'AUTHORITATIVE_DEFINITION_PENDING_GOLD_CONTROL',
    definition:'Unsuccessful outcome within the canonical Passes Into Penalty Box population.',
    observedFixtureCounts:Object.freeze({forest:13,leeds:12}),
    checksum:'9+13=22; 3+12=15.',
    test:isUnsuccessfulBoxPass
  });

  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,
    box_passes:totalDef,box_passes_success:successDef,box_passes_unsuccess:unsuccessDef
  });
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),'box_passes','box_passes_success','box_passes_unsuccess'])]);

  const metricSelect=document.getElementById('metric');
  if(metricSelect){
    const total=metricSelect.querySelector('option[value="box_passes"]');
    if(total)total.textContent='Passes Into Penalty Box';
    const success=metricSelect.querySelector('option[value="box_passes_success"]');
    if(success)success.textContent='Successful Passes Into Penalty Box';
  }

  window.PitchLabPenaltyBoxPassDefinition=Object.freeze({
    version:'PENALTY_BOX_PASS_V1_2026-08-28',
    keys:Object.freeze(['box_passes','box_passes_success','box_passes_unsuccess']),
    box:Object.freeze({minX:83,maxX:100,minY:21.1,maxY:78.9}),
    observations:Object.freeze({total:Object.freeze({forest:22,leeds:15}),successful:Object.freeze({forest:9,leeds:3}),unsuccessful:Object.freeze({forest:13,leeds:12})}),
    test:isBoxPass,successfulTest:isSuccessfulBoxPass,unsuccessfulTest:isUnsuccessfulBoxPass
  });

  document.dispatchEvent(new CustomEvent('pitchlab:penalty-box-pass-definition-ready',{detail:{version:window.PitchLabPenaltyBoxPassDefinition.version}}));
})();
