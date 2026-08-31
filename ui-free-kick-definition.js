(()=>{
  const bible=window.PitchLabMetricBible;
  if(!bible){console.error('[PitchLab] Metric Bible missing; Free-Kick family not attached.');return;}
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const oc=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const hq=(e,...q)=>typeof hasQ==='function'&&hasQ(e,...q);
  const surfaces=Object.freeze(['pitch','leaders','matchStats']);

  // GOLD CORRECTION 2026-08-31: "Free-Kicks" is the award metric, not merely
  // one restart subtype. In WhoScored/Opta event data the team awarded the
  // free kick owns the Successful Foul event. Leeds-Brentford controls 13-5.
  const isFreeKickAward=e=>et(e)==='foul'&&oc(e)==='successful';

  // Narrow restart-pass family retained from the earlier forensic definition.
  const isFreeKickPass=e=>et(e)==='pass'&&hq(e,'FreekickTaken')&&!hq(e,'IndirectFreekickTaken','CornerTaken','ThrowIn','GoalKick','GoalKickTaken','PenaltyTaken');
  const isAccuratePass=e=>isFreeKickPass(e)&&oc(e)==='successful';
  const isFinalThirdPass=e=>isFreeKickPass(e)&&Number(e?.x)>=200/3;

  // Pitch Events visualisation is award-led but restart-rendered. A counted
  // award is paired with the real same-team restart action, which may be a
  // normal/indirect free-kick pass or a direct free-kick shot. This preserves
  // 13-5 while giving every represented free kick its genuine trajectory.
  const isAnyFreeKickPass=e=>et(e)==='pass'&&hq(e,'FreekickTaken')&&!hq(e,'CornerTaken','ThrowIn','GoalKick','GoalKickTaken','PenaltyTaken');
  const shotTypes=new Set(['goal','savedshot','missedshots','shotonpost']);
  const isDirectFreeKickShot=e=>shotTypes.has(et(e))&&hq(e,'DirectFreekick');
  const isFreeKickRestart=e=>isAnyFreeKickPass(e)||isDirectFreeKickShot(e);
  const periodOf=e=>String(dn(e?.period)||'');
  const fallbackSecond=e=>Number(e?.expandedMinute??e?.minute??0)*60+Number(e?.second??0);
  const eventSecond=e=>window.PitchLabCanonicalTime?.timelineSecond?.(e)??fallbackSecond(e);
  let cacheSource=null,cacheLength=-1,cacheMap=new Map();
  function buildAwardRestartMap(source){
    if(source===cacheSource&&source?.length===cacheLength)return cacheMap;
    const list=Array.isArray(source)?source:[],map=new Map();
    for(let i=0;i<list.length;i++){
      const award=list[i];if(!isFreeKickAward(award))continue;
      const team=String(award?.teamId??''),period=periodOf(award),start=eventSecond(award);
      for(let j=i+1;j<list.length;j++){
        const next=list[j];
        if(periodOf(next)!==period)break;
        const elapsed=eventSecond(next)-start;if(Number.isFinite(elapsed)&&elapsed>120)break;
        if(j>i+1&&isFreeKickAward(next))break;
        if(String(next?.teamId??'')!==team)continue;
        if(isFreeKickRestart(next)){map.set(award,next);break;}
      }
    }
    cacheSource=source;cacheLength=list.length;cacheMap=map;return map;
  }
  const restartForAward=(award,source)=>buildAwardRestartMap(source).get(award)||null;

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
    version:'FREE_KICK_GOLD_V5_2026-08-31',
    status:'GOLD_LOCKED',defs,isFreeKickAward,isFreeKickRestart,isDirectFreeKickShot,restartForAward,buildAwardRestartMap,
    fixtures:Object.freeze(['whoscored:1983552','whoscored:1903384','whoscored:1983559']),
    controls:Object.freeze({
      forestLeeds:Object.freeze({freeKickPasses:Object.freeze([13,13]),accurateFreeKickPasses:Object.freeze([8,6]),finalThirdFreeKickPasses:Object.freeze([2,1]),directFreeKickShots:Object.freeze([1,2])}),
      bournemouthLeeds:Object.freeze({freeKickPasses:Object.freeze([10,6]),accurateFreeKickPasses:Object.freeze([6,1]),finalThirdFreeKickPasses:Object.freeze([1,1])}),
      leedsBrentford:Object.freeze({freeKicksAwarded:Object.freeze([13,5]),awardLinkedRestarts:Object.freeze([13,5]),restartPasses:Object.freeze([12,5]),directFreeKickShots:Object.freeze([1,0]),narrowFreeKickPasses:Object.freeze([11,5])})
    }),
    authoritativeDefinitions:Object.freeze({
      freeKicks:'Successful Foul event owned by the team awarded the free kick. Pitch Events pairs each counted award to its real subsequent same-team free-kick restart for trajectory rendering.',
      freeKickPasses:'Pass + FreekickTaken, excluding IndirectFreekickTaken (plus standard restart-family exclusions).',
      directFreeKickShots:'Canonical shot family + DirectFreekick qualifier.'
    }),
    evidence:'Leeds-Brentford: 13-5 awards pair to 13-5 genuine restart trajectories: Leeds 12 passes + 1 direct free-kick shot; Brentford 5 passes. Unpaired indirect/offside restarts are not promoted into the award metric.',
    guardrail:'Count Free-Kicks from awards, never from restart actions alone. Render the paired restart action, never fabricate end coordinates on the Foul event.'
  });
  document.dispatchEvent(new CustomEvent('pitchlab:free-kick-definition-ready',{detail:{version:window.PitchLabFreeKickDefinition.version,status:window.PitchLabFreeKickDefinition.status}}));
})();