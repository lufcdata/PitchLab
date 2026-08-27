(()=>{
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const oc=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const ok=e=>oc(e)!=='unsuccessful';
  const hq=(e,...q)=>typeof hasQ==='function'&&hasQ(e,...q);
  const ts=e=>Number(e?.minute||0)*60+Number(e?.second||0);
  const teamOf=e=>typeof teamName==='function'?teamName(e):String(e?.teamId??'');
  const coords=e=>Number.isFinite(Number(e?.x))&&Number.isFinite(Number(e?.y));
  const shotFamily=e=>['goal','missedshots','savedshot','shotonpost'].includes(et(e))&&!hq(e,'OwnGoal');
  const shotOn=e=>shotFamily(e)&&(et(e)==='goal'||(et(e)==='savedshot'&&!hq(e,'Blocked')));
  const shotOff=e=>shotFamily(e)&&['missedshots','shotonpost'].includes(et(e));
  const shotBlocked=e=>shotFamily(e)&&et(e)==='savedshot'&&hq(e,'Blocked');
  const shotLoc=(e,which)=>{
    const q=(e?.qualifiers||[]).map(x=>String(dn(x?.type)||''));
    if(which==='6yd')return q.some(x=>x.startsWith('SmallBox'));
    if(which==='box')return q.some(x=>(x.startsWith('Box')||x.startsWith('DeepBox'))&&!x.startsWith('SmallBox'));
    if(which==='outside')return q.some(x=>x.startsWith('OutOfBox')||x.startsWith('ThirtyFivePlus'));
    return false;
  };
  const shotSetPiece=e=>shotFamily(e)&&hq(e,'FromCorner','SetPiece','DirectFreekick','ThrowinSetPiece')&&!hq(e,'Penalty');
  const setPlayCross=e=>et(e)==='pass'&&hq(e,'Cross')&&!hq(e,'ThrowIn','ThrowinSetPiece','GoalKick','GoalKickTaken')&&hq(e,'CornerTaken','FreeKickTaken','FreekickTaken','SetPiece','DirectFreekick');

  const defs={
    interceptions:{label:'Interceptions',test:e=>et(e)==='interception'},
    goal_kicks:{label:'Goal Kicks',test:e=>et(e)==='pass'&&hq(e,'GoalKick')},
    touches:{label:'Touches',test:e=>e?.isTouch===true},
    touch_box:{label:'Penalty Box Touches',test:e=>e?.isTouch===true&&Number(e?.x)>=((105-16.5)/105*100)&&Number(e?.y)>=21.1&&Number(e?.y)<=78.9},

    shots:{label:'Shots',test:shotFamily},
    shots_on:{label:'Shots On-Target',test:shotOn},
    shots_off:{label:'Shots Off-Target',test:shotOff},
    shots_blocked:{label:'Blocked Shots',test:shotBlocked},
    woodwork:{label:'Woodwork Shots',test:e=>shotFamily(e)&&et(e)==='shotonpost'},
    shots_open:{label:'Shots - Open Play',test:e=>shotFamily(e)&&hq(e,'RegularPlay')},
    shots_fastbreak:{label:'Shots - Fast Break',test:e=>shotFamily(e)&&hq(e,'FastBreak')},
    shots_setpiece:{label:'Shots from Set-Pieces',test:shotSetPiece},
    shots_dfk:{label:'Shots - From Free-Kicks',test:e=>shotFamily(e)&&hq(e,'DirectFreekick')},
    shots_6yd:{label:'Shots - 6 Yard Box',test:e=>shotFamily(e)&&shotLoc(e,'6yd')},
    shots_box:{label:'Shots - Penalty Box',test:e=>shotFamily(e)&&shotLoc(e,'box')},
    shots_penalty_area:{label:'Shots - Penalty Area',test:e=>shotFamily(e)&&(shotLoc(e,'6yd')||shotLoc(e,'box'))},
    shots_outside:{label:'Shots - Outside Box',test:e=>shotFamily(e)&&shotLoc(e,'outside')},
    shots_right:{label:'Shots - Right Foot',test:e=>shotFamily(e)&&hq(e,'RightFoot')},
    shots_left:{label:'Shots - Left Foot',test:e=>shotFamily(e)&&hq(e,'LeftFoot')},
    shots_head:{label:'Shots - Head',test:e=>shotFamily(e)&&hq(e,'Head')},
    shots_other:{label:'Shots - Other',test:e=>shotFamily(e)&&hq(e,'OtherBodyPart')},
    shots_head_setpiece:{label:'Shots - Head from set-pieces',test:e=>shotSetPiece(e)&&hq(e,'Head')},

    fouls_committed:{label:'Fouls',test:e=>et(e)==='foul'&&oc(e)==='unsuccessful'},
    fouled:{label:'Fouled',test:e=>et(e)==='foul'&&oc(e)==='successful'},
    corners:{label:'Corners',test:e=>et(e)==='pass'&&hq(e,'CornerTaken')},
    set_play_crosses_success:{label:'Successful Set Play Crosses',test:e=>setPlayCross(e)&&ok(e)},
    set_play_crosses_unsuccess:{label:'Unsuccessful Set Play Crosses',test:e=>setPlayCross(e)&&!ok(e)},
    accurate_crosses:{label:'Accurate Crosses',test:e=>et(e)==='pass'&&hq(e,'Cross')&&ok(e)},
    inaccurate_crosses:{label:'Inaccurate Crosses',test:e=>et(e)==='pass'&&hq(e,'Cross')&&!ok(e)}
  };

  if(typeof FILTERS!=='undefined'){
    for(const [key,def] of Object.entries(defs))FILTERS[key]=def.test;
  }

  function ensureGroup(sel,label){
    let group=[...sel.querySelectorAll('optgroup')].find(g=>g.label===label);
    if(!group){group=document.createElement('optgroup');group.label=label;sel.appendChild(group)}
    return group;
  }
  function ensureOption(sel,groupLabel,value,text){
    const existing=sel.querySelector(`option[value="${value}"]`);
    if(existing){existing.textContent=text;return existing}
    const o=document.createElement('option');o.value=value;o.textContent=text;ensureGroup(sel,groupLabel).appendChild(o);return o;
  }
  function ensureMetricOptions(){
    const sel=document.getElementById('metric');if(!sel)return;
    ensureOption(sel,'Attacking','shots_penalty_area','Shots - Penalty Area');
    ensureOption(sel,'Attacking','shots_box','Shots - Penalty Box');
    ensureOption(sel,'Attacking','shots_dfk','Shots - From Free-Kicks');
    ensureOption(sel,'Attacking','shots_head_setpiece','Shots - Head from set-pieces');
    ensureOption(sel,'Set-Pieces','goal_kicks','Goal Kicks');
    ensureOption(sel,'Set-Pieces','set_play_crosses_success','Successful Set Play Crosses');
    ensureOption(sel,'Set-Pieces','set_play_crosses_unsuccess','Unsuccessful Set Play Crosses');
    ensureOption(sel,'Defensive','fouls_committed','Fouls');
    ensureOption(sel,'Defensive','fouled','Fouled');
  }

  function windowBounds(source=window.events){
    const list=Array.isArray(source)?source:[];
    const max=Math.max(90*60,...list.map(ts));
    const from=document.getElementById('fromRange'),to=document.getElementById('toRange');
    if(!from||!to)return {lo:0,hi:max,max};
    let a=+from.value,b=+to.value;if(b<=a)b=Math.min(100,a+1);
    return {lo:a/100*max,hi:b/100*max,max};
  }
  function windowEvents(source=window.events){
    const list=Array.isArray(source)?source:[];const {lo,hi}=windowBounds(list);
    return list.filter(e=>ts(e)>=lo&&ts(e)<=hi);
  }
  function metricEvents(key,source=window.events,team='Both'){
    const fn=(typeof FILTERS!=='undefined'&&FILTERS[key])||defs[key]?.test||(()=>false);
    let list=windowEvents(source).filter(fn);
    if(team&&team!=='Both')list=list.filter(e=>teamOf(e)===team);
    return list;
  }
  function playerRows(key,source=window.events,team='Both'){
    if(window.PitchLabCarry?.isCarryMetric?.(key)){
      const rows=[];for(const [id,s] of window.PitchLabCarry.playerSummaries(windowEvents(source))){
        const ev=windowEvents(source).find(e=>String(e.teamId)===String(s.teamId));const tm=ev?teamOf(ev):'';
        if(team!=='Both'&&tm!==team)continue;
        const value=window.PitchLabCarry.metricValue(s,key);if(!value)continue;
        rows.push({id:String(id),team:tm,value,display:window.PitchLabCarry.metricDisplay(value,key)});
      }return rows;
    }
    const map=new Map();for(const e of metricEvents(key,source,team)){
      if(!e?.playerId)continue;const id=String(e.playerId),r=map.get(id)||{id,team:teamOf(e),value:0};r.value++;map.set(id,r);
    }return [...map.values()];
  }

  function inferRecipients(source=window.events){
    const list=windowEvents(source);const map=new Map();
    const period=e=>String(dn(e?.period)||'');
    const receiverTypes=new Set(['pass','balltouch','takeon','shot','goal','savedshot','missedshots','shotonpost','dispossessed','foul','tackle','interception','ballrecovery','aerial','clearance']);
    const oppControl=new Set(['pass','balltouch','takeon','shot','goal','savedshot','missedshots','shotonpost','tackle','interception','ballrecovery','aerial','clearance']);
    const stops=new Set(['offsidepass','offsidegiven','end','start','substitutionoff','substitutionon']);
    for(let i=0;i<list.length;i++){
      const e=list[i];if(et(e)!=='pass'||!ok(e)||!e?.playerId)continue;
      const passer=String(e.playerId),team=e.teamId,start=ts(e);
      for(let j=i+1;j<list.length&&j<=i+9;j++){
        const n=list[j];if(period(n)!==period(e)||ts(n)-start>12)break;const t=et(n);if(stops.has(t))break;
        if(n.teamId!==team){if(oppControl.has(t)&&coords(n))break;continue}
        if(!n.playerId||String(n.playerId)===passer)continue;
        if(receiverTypes.has(t)||coords(n)){map.set(e,String(n.playerId));break}
      }
    }
    return map;
  }

  function averagePositions(source=window.events,team='Both'){
    const rows=new Map();for(const e of windowEvents(source)){
      if(!e?.playerId||!coords(e)||(team!=='Both'&&teamOf(e)!==team))continue;
      const id=String(e.playerId),r=rows.get(id)||{id,team:teamOf(e),sx:0,sy:0,n:0};r.sx+=Number(e.x);r.sy+=Number(e.y);r.n++;rows.set(id,r);
    }
    return [...rows.values()].map(r=>({...r,avgX:r.sx/r.n,avgY:r.sy/r.n}));
  }

  window.PitchLabMetricBible={
    version:'METRIC_BIBLE_SYNC_V3_SHOTS_2026-08-27',defs,ts,teamOf,windowBounds,windowEvents,metricEvents,playerRows,inferRecipients,averagePositions,
    forestLeedsControls:{
      interceptions:[2,15],goalKicks:[6,10],touches:[617,500],penaltyBoxTouches:[22,15],
      shots:[12,11],shotsOnTarget:[2,3],shotsOffTarget:[8,2],blockedShots:[2,6],woodworkShots:[1,0],
      shotsPenaltyArea:[6,6],shots6Yard:[1,1],shotsPenaltyBox:[5,5],shotsOutsideBox:[6,5],
      shotsOpenPlay:[4,4],shotsSetPieces:[8,7],shotsFastBreak:[0,0],shotsFreeKicks:[1,2],
      shotsRightFoot:[6,5],shotsLeftFoot:[1,3],headedShots:[5,3],shotsOther:[0,0],shotsHeadSetPieces:[5,3],
      fouls:[15,14],fouled:[14,15],corners:[3,2],
      successfulSetPlayCrosses:[1,1],unsuccessfulSetPlayCrosses:[5,2],accurateCrosses:[4,3],inaccurateCrosses:[15,5],totalCrosses:[19,8]
    }
  };

  ensureMetricOptions();
  document.dispatchEvent(new CustomEvent('pitchlab:metric-bible-ready',{detail:{version:window.PitchLabMetricBible.version}}));
  ['metric','team','player','fromRange','toRange'].forEach(id=>{const el=document.getElementById(id);if(el)el.dispatchEvent(new Event('change',{bubbles:true}))});
})();