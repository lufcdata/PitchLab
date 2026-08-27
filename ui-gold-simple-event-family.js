(()=>{
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const oc=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const ok=e=>oc(e)!=='unsuccessful';
  const hq=(e,...q)=>typeof hasQ==='function'&&hasQ(e,...q);
  const surfaces=Object.freeze(['pitch','leaders','matchStats']);
  const eventDef=(label,golden,test)=>Object.freeze({label,kind:'event',surfaces,golden:Object.freeze(golden),test,status:'GOLD_LOCKED'});
  const setPlayCross=e=>et(e)==='pass'&&hq(e,'Cross')&&!hq(e,'ThrowIn','ThrowinSetPiece','GoalKick','GoalKickTaken')&&hq(e,'CornerTaken','FreeKickTaken','FreekickTaken','SetPiece','DirectFreekick');

  const defs=Object.freeze({
    interceptions:eventDef('Interceptions',[2,15],e=>et(e)==='interception'),
    goal_kicks:eventDef('Goal Kicks',[6,10],e=>et(e)==='pass'&&hq(e,'GoalKick')),
    fouls_committed:eventDef('Fouls',[15,14],e=>et(e)==='foul'&&oc(e)==='unsuccessful'),
    fouled:eventDef('Fouled',[14,15],e=>et(e)==='foul'&&oc(e)==='successful'),
    corners:eventDef('Corners',[3,2],e=>et(e)==='pass'&&hq(e,'CornerTaken')),
    set_play_crosses_success:eventDef('Successful Set Play Crosses',[1,1],e=>setPlayCross(e)&&ok(e)),
    set_play_crosses_unsuccess:eventDef('Unsuccessful Set Play Crosses',[5,2],e=>setPlayCross(e)&&!ok(e)),
    accurate_crosses:eventDef('Accurate Crosses',[4,3],e=>et(e)==='pass'&&hq(e,'Cross')&&ok(e)),
    inaccurate_crosses:eventDef('Inaccurate Crosses',[15,5],e=>et(e)==='pass'&&hq(e,'Cross')&&!ok(e))
  });

  if(typeof FILTERS!=='undefined'){
    for(const [key,def] of Object.entries(defs))FILTERS[key]=def.test;
  }

  const bible=window.PitchLabMetricBible;
  if(!bible){
    console.error('[Gold Metric Bible] Base registry missing; simple event family not attached.');
    return;
  }
  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,...defs});
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),...Object.keys(defs)])]);

  window.PitchLabGoldSimpleEventFamily=Object.freeze({
    version:'GOLD_SIMPLE_EVENT_FAMILY_V1_2026-08-27',
    defs,
    fixture:'whoscored:1983552'
  });
  document.dispatchEvent(new CustomEvent('pitchlab:gold-simple-event-family-ready',{
    detail:{version:window.PitchLabGoldSimpleEventFamily.version,keys:Object.freeze(Object.keys(defs))}
  }));
})();
