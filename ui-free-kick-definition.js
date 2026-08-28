(()=>{
  const bible=window.PitchLabMetricBible;
  if(!bible){console.error('[PitchLab] Metric Bible missing; Free-Kick family not attached.');return;}
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const oc=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const hq=(e,...q)=>typeof hasQ==='function'&&hasQ(e,...q);
  const surfaces=Object.freeze(['pitch','leaders','matchStats']);
  const isFreeKick=e=>et(e)==='pass'&&hq(e,'FreekickTaken')&&!hq(e,'CornerTaken','ThrowIn','GoalKick','GoalKickTaken','PenaltyTaken');
  const isAccurate=e=>isFreeKick(e)&&oc(e)==='successful';
  const isFinalThird=e=>isFreeKick(e)&&Number(e?.x)>=200/3;
  const raw=(label,observed,test)=>Object.freeze({label,kind:'event',surfaces,status:'RAW_RECONCILED_PENDING_HEADLINE_CONTROL',observedFixtureCounts:Object.freeze(observed),test});
  const defs=Object.freeze({
    free_kicks:raw('Free-Kicks',{forest:16,leeds:16},isFreeKick),
    free_kicks_accurate:raw('Accurate Free-Kicks',{forest:9,leeds:9},isAccurate),
    free_kicks_final_third:raw('Free-Kicks In the Final Third',{forest:2,leeds:1},isFinalThird)
  });
  if(typeof FILTERS!=='undefined')for(const [k,d] of Object.entries(defs))FILTERS[k]=d.test;
  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,...defs});
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),...Object.keys(defs)])]);
  window.PitchLabFreeKickDefinition=Object.freeze({version:'FREE_KICK_REVIEW_V1_2026-08-28',defs,fixture:'whoscored:1983552',note:'Raw qualifier is FreekickTaken. Legacy extra-metrics checked FreeKickTaken and therefore returned zero for this fixture; canonical definitions correct that feed-name mismatch without Gold-locking absent a headline control.'});
  document.dispatchEvent(new CustomEvent('pitchlab:free-kick-definition-ready',{detail:{version:window.PitchLabFreeKickDefinition.version}}));
})();
