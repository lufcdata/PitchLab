(()=>{
  const bible=window.PitchLabMetricBible;
  if(!bible){console.error('[PitchLab] Metric Bible missing; Goal family not attached.');return;}
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const hq=(e,...q)=>typeof hasQ==='function'&&hasQ(e,...q);
  const qnames=e=>(e?.qualifiers||[]).map(q=>String(dn(q?.type)||''));
  const surfaces=Object.freeze(['pitch','leaders','matchStats']);
  const isGoal=e=>et(e)==='goal'&&!hq(e,'OwnGoal');
  const shotLoc=(e,which)=>{const q=qnames(e);if(which==='6yd')return q.some(x=>x.startsWith('SmallBox'));if(which==='box')return q.some(x=>(x.startsWith('Box')||x.startsWith('DeepBox'))&&!x.startsWith('SmallBox'));if(which==='outside')return q.some(x=>x.startsWith('OutOfBox')||x.startsWith('ThirtyFivePlus'));return false;};
  const rawDef=(label,test,observed)=>Object.freeze({label,kind:'event',surfaces,status:'RAW_RECONCILED_PENDING_HEADLINE_CONTROL',observedFixtureCounts:Object.freeze(observed),test});
  const defs=Object.freeze({
    goals:Object.freeze({label:'Goals',kind:'event',surfaces,status:'GOLD_LOCKED',controls:Object.freeze({forest:0,leeds:1}),definition:'Goal events excluding OwnGoal attribution events; scoreboard control Forest 0-1 Leeds.',test:isGoal}),
    goals_open:rawDef('Goals - Open Play',e=>isGoal(e)&&hq(e,'RegularPlay'),{forest:0,leeds:0}),
    goals_fastbreak:rawDef('Goals - Fastbreak',e=>isGoal(e)&&hq(e,'FastBreak'),{forest:0,leeds:0}),
    goals_setpiece:rawDef('Goals - Set Pieces',e=>isGoal(e)&&hq(e,'FromCorner','SetPiece','DirectFreekick','ThrowinSetPiece')&&!hq(e,'Penalty'),{forest:0,leeds:1}),
    goals_corner:rawDef('Goals - Corners',e=>isGoal(e)&&hq(e,'FromCorner'),{forest:0,leeds:0}),
    goals_freekick:rawDef('Goals - Free-Kicks',e=>isGoal(e)&&hq(e,'DirectFreekick','SetPiece')&&!hq(e,'FromCorner','ThrowinSetPiece','Penalty'),{forest:0,leeds:1}),
    goals_penalty:rawDef('Goals - Penalties',e=>isGoal(e)&&hq(e,'Penalty'),{forest:0,leeds:0}),
    own_goals:rawDef('Goals - Own Goals',e=>et(e)==='goal'&&hq(e,'OwnGoal'),{forest:0,leeds:0}),
    goals_6yd:rawDef('Goals - 6-yard Box',e=>isGoal(e)&&shotLoc(e,'6yd'),{forest:0,leeds:0}),
    goals_box:rawDef('Goals - Penalty Area',e=>isGoal(e)&&shotLoc(e,'box'),{forest:0,leeds:0}),
    goals_outside:rawDef('Goals - Outside Box',e=>isGoal(e)&&shotLoc(e,'outside'),{forest:0,leeds:1}),
    goals_right:rawDef('Goals - Right Foot',e=>isGoal(e)&&hq(e,'RightFoot'),{forest:0,leeds:1}),
    goals_left:rawDef('Goals - Left Foot',e=>isGoal(e)&&hq(e,'LeftFoot'),{forest:0,leeds:0}),
    goals_head:rawDef('Goals - Head',e=>isGoal(e)&&hq(e,'Head'),{forest:0,leeds:0}),
    goals_other:rawDef('Goals - Other Body Part',e=>isGoal(e)&&hq(e,'OtherBodyPart'),{forest:0,leeds:0})
  });
  if(typeof FILTERS!=='undefined')for(const [k,d] of Object.entries(defs))FILTERS[k]=d.test;
  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,...defs});
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),...Object.keys(defs)])]);
  window.PitchLabGoalFamilyDefinition=Object.freeze({version:'GOAL_FAMILY_REVIEW_V1_2026-08-28',defs,fixture:'whoscored:1983552',note:'Only total Goals is Gold-locked from the trusted 0-1 scoreboard. Goal subtype predicates are raw-reconciled and intentionally remain provisional.'});
  document.dispatchEvent(new CustomEvent('pitchlab:goal-family-definition-ready',{detail:{version:window.PitchLabGoalFamilyDefinition.version}}));
})();
