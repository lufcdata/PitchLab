(()=>{
  const bible=window.PitchLabMetricBible;
  if(!bible){console.error('[PitchLab] Metric Bible missing; defensive residuals not attached.');return;}
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const oc=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const ok=e=>oc(e)!=='unsuccessful';
  const hq=(e,...q)=>typeof hasQ==='function'&&hasQ(e,...q);
  const surfaces=Object.freeze(['pitch','leaders','matchStats']);
  const gold=(label,controls,test,definition)=>Object.freeze({label,kind:'event',surfaces,status:'GOLD_LOCKED',controls:Object.freeze(controls),definition,test});
  const raw=(label,observed,test,definition)=>Object.freeze({label,kind:'event',surfaces,status:'RAW_RECONCILED_PENDING_HEADLINE_CONTROL',observedFixtureCounts:Object.freeze(observed),definition,test});
  const tackleWon=e=>et(e)==='tackle';
  const tackleLost=e=>et(e)==='challenge';
  const clearance=e=>et(e)==='clearance'&&!hq(e,'BlockedCross');
  const aerialEvent=e=>et(e)==='aerial'||(et(e)==='foul'&&hq(e,'AerialFoul'));
  const aerialWon=e=>(et(e)==='aerial'&&ok(e))||(et(e)==='foul'&&ok(e)&&hq(e,'AerialFoul'));
  const defs=Object.freeze({
    tackles:gold('Tackles',{forest:15,leeds:29},e=>tackleWon(e)||tackleLost(e),'Embedded Opta tacklesTotal = Tackle + Challenge events.'),
    tackles_lost:gold('Tackles Lost',{forest:7,leeds:10},tackleLost,'Embedded Opta tackleUnsuccesful matches Challenge events exactly.'),
    clearances:gold('Clearances',{forest:32,leeds:31},clearance,'Clearance events excluding BlockedCross; exactly matches embedded Opta clearances.'),
    dispossessed:gold('Dispossessed',{forest:9,leeds:3},e=>et(e)==='dispossessed','Raw Dispossessed events exactly match embedded Opta dispossessed.'),
    errors:gold('Errors',{forest:1,leeds:0},e=>et(e)==='error','Raw Error events exactly match embedded Opta errors.'),
    aerial_duels:gold('Total Aerial Duels',{forest:55,leeds:55},aerialEvent,'Aerial events plus AerialFoul events; exactly matches embedded Opta aerialsTotal.'),
    aerial_duels_lost:gold('Aerial Duels Lost',{forest:25,leeds:30},e=>aerialEvent(e)&&!aerialWon(e),'Embedded aerialsTotal minus Gold Aerial Duels Won; raw event outcomes agree exactly.'),
    blocks:raw('Blocks',{forest:6,leeds:1},e=>et(e)==='save'&&hq(e,'OutfielderBlock'),'Raw outfield block events; pending independent headline control.'),
    blocked_passes:raw('Blocked Passes',{forest:7,leeds:5},e=>et(e)==='blockedpass','Raw BlockedPass population; no independent embedded headline control.'),
    blocked_crosses:raw('Blocked Crosses',{forest:0,leeds:2},e=>et(e)==='clearance'&&hq(e,'BlockedCross'),'BlockedCross is carried by defensive Clearance events in this feed, not BlockedPass events; pending headline control.')
  });
  if(typeof FILTERS!=='undefined')for(const [k,d] of Object.entries(defs))FILTERS[k]=d.test;
  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,...defs});
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),...Object.keys(defs)])]);
  window.PitchLabDefensiveResidualDefinition=Object.freeze({version:'DEFENSIVE_RESIDUAL_V2_2026-08-28',defs,fixture:'whoscored:1983552'});
  document.dispatchEvent(new CustomEvent('pitchlab:defensive-residual-definition-ready',{detail:{version:window.PitchLabDefensiveResidualDefinition.version}}));
})();
