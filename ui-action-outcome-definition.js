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

  // Administrative/provider companion events are deliberately not player actions.
  // CornerAwarded is an outcome, not the subsequent delivery. OffsidePass and
  // OffsideProvoked are companion records; only OffsideGiven is charged.
  const ignoredTypes=new Set([
    'start','end','formationset','formationchange','substitutionoff','substitutionon','card',
    'cornerawarded','offsidepass','offsideprovoked'
  ]);

  function classifyAction(e){
    if(!e?.playerId)return 'ignore';
    const t=et(e),outcome=oc(e);
    if(ignoredTypes.has(t))return 'ignore';

    // Shot semantics are intentionally outcome-semantic rather than provider-outcome based.
    if(t==='goal')return hq(e,'OwnGoal')?'unsuccessful':'successful';
    if(t==='missedshots'||t==='shotonpost')return 'unsuccessful';
    if(t==='savedshot')return hq(e,'Blocked','OutfielderBlock')?'unsuccessful':'successful';

    // Defensive / possession events with signed-off PitchLab semantics.
    if(['ballrecovery','interception','clearance','blockedpass','save'].includes(t))return 'successful';
    if(t==='tackle')return 'successful'; // Gold Tackles Won / Ground Duels Won semantics.
    if(t==='challenge')return 'unsuccessful'; // Dribbled past / ground duel lost.
    if(['dispossessed','error','offsidegiven'].includes(t))return 'unsuccessful';

    // Goalkeeper action outcomes. Successful save events are handled above.
    if(['claim','keeperpickup','keepersweeper','punch'].includes(t))return outcome==='unsuccessful'?'unsuccessful':'successful';

    // Direct action families. This includes ordinary BallTouch events by explicit sign-off.
    if(['pass','aerial','balltouch','takeon','foul','shieldballopp'].includes(t))return outcome==='unsuccessful'?'unsuccessful':'successful';

    // Future genuine player-action types fall back to their explicit provider outcome.
    if(outcome==='successful')return 'successful';
    if(outcome==='unsuccessful')return 'unsuccessful';
    return 'ignore';
  }

  const successful=e=>classifyAction(e)==='successful';
  const unsuccessful=e=>classifyAction(e)==='unsuccessful';
  const definition='PitchLab signed-off action classifier. Each underlying player event is counted at most once as Successful or Unsuccessful; metric labels such as assist, chance created, big chance created and progressive pass do not create duplicate actions. Successful ordinary BallTouch is included. Blocked shots, misses, woodwork, own goals, errors, dispossessions, offsides and lost duels are Unsuccessful. CornerAwarded, Possession Lost and provider companion offside records are excluded.';

  const defs=Object.freeze({
    successful_actions:Object.freeze({
      label:'Successful Actions',kind:'event',surfaces,status:'GOLD_LOCKED',definitionSource:'PITCHLAB_SIGNED_OFF',colour:SUCCESS,
      observedFixtureCounts:Object.freeze({forestLeeds:Object.freeze({forest:535,leeds:434}),bournemouthLeeds:Object.freeze({bournemouth:585,leeds:489})}),
      definition,test:successful
    }),
    unsuccessful_actions:Object.freeze({
      label:'Unsuccessful Actions',kind:'event',surfaces,status:'GOLD_LOCKED',definitionSource:'PITCHLAB_SIGNED_OFF',colour:UNSUCCESS,
      observedFixtureCounts:Object.freeze({forestLeeds:Object.freeze({forest:207,leeds:190}),bournemouthLeeds:Object.freeze({bournemouth:222,leeds:174})}),
      definition,test:unsuccessful
    })
  });

  if(typeof FILTERS!=='undefined'){
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
  ensureOption('successful_actions','Successful Actions');
  ensureOption('unsuccessful_actions','Unsuccessful Actions');

  // Pitch Events: these are mixed action families, so show each action as a point.
  // Patch only the generic point renderer and legend colour for the two new keys.
  const originalDrawPoint=window.drawPoint;
  if(typeof originalDrawPoint==='function'){
    window.drawPoint=function(root,e,colour){
      const key=document.getElementById('metric')?.value;
      if(key==='successful_actions')colour=SUCCESS;
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
    version:'ACTION_OUTCOME_V1_2026-08-28',
    colours:Object.freeze({successful:SUCCESS,unsuccessful:UNSUCCESS}),
    ignoredTypes:Object.freeze([...ignoredTypes]),
    classifyAction,defs
  });
  document.dispatchEvent(new CustomEvent('pitchlab:action-outcome-definition-ready',{detail:{version:window.PitchLabActionOutcomeDefinition.version,keys:Object.freeze(Object.keys(defs))}}));
})();
