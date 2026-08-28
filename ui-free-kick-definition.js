(()=>{
  const bible=window.PitchLabMetricBible;
  if(!bible){console.error('[PitchLab] Metric Bible missing; Free-Kick family not attached.');return;}
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const oc=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const hq=(e,...q)=>typeof hasQ==='function'&&hasQ(e,...q);
  const surfaces=Object.freeze(['pitch','leaders','matchStats']);

  // GOLD: WhoScored Free-Kick Passes are Pass events carrying FreekickTaken,
  // excluding offside-generated indirect restarts identified explicitly by
  // IndirectFreekickTaken. This is an event-level qualifier rule: never replace
  // it with count-minus-offsides, timing heuristics, or fixture-specific fixes.
  const isFreeKickPass=e=>et(e)==='pass'&&hq(e,'FreekickTaken')&&!hq(e,'IndirectFreekickTaken','CornerTaken','ThrowIn','GoalKick','GoalKickTaken','PenaltyTaken');
  const isAccurate=e=>isFreeKickPass(e)&&oc(e)==='successful';
  const isFinalThird=e=>isFreeKickPass(e)&&Number(e?.x)>=200/3;
  const gold=(label,controls,test)=>Object.freeze({label,kind:'event',surfaces,status:'GOLD_LOCKED',controls:Object.freeze(controls),test});
  const defs=Object.freeze({
    free_kicks:gold('Free-Kicks',{forestLeeds:Object.freeze([13,13]),bournemouthLeeds:Object.freeze([10,6])},isFreeKickPass),
    free_kicks_accurate:gold('Accurate Free-Kicks',{forestLeeds:Object.freeze([8,6]),bournemouthLeeds:Object.freeze([6,1])},isAccurate),
    free_kicks_final_third:gold('Free-Kicks In the Final Third',{forestLeeds:Object.freeze([2,1]),bournemouthLeeds:Object.freeze([1,1])},isFinalThird)
  });
  if(typeof FILTERS!=='undefined')for(const [k,d] of Object.entries(defs))FILTERS[k]=d.test;
  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,...defs});
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),...Object.keys(defs)])]);
  window.PitchLabFreeKickDefinition=Object.freeze({
    version:'FREE_KICK_GOLD_V3_2026-08-28',
    status:'GOLD_LOCKED',
    defs,
    fixtures:Object.freeze(['whoscored:1983552','whoscored:1903384']),
    controls:Object.freeze({
      forestLeeds:Object.freeze({rawFreekickTakenPasses:Object.freeze([16,16]),indirectOffsideRestarts:Object.freeze([3,3]),freeKickPasses:Object.freeze([13,13]),accurateFreeKickPasses:Object.freeze([8,6]),finalThirdFreeKickPasses:Object.freeze([2,1]),directFreeKickShots:Object.freeze([1,2]),headlineFreeKicks:Object.freeze([14,15])}),
      bournemouthLeeds:Object.freeze({rawFreekickTakenPasses:Object.freeze([11,7]),indirectOffsideRestarts:Object.freeze([1,1]),freeKickPasses:Object.freeze([10,6]),accurateFreeKickPasses:Object.freeze([6,1]),finalThirdFreeKickPasses:Object.freeze([1,1])})
    }),
    authoritativeDefinition:'Pass + FreekickTaken, excluding IndirectFreekickTaken (plus standard restart-family exclusions).',
    evidence:'Forest-Leeds: all six excluded raw restart passes (3 per team) carry IndirectFreekickTaken and are offside restarts. Bournemouth-Leeds independently reproduces the same rule with one exclusion per team.',
    guardrail:'Never implement free-kick passes as raw FreekickTaken minus an offside count, timing heuristic, or fixture-specific adjustment.',
    note:'Direct free-kick shots remain owned by the canonical DirectFreekick shot family and are not Free-Kick Pass events.'
  });
  document.dispatchEvent(new CustomEvent('pitchlab:free-kick-definition-ready',{detail:{version:window.PitchLabFreeKickDefinition.version,status:window.PitchLabFreeKickDefinition.status}}));
})();
