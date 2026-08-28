(()=>{
  const bible=window.PitchLabMetricBible;
  const passing=window.PitchLabPassingGolden;
  if(!bible||!passing){
    console.error('[PitchLab] Metric Bible or Golden passing engine missing; Through Ball definition not attached.');
    return;
  }

  const hasQualifier=(e,name)=>(e?.qualifiers||[]).some(q=>String(q?.type?.displayName||'').toLowerCase()===name.toLowerCase());
  const outcome=e=>String((e?.outcomeType?.displayName??e?.outcomeType?.name??e?.outcomeType?.value??e?.outcomeType)||'').toLowerCase();
  const isThroughBall=e=>passing.isStatPass(e)&&hasQualifier(e,'Throughball');
  const isSuccessfulThroughBall=e=>isThroughBall(e)&&outcome(e)==='successful';

  if(typeof FILTERS!=='undefined'){
    FILTERS.through_balls=isThroughBall;
    FILTERS.through_balls_success=isSuccessfulThroughBall;
  }

  const totalDef=Object.freeze({
    label:'Through Balls',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'GOLD_LOCKED',
    definition:'Gold statistical pass carrying Opta/WhoScored Throughball qualifier.',
    controls:Object.freeze({forest:2,leeds:0}),
    test:isThroughBall
  });
  const successDef=Object.freeze({
    label:'Successful Through Balls',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),
    status:'RAW_RECONCILED_PENDING_HEADLINE_CONTROL',
    definition:'Through Ball with successful outcome.',
    observedFixtureCounts:Object.freeze({forest:1,leeds:0}),
    test:isSuccessfulThroughBall
  });

  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,
    through_balls:totalDef,through_balls_success:successDef
  });
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),'through_balls','through_balls_success'])]);

  const metricSelect=document.getElementById('metric');
  if(metricSelect){
    let group=[...metricSelect.querySelectorAll('optgroup')].find(g=>g.label==='Passing');
    if(!group){group=document.createElement('optgroup');group.label='Passing';metricSelect.appendChild(group)}
    if(!metricSelect.querySelector('option[value="through_balls"]')){
      const o=document.createElement('option');o.value='through_balls';o.textContent='Through Balls';group.appendChild(o);
    }
    if(!metricSelect.querySelector('option[value="through_balls_success"]')){
      const o=document.createElement('option');o.value='through_balls_success';o.textContent='Successful Through Balls';group.appendChild(o);
    }
  }

  window.PitchLabThroughBallDefinition=Object.freeze({
    version:'OPTA_THROUGH_BALL_V1_2026-08-28',
    controls:Object.freeze({total:Object.freeze({forest:2,leeds:0})}),
    observations:Object.freeze({successful:Object.freeze({forest:1,leeds:0})}),
    test:isThroughBall,successfulTest:isSuccessfulThroughBall
  });

  document.dispatchEvent(new CustomEvent('pitchlab:through-ball-definition-ready',{detail:{version:window.PitchLabThroughBallDefinition.version}}));
})();
