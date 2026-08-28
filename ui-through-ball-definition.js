(()=>{
  const bible=window.PitchLabMetricBible;
  const passing=window.PitchLabPassingGolden;
  if(!bible||!passing){
    console.error('[PitchLab] Metric Bible or Golden passing engine missing; Through Ball definition not attached.');
    return;
  }

  const hasQualifier=(e,name)=>(e?.qualifiers||[]).some(q=>String(q?.type?.displayName||'').toLowerCase()===name.toLowerCase());
  const outcome=e=>String((e?.outcomeType?.displayName??e?.outcomeType?.name??e?.outcomeType?.value??e?.outcomeType)||'').toLowerCase();
  const isSuccess=e=>outcome(e)==='successful';
  const isThroughBall=e=>passing.isStatPass(e)&&hasQualifier(e,'Throughball');
  const isSuccessfulThroughBall=e=>isThroughBall(e)&&isSuccess(e);
  const isUnsuccessfulThroughBall=e=>isThroughBall(e)&&!isSuccess(e);

  if(typeof FILTERS!=='undefined'){
    FILTERS.through_balls=isThroughBall;
    FILTERS.through_balls_success=isSuccessfulThroughBall;
    FILTERS.through_balls_unsuccess=isUnsuccessfulThroughBall;
  }

  const surfaces=Object.freeze(['pitch','leaders','matchStats']);
  const totalDef=Object.freeze({
    label:'Through Balls',kind:'event',surfaces,
    status:'GOLD_LOCKED',
    definition:'Gold statistical pass carrying Opta/WhoScored Throughball qualifier.',
    controls:Object.freeze({forest:2,leeds:0}),
    test:isThroughBall
  });
  const successDef=Object.freeze({
    label:'Successful Through Balls',kind:'event',surfaces,
    status:'DERIVED_FROM_GOLD_COMPONENTS',
    definition:'Successful outcome within the Gold Through Ball population.',
    validation:Object.freeze({forest:1,leeds:0}),
    checksum:'Forest 1 successful + 1 unsuccessful = 2 total; Leeds 0 + 0 = 0.',
    test:isSuccessfulThroughBall
  });
  const unsuccessDef=Object.freeze({
    label:'Unsuccessful Through Balls',kind:'event',surfaces,
    status:'DERIVED_FROM_GOLD_COMPONENTS',
    definition:'Unsuccessful outcome within the Gold Through Ball population.',
    validation:Object.freeze({forest:1,leeds:0}),
    checksum:'Forest 1 successful + 1 unsuccessful = 2 total; Leeds 0 + 0 = 0.',
    test:isUnsuccessfulThroughBall
  });

  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,
    through_balls:totalDef,through_balls_success:successDef,through_balls_unsuccess:unsuccessDef
  });
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),'through_balls','through_balls_success','through_balls_unsuccess'])]);

  const metricSelect=document.getElementById('metric');
  if(metricSelect){
    let group=[...metricSelect.querySelectorAll('optgroup')].find(g=>g.label==='Passing');
    if(!group){group=document.createElement('optgroup');group.label='Passing';metricSelect.appendChild(group)}
    const ensure=(value,label)=>{
      let o=metricSelect.querySelector(`option[value="${value}"]`);
      if(!o){o=document.createElement('option');o.value=value;group.appendChild(o)}
      o.textContent=label;
    };
    ensure('through_balls','Through Balls');
    ensure('through_balls_success','Successful Through Balls');
    ensure('through_balls_unsuccess','Unsuccessful Through Balls');
  }

  window.PitchLabThroughBallDefinition=Object.freeze({
    version:'OPTA_THROUGH_BALL_V2_2026-08-28',
    controls:Object.freeze({total:Object.freeze({forest:2,leeds:0})}),
    outcomeValidation:Object.freeze({successful:Object.freeze({forest:1,leeds:0}),unsuccessful:Object.freeze({forest:1,leeds:0})}),
    test:isThroughBall,successfulTest:isSuccessfulThroughBall,unsuccessfulTest:isUnsuccessfulThroughBall
  });

  document.dispatchEvent(new CustomEvent('pitchlab:through-ball-definition-ready',{detail:{version:window.PitchLabThroughBallDefinition.version}}));
})();
