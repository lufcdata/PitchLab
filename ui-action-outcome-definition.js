(()=>{
  const bible=window.PitchLabMetricBible;
  if(!bible){console.error('[PitchLab] Metric Bible missing; action outcome metrics not attached.');return;}

  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const oc=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const hq=(e,...q)=>typeof hasQ==='function'&&hasQ(e,...q);
  const surfaces=Object.freeze(['pitch','leaders','matchStats']);
  const SUCCESS='#43FAD5';
  const UNSUCCESS='#FF1C6B';

  const ignoredTypes=new Set([
    'start','end','formationset','formationchange','substitutionoff','substitutionon','card',
    'cornerawarded','offsidepass','offsideprovoked'
  ]);

  function classifyAction(e){
    if(!e?.playerId)return 'ignore';
    const t=et(e),outcome=oc(e);
    if(ignoredTypes.has(t))return 'ignore';

    if(t==='goal')return hq(e,'OwnGoal')?'unsuccessful':'successful';
    if(['missedshots','shotonpost','savedshot'].includes(t)&&hq(e,'BigChance'))return 'unsuccessful';
    if(t==='missedshots'||t==='shotonpost')return 'unsuccessful';
    if(t==='savedshot')return hq(e,'Blocked','OutfielderBlock')?'unsuccessful':'successful';
    if(hq(e,'IntentionalGoalAssist','BigChanceCreated','KeyPass'))return 'successful';
    if(['ballrecovery','interception','clearance','blockedpass','save'].includes(t))return 'successful';
    if(t==='tackle')return 'successful';
    if(t==='challenge')return 'unsuccessful';
    if(['dispossessed','error','offsidegiven'].includes(t))return 'unsuccessful';
    if(['claim','keeperpickup','keepersweeper','punch'].includes(t))return outcome==='unsuccessful'?'unsuccessful':'successful';
    if(['pass','aerial','balltouch','takeon','foul','shieldballopp'].includes(t))return outcome==='unsuccessful'?'unsuccessful':'successful';
    if(outcome==='successful')return 'successful';
    if(outcome==='unsuccessful')return 'unsuccessful';
    return 'ignore';
  }

  const successful=e=>classifyAction(e)==='successful';
  const unsuccessful=e=>classifyAction(e)==='unsuccessful';
  const total=e=>classifyAction(e)!=='ignore';
  const definition='PitchLab signed-off action classifier. Each underlying player event is counted at most once as Successful or Unsuccessful; assist, chance-created, big-chance-created and progressive-pass labels do not create duplicate actions. Successful ordinary BallTouch is included. Blocked shots, misses, woodwork, non-goal Big Chances, own goals, errors, dispossessions, offsides and lost duels are Unsuccessful. CornerAwarded, Possession Lost and provider companion offside records are excluded.';

  const defs=Object.freeze({
    total_actions:Object.freeze({
      label:'Total Actions',kind:'event',surfaces,status:'DERIVED_FROM_GOLD_COMPONENTS',definitionSource:'SUCCESSFUL_ACTIONS_UNION_UNSUCCESSFUL_ACTIONS',
      definition:'Every event classified by the Gold action classifier as either Successful or Unsuccessful. Total Actions = Successful Actions + Unsuccessful Actions with no double counting.',test:total
    }),
    successful_actions:Object.freeze({
      label:'Successful Actions',kind:'event',surfaces,status:'GOLD_LOCKED',definitionSource:'PITCHLAB_SIGNED_OFF',colour:SUCCESS,
      observedFixtureCounts:Object.freeze({forestLeeds:Object.freeze({forest:535,leeds:434}),bournemouthLeeds:Object.freeze({bournemouth:584,leeds:489})}),
      definition,test:successful
    }),
    unsuccessful_actions:Object.freeze({
      label:'Unsuccessful Actions',kind:'event',surfaces,status:'GOLD_LOCKED',definitionSource:'PITCHLAB_SIGNED_OFF',colour:UNSUCCESS,
      observedFixtureCounts:Object.freeze({forestLeeds:Object.freeze({forest:207,leeds:190}),bournemouthLeeds:Object.freeze({bournemouth:223,leeds:174})}),
      definition,test:unsuccessful
    })
  });

  if(typeof FILTERS!=='undefined'){
    FILTERS.total_actions=total;
    FILTERS.successful_actions=successful;
    FILTERS.unsuccessful_actions=unsuccessful;
  }
  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,...defs});
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),...Object.keys(defs)])]);

  function ensureOption(value,label){
    const sel=document.getElementById('metric');if(!sel)return;
    let group=[...sel.querySelectorAll('optgroup')].find(g=>g.label==='Actions');
    if(!group){group=document.createElement('optgroup');group.label='Actions';sel.insertBefore(group,sel.firstElementChild)}
    let option=sel.querySelector(`option[value="${value}"]`);
    if(!option){option=document.createElement('option');option.value=value;group.appendChild(option)}
    option.textContent=label;
  }
  ensureOption('total_actions','Total Actions');
  ensureOption('successful_actions','Successful Actions');
  ensureOption('unsuccessful_actions','Unsuccessful Actions');

  const originalDrawPoint=window.drawPoint;
  if(typeof originalDrawPoint==='function'){
    window.drawPoint=function(root,e,colour){
      const key=document.getElementById('metric')?.value;
      if(key==='total_actions')colour=classifyAction(e)==='successful'?SUCCESS:UNSUCCESS;
      else if(key==='successful_actions')colour=SUCCESS;
      else if(key==='unsuccessful_actions')colour=UNSUCCESS;
      return originalDrawPoint(root,e,colour);
    };
  }
  const applyMetricColour=()=>{
    const key=document.getElementById('metric')?.value;
    if(key==='successful_actions')document.documentElement.style.setProperty('--touch',SUCCESS);
    else if(key==='unsuccessful_actions')document.documentElement.style.setProperty('--touch',UNSUCCESS);
    else document.documentElement.style.removeProperty('--touch');
  };
  document.getElementById('metric')?.addEventListener('change',applyMetricColour);
  document.getElementById('metric')?.addEventListener('input',applyMetricColour);
  applyMetricColour();

  window.PitchLabActionOutcomeDefinition=Object.freeze({
    version:'ACTION_OUTCOME_V3_2026-08-29',
    colours:Object.freeze({successful:SUCCESS,unsuccessful:UNSUCCESS}),
    ignoredTypes:Object.freeze([...ignoredTypes]),
    classifyAction,defs
  });
  document.dispatchEvent(new CustomEvent('pitchlab:action-outcome-definition-ready',{detail:{version:window.PitchLabActionOutcomeDefinition.version,keys:Object.freeze(Object.keys(defs))}}));
})();
