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
  const raw=(label,observed,test,definition)=>Object.freeze({label,kind:'event',surfaces,status:'RAW_RECONCILED_PENDING_HEADLINE_CONTROL',observedFixtureCounts:Object.freeze(observed),definition,test});
  const tackleWon=e=>et(e)==='tackle';
  const tackleLost=e=>et(e)==='challenge';
  const clearance=e=>et(e)==='clearance'&&!hq(e,'BlockedCross');
  const nonAerialFoul=e=>et(e)==='foul'&&!hq(e,'AerialFoul');
  const groundWon=e=>tackleWon(e)||(et(e)==='takeon'&&ok(e))||(nonAerialFoul(e)&&ok(e));
  const groundLost=e=>tackleLost(e)||(et(e)==='takeon'&&!ok(e))||(nonAerialFoul(e)&&!ok(e));
  const groundEvent=e=>groundWon(e)||groundLost(e);
  const aerialEvent=e=>et(e)==='aerial'||(et(e)==='foul'&&hq(e,'AerialFoul'));
  const aerialWon=e=>(et(e)==='aerial'&&ok(e))||(et(e)==='foul'&&ok(e)&&hq(e,'AerialFoul'));
  const offensiveAerial=e=>aerialEvent(e)&&hq(e,'Offensive');
  const defensiveAerial=e=>aerialEvent(e)&&hq(e,'Defensive');
  const blockedShot=e=>et(e)==='save'&&hq(e,'OutfielderBlock');
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
    ground_duels_lost:raw('Ground Duels Lost',{forest:34,leeds:28},groundLost,'Symmetric counterpart to the signed-off Ground Duels Won engine: Challenge + unsuccessful TakeOn + unsuccessful non-aerial Foul.'),
    ground_duels:raw('Total Ground Duels',{forest:65,leeds:69},groundEvent,'Union of the signed-off Ground Duels Won population and its outcome-symmetric lost population; pending an independent headline total control.'),
    duels_lost:raw('Duels Lost',{forest:59,leeds:58},e=>groundLost(e)||(aerialEvent(e)&&!aerialWon(e)),'Ground Duels Lost plus canonical Aerial Duels Lost; raw reconstruction is explicit but awaits an independent headline control.'),
    total_duels:raw('Total Duels',{forest:120,leeds:124},e=>groundEvent(e)||aerialEvent(e),'Canonical ground-duel population plus canonical aerial-duel population; pending independent headline total control.'),
    blocked_shots:gold('Blocked Shots',{forest:6,leeds:1},blockedShot,'Trusted Opta control 6-1 exactly matches Save + OutfielderBlock raw events.'),
    blocked_crosses:gold('Blocked Crosses',{forest:7,leeds:7},blockedCross,'Trusted Opta control 7-7 is reconstructed exactly by the defensive BlockedPass population plus Clearance events explicitly qualified BlockedCross: Forest 7+0, Leeds 5+2.'),
    blocks:gold('Blocks',{forest:13,leeds:8},block,'Trusted Opta headline Blocks 13-8 is the exact union of Gold Blocked Shots 6-1 and Gold Blocked Crosses 7-7.'),
    blocked_passes:raw('Blocked Passes',{forest:7,leeds:5},e=>et(e)==='blockedpass','Dedicated defensive BlockedPass event population is 7-5. It is a raw event subtype inside the Gold Blocked Crosses reconstruction, but awaits an independent Blocked Passes headline control before being Gold-locked as its own user-facing metric.')
  });
  if(typeof FILTERS!=='undefined')for(const [k,d] of Object.entries(defs))FILTERS[k]=d.test;
  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,...defs});
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),...Object.keys(defs)])]);
  window.PitchLabDefensiveResidualDefinition=Object.freeze({version:'DEFENSIVE_RESIDUAL_V7_2026-08-28',defs,fixture:'whoscored:1983552'});
  document.dispatchEvent(new CustomEvent('pitchlab:defensive-residual-definition-ready',{detail:{version:window.PitchLabDefensiveResidualDefinition.version}}));
})();
