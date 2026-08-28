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
  const derived=(label,observed,test,definition)=>Object.freeze({label,kind:'event',surfaces,status:'DERIVED_FROM_GOLD_COMPONENTS',observedFixtureCounts:Object.freeze(observed),definition,test});
  const tackleWon=e=>et(e)==='tackle';
  const tackleLost=e=>et(e)==='challenge';
  const clearance=e=>et(e)==='clearance'&&!hq(e,'BlockedCross');
  const nonAerialFoul=e=>et(e)==='foul'&&!hq(e,'AerialFoul');
  const groundWon=e=>tackleWon(e)||(et(e)==='takeon'&&ok(e))||(nonAerialFoul(e)&&ok(e));
  const periodKey=e=>String(dn(e?.period)||dn(e?.periodType)||'').replace(/[\s_-]/g,'').toLowerCase();
  const sameClock=(a,b)=>Number(a?.minute||0)===Number(b?.minute||0)&&Number(a?.second||0)===Number(b?.second||0);
  const samePeriod=(a,b)=>{const ap=periodKey(a),bp=periodKey(b);return !ap||!bp||ap===bp;};
  const pairedTackleDispossessed=e=>{if(et(e)!=='dispossessed'||typeof events==='undefined'||!Array.isArray(events))return false;const tm=String(e?.teamId??'');return events.some(q=>q!==e&&String(q?.teamId??'')!==tm&&et(q)==='tackle'&&sameClock(q,e)&&samePeriod(q,e));};
  const groundLost=e=>tackleLost(e)||(et(e)==='takeon'&&!ok(e))||(nonAerialFoul(e)&&!ok(e)||pairedTackleDispossessed(e));
  const groundEvent=e=>groundWon(e)||groundLost(e);
  const aerialEvent=e=>et(e)==='aerial'||(et(e)==='foul'&&hq(e,'AerialFoul'));
  const aerialWon=e=>(et(e)==='aerial'&&ok(e))||(et(e)==='foul'&&ok(e)&&hq(e,'AerialFoul'));
  const offensiveAerial=e=>aerialEvent(e)&&hq(e,'Offensive');
  const defensiveAerial=e=>aerialEvent(e)&&hq(e,'Defensive');
  const blockedShot=e=>et(e)==='save'&&hq(e,'OutfielderBlock');
  // Raw BlockedPass remains an internal event primitive because it is required to
  // reconstruct the user-facing Gold Blocked Crosses metric. It is not itself exposed.
  const blockedCross=e=>et(e)==='blockedpass'||(et(e)==='clearance'&&hq(e,'BlockedCross'));
  const block=e=>blockedShot(e)||blockedCross(e);
  const defs=Object.freeze({
    tackles:gold('Tackles',{forest:15,leeds:29},e=>tackleWon(e)||tackleLost(e),'Embedded Opta tacklesTotal = Tackle + Challenge events.'),
    tackles_lost:gold('Tackles Lost',{forest:7,leeds:10},tackleLost,'Embedded Opta tackleUnsuccesful matches Challenge events exactly.'),
    clearances:gold('Clearances',{forest:32,leeds:31},clearance,'Trusted Forest-Leeds Opta control 32-31 exactly matches raw Clearance events after excluding Clearance events explicitly qualified BlockedCross. Bournemouth-Leeds trusted control 24-62 is retained as the second-fixture validation target.'),
    dispossessed:gold('Dispossessed',{forest:9,leeds:3},e=>et(e)==='dispossessed','Raw Dispossessed events exactly match embedded Opta dispossessed.'),
    errors:gold('Errors',{forest:1,leeds:0},e=>et(e)==='error','Raw Error events exactly match embedded Opta errors.'),
    aerial_duels:gold('Total Aerial Duels',{forest:55,leeds:55},aerialEvent,'Aerial events plus AerialFoul events; exactly matches embedded Opta aerialsTotal.'),
    aerial_duels_lost:gold('Aerial Duels Lost',{forest:25,leeds:30},e=>aerialEvent(e)&&!aerialWon(e),'Embedded aerialsTotal minus Gold Aerial Duels Won; raw event outcomes agree exactly.'),
    att_aerial_duels:gold('Attacking Aerial Duels',{forest:27,leeds:28},offensiveAerial,'Provider Offensive qualifier on the canonical aerial-duel population exactly matches embedded Opta offensiveAerials.'),
    def_aerial_duels:gold('Defensive Aerial Duels',{forest:28,leeds:27},defensiveAerial,'Provider Defensive qualifier on the canonical aerial-duel population exactly matches embedded Opta defensiveAerials.'),
    att_aerial_duels_won:derived('Attacking Aerial Duels Won',{forest:13,leeds:11},e=>offensiveAerial(e)&&aerialWon(e),'Outcome split of Gold Attacking Aerial Duels using the Gold aerial-win predicate.'),
    att_aerial_duels_lost:derived('Attacking Aerial Duels Lost',{forest:14,leeds:17},e=>offensiveAerial(e)&&!aerialWon(e),'Exact remainder of Gold Attacking Aerial Duels after its won component.'),
    def_aerial_duels_won:derived('Defensive Aerial Duels Won',{forest:17,leeds:14},e=>defensiveAerial(e)&&aerialWon(e),'Outcome split of Gold Defensive Aerial Duels using the Gold aerial-win predicate.'),
    def_aerial_duels_lost:derived('Defensive Aerial Duels Lost',{forest:11,leeds:13},e=>defensiveAerial(e)&&!aerialWon(e),'Exact remainder of Gold Defensive Aerial Duels after its won component.'),
    ground_duels_lost:derived('Ground Duels Lost',{forest:41,leeds:31},groundLost,'Derived from the independently controlled 72-72 total Ground Duel population minus Gold Ground Duels Won 31-41. Event attribution is Challenge + unsuccessful TakeOn + unsuccessful non-aerial Foul + Dispossessed only when paired at the same provider clock/period with an opponent Tackle.'),
    ground_duels:gold('Total Ground Duels',{forest:72,leeds:72},groundEvent,'Independent 365Scores control displays Ground Duels Won as 31/72 Forest and 41/72 Leeds. The canonical raw population is Ground Duels Won plus its losing-side partner events, including tackle-paired Dispossessed but excluding standalone Dispossessed.'),
    duels_lost:derived('Duels Lost',{forest:66,leeds:61},e=>groundLost(e)||(aerialEvent(e)&&!aerialWon(e)),'Derived from closed Ground Duels Lost 41-31 plus Gold Aerial Duels Lost 25-30.'),
    total_duels:derived('Total Duels',{forest:127,leeds:127},e=>groundEvent(e)||aerialEvent(e),'Derived from Gold Total Ground Duels 72-72 plus Gold Total Aerial Duels 55-55. Forest-Leeds Gold Duels Won 61-66 therefore leaves Duels Lost 66-61.'),
    blocked_shots:gold('Blocked Shots',{forest:6,leeds:1},blockedShot,'Trusted Opta control 6-1 exactly matches Save + OutfielderBlock raw events.'),
    blocked_crosses:gold('Blocked Crosses',{forest:7,leeds:7},blockedCross,'Trusted Opta control 7-7 is reconstructed exactly by the defensive BlockedPass population plus Clearance events explicitly qualified BlockedCross: Forest 7+0, Leeds 5+2. Raw BlockedPass is retained only as an internal component, not a standalone metric.'),
    blocks:gold('Blocks',{forest:13,leeds:8},block,'Trusted Opta headline Blocks 13-8 is the exact union of Gold Blocked Shots 6-1 and Gold Blocked Crosses 7-7.')
  });
  if(typeof FILTERS!=='undefined')for(const [k,d] of Object.entries(defs))FILTERS[k]=d.test;
  if(typeof FILTERS!=='undefined')delete FILTERS.blocked_passes;
  bible.canonicalRegistry=Object.freeze(Object.fromEntries(Object.entries({...bible.canonicalRegistry,...defs}).filter(([k])=>k!=='blocked_passes')));
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]).filter(k=>k!=='blocked_passes'),...Object.keys(defs)])]);
  window.PitchLabDefensiveResidualDefinition=Object.freeze({version:'DEFENSIVE_RESIDUAL_V10_2026-08-28',defs,fixture:'whoscored:1983552',retired:Object.freeze(['blocked_passes'])});
  document.dispatchEvent(new CustomEvent('pitchlab:defensive-residual-definition-ready',{detail:{version:window.PitchLabDefensiveResidualDefinition.version}}));
})();