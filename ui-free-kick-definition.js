(()=>{
  const bible=window.PitchLabMetricBible;
  if(!bible){console.error('[PitchLab] Metric Bible missing; Free-Kick family not attached.');return;}
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const oc=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const hq=(e,...q)=>typeof hasQ==='function'&&hasQ(e,...q);
  const surfaces=Object.freeze(['pitch','leaders','matchStats']);

  // IMPORTANT: FreekickTaken is the raw restart population, not yet the signed-off
  // WhoScored Free-Kick Pass population. Forest-Leeds reconstructs 16-16 here,
  // while the displayed pass component is 13-13. The exact event-level exclusion
  // (leading candidate: offside-generated indirect restarts) must be proven before
  // this predicate is changed. Never implement count-minus-offsides or a fixture hack.
  const isRawFreeKickPass=e=>et(e)==='pass'&&hq(e,'FreekickTaken')&&!hq(e,'CornerTaken','ThrowIn','GoalKick','GoalKickTaken','PenaltyTaken');
  const isAccurate=e=>isRawFreeKickPass(e)&&oc(e)==='successful';
  const isFinalThird=e=>isRawFreeKickPass(e)&&Number(e?.x)>=200/3;
  const raw=(label,observed,test)=>Object.freeze({label,kind:'event',surfaces,status:'UNDER_INVESTIGATION',observedFixtureCounts:Object.freeze(observed),test});
  const defs=Object.freeze({
    free_kicks:raw('Free-Kicks — Raw Restart Passes',{forest:16,leeds:16},isRawFreeKickPass),
    free_kicks_accurate:raw('Accurate Free-Kicks — Raw Restart Passes',{forest:9,leeds:9},isAccurate),
    free_kicks_final_third:raw('Free-Kicks In the Final Third — Raw Restart Passes',{forest:2,leeds:1},isFinalThird)
  });
  if(typeof FILTERS!=='undefined')for(const [k,d] of Object.entries(defs))FILTERS[k]=d.test;
  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,...defs});
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),...Object.keys(defs)])]);
  window.PitchLabFreeKickDefinition=Object.freeze({
    version:'FREE_KICK_REVIEW_V2_2026-08-28',
    defs,
    fixture:'whoscored:1983552',
    controls:Object.freeze({
      displayedFreeKickPasses:Object.freeze([13,13]),
      directFreeKickShots:Object.freeze([1,2]),
      headlineFreeKicks:Object.freeze([14,15]),
      rawFreekickTakenPasses:Object.freeze([16,16]),
      offsides:Object.freeze([3,3])
    }),
    candidateDecomposition:'displayed free-kick passes 13-13 + Gold DirectFreekick shots 1-2 = headline free kicks 14-15',
    guardrail:'Do not Gold-lock until the three excluded raw restart passes per team are identified event-by-event and the same exclusion rule survives a second fixture. Never implement count-minus-offsides.',
    note:'Raw qualifier is FreekickTaken. Legacy extra-metrics checked FreeKickTaken and therefore returned zero for this fixture.'
  });
  document.dispatchEvent(new CustomEvent('pitchlab:free-kick-definition-ready',{detail:{version:window.PitchLabFreeKickDefinition.version}}));
})();
