(()=>{
  const bible=window.PitchLabMetricBible;
  if(!bible){console.error('[PitchLab] Metric Bible missing; Free-Kick family not attached.');return;}
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const oc=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const hq=(e,...q)=>typeof hasQ==='function'&&hasQ(e,...q);
  const surfaces=Object.freeze(['pitch','leaders','matchStats']);

  // GOLD CORRECTION 2026-08-31: "Free-Kicks" is the award metric, not the
  // subsequent restart action. In WhoScored/Opta event data the team awarded
  // the free kick owns the Successful Foul event. Leeds-Brentford (1983559)
  // independently controls this at 13-5.
  const isFreeKickAward=e=>et(e)==='foul'&&oc(e)==='successful';

  // The previously locked reconstruction remains valid, but its correct metric
  // identity is Free-Kick Passes: Pass + FreekickTaken, excluding explicit
  // indirect/offside restarts and other restart families.
  const isFreeKickPass=e=>et(e)==='pass'&&hq(e,'FreekickTaken')&&!hq(e,'IndirectFreekickTaken','CornerTaken','ThrowIn','GoalKick','GoalKickTaken','PenaltyTaken');
  const isAccuratePass=e=>isFreeKickPass(e)&&oc(e)==='successful';
  const isFinalThirdPass=e=>isFreeKickPass(e)&&Number(e?.x)>=200/3;
  const gold=(label,controls,test)=>Object.freeze({label,kind:'event',surfaces,status:'GOLD_LOCKED',controls:Object.freeze(controls),test});
  const defs=Object.freeze({
    free_kicks:gold('Free-Kicks',{leedsBrentford:Object.freeze([13,5])},isFreeKickAward),
    free_kick_passes:gold('Free-Kick Passes',{forestLeeds:Object.freeze([13,13]),bournemouthLeeds:Object.freeze([10,6]),leedsBrentford:Object.freeze([11,5])},isFreeKickPass),
    free_kicks_accurate:gold('Accurate Free-Kick Passes',{forestLeeds:Object.freeze([8,6]),bournemouthLeeds:Object.freeze([6,1])},isAccuratePass),
    free_kicks_final_third:gold('Free-Kick Passes In the Final Third',{forestLeeds:Object.freeze([2,1]),bournemouthLeeds:Object.freeze([1,1])},isFinalThirdPass)
  });
  if(typeof FILTERS!=='undefined')for(const [k,d] of Object.entries(defs))FILTERS[k]=d.test;
  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,...defs});
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),...Object.keys(defs)])]);

  function ensureOption(value,text){
    const sel=document.getElementById('metric');if(!sel)return;
    let group=[...sel.querySelectorAll('optgroup')].find(g=>g.label==='Set-Pieces');
    if(!group){group=document.createElement('optgroup');group.label='Set-Pieces';sel.appendChild(group)}
    let option=sel.querySelector(`option[value="${value}"]`);
    if(!option){option=document.createElement('option');option.value=value;group.appendChild(option)}
    option.textContent=text;
  }
  ensureOption('free_kicks','Free-Kicks');
  ensureOption('free_kick_passes','Free-Kick Passes');
  ensureOption('free_kicks_accurate','Accurate Free-Kick Passes');
  ensureOption('free_kicks_final_third','Free-Kick Passes In the Final Third');

  window.PitchLabFreeKickDefinition=Object.freeze({
    version:'FREE_KICK_GOLD_V4_2026-08-31',
    status:'GOLD_LOCKED',
    defs,
    fixtures:Object.freeze(['whoscored:1983552','whoscored:1903384','whoscored:1983559']),
    controls:Object.freeze({
      forestLeeds:Object.freeze({freeKickPasses:Object.freeze([13,13]),accurateFreeKickPasses:Object.freeze([8,6]),finalThirdFreeKickPasses:Object.freeze([2,1]),directFreeKickShots:Object.freeze([1,2])}),
      bournemouthLeeds:Object.freeze({freeKickPasses:Object.freeze([10,6]),accurateFreeKickPasses:Object.freeze([6,1]),finalThirdFreeKickPasses:Object.freeze([1,1])}),
      leedsBrentford:Object.freeze({freeKicksAwarded:Object.freeze([13,5]),freeKickPasses:Object.freeze([11,5]),directFreeKickShots:Object.freeze([1,0])})
    }),
    authoritativeDefinitions:Object.freeze({
      freeKicks:'Successful Foul event owned by the team awarded the free kick.',
      freeKickPasses:'Pass + FreekickTaken, excluding IndirectFreekickTaken (plus standard restart-family exclusions).',
      directFreeKickShots:'Canonical shot family + DirectFreekick qualifier.'
    }),
    evidence:'Leeds-Brentford independently separates 13-5 free kicks awarded from 11-5 free-kick restart passes and 1-0 direct free-kick shots. Earlier restart-pass controls remain valid under their corrected metric identity.',
    guardrail:'Never add direct free-kick shots to Free-Kicks awarded; the shot is a way of taking an already-awarded free kick. Never collapse Free-Kicks and Free-Kick Passes into one metric.'
  });
  document.dispatchEvent(new CustomEvent('pitchlab:free-kick-definition-ready',{detail:{version:window.PitchLabFreeKickDefinition.version,status:window.PitchLabFreeKickDefinition.status}}));
})();