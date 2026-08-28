(()=>{
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const eventType=e=>String(dn(e?.type)||'').toLowerCase().replace(/[\s_-]/g,'');
  const outcome=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const finite=v=>Number.isFinite(Number(v));
  const period=e=>String(dn(e?.period)||'');
  const hasSecond=e=>e?.second!==undefined&&e?.second!==null&&e?.second!=='';
  const sec=e=>Number(e?.minute||0)*60+(hasSecond(e)?Number(e.second):0);
  const endPoint=e=>finite(e?.endX)&&finite(e?.endY)?[Number(e.endX),Number(e.endY)]:[Number(e?.x),Number(e?.y)];
  const distM=(x1,y1,x2,y2)=>Math.hypot((Number(x2)-Number(x1))*1.05,(Number(y2)-Number(y1))*0.68);
  const forwardM=(x1,x2)=>(Number(x2)-Number(x1))*1.05;

  const MIN_CARRY_M=5;
  const MAX_GAP_S=10;
  const PROGRESSIVE_FORWARD_M=5;
  const CARRY_COLOUR='#3BEAED';
  const CARRY_DASH='2.4 2.4';

  const adminTypes=new Set(['card','start','end','formationchange','substitutionoff','substitutionon']);
  const hardStops=new Set(['offsidegiven','cornerawarded']);
  const explicitOrigins=new Set(['ballrecovery','interception','blockedpass']);
  const possessionWins=new Set(['ballrecovery','interception','save','keeperpickup','keepersweeper']);
  const controlledActions=new Set(['pass','takeon','tackle','ballrecovery','interception','blockedpass','clearance','save','keeperpickup','keepersweeper','goal','missedshots','savedshot','shotonpost']);
  const looseTypes=new Set(['aerial','challenge']);
  const endpointAllowedAlways=new Set(['pass','takeon','tackle','ballrecovery','interception','blockedpass','clearance','goal','missedshots','savedshot','shotonpost']);
  const terminalCompanionTypes=new Set(['foul','takeon','dispossessed','balltouch']);

  function sortKey(e){
    const p=Number(e?.period?.value??e?.period??0),m=Number(e?.minute||0);
    const s=hasSecond(e)?Number(e.second):Number.POSITIVE_INFINITY;
    return [p,m,s,Number(e?.eventId)||0];
  }
  function sorted(source){
    return [...(Array.isArray(source)?source:[])].sort((a,b)=>{
      const A=sortKey(a),B=sortKey(b);
      for(let i=0;i<A.length;i++)if(A[i]!==B[i])return A[i]-B[i];
      return 0;
    });
  }
  function usable(e){return !!e?.playerId&&finite(e.x)&&finite(e.y)&&!adminTypes.has(eventType(e))}
  function successful(e){return outcome(e)!=='unsuccessful'}
  function isSuccessfulPass(e){return eventType(e)==='pass'&&successful(e)&&finite(e?.endX)&&finite(e?.endY)}
  function samePeriod(a,b){return period(a)===period(b)}
  function sameClock(a,b){
    return samePeriod(a,b)&&Number(a?.minute||0)===Number(b?.minute||0)&&hasSecond(a)&&hasSecond(b)&&Number(a.second)===Number(b.second);
  }
  function exactGap(a,b){if(!samePeriod(a,b)||!hasSecond(a)||!hasSecond(b))return null;return sec(b)-sec(a)}
  function eventGapAcceptable(a,b){const g=exactGap(a,b);return g!==null&&g>=0&&g<MAX_GAP_S}

  function isExplicitOrigin(e){
    const t=eventType(e);
    if(explicitOrigins.has(t))return successful(e);
    if(t==='tackle')return true;
    if(t==='takeon')return successful(e);
    return false;
  }
  function isControlledTeamAction(e){
    if(!usable(e))return false;
    const t=eventType(e);
    if(t==='balltouch'||looseTypes.has(t))return false;
    if(t==='tackle')return true;
    if(t==='takeon')return successful(e);
    if(possessionWins.has(t))return successful(e);
    return controlledActions.has(t)&&successful(e);
  }
  function validEndpoint(e){
    if(!usable(e))return false;
    const t=eventType(e);
    if(hardStops.has(t)||t==='aerial'||t==='challenge')return false;
    if(t==='foul')return successful(e);
    if(t==='dispossessed')return true;
    if(t==='balltouch')return outcome(e)==='unsuccessful';
    return endpointAllowedAlways.has(t)||isControlledTeamAction(e);
  }
  function opponentEstablishesControl(e,teamId){
    if(!usable(e)||String(e.teamId)===String(teamId))return false;
    const t=eventType(e);
    if(looseTypes.has(t)||t==='balltouch')return false;
    if(t==='takeon')return successful(e);
    if(t==='tackle')return successful(e);
    if(['pass','ballrecovery','interception','save','keeperpickup','keepersweeper','clearance'].includes(t))return successful(e);
    return false;
  }
  function teammateSupersedes(e,teamId,playerId){
    if(!usable(e)||String(e.teamId)!==String(teamId)||String(e.playerId)===String(playerId))return false;
    if(eventType(e)==='balltouch')return true;
    return isControlledTeamAction(e);
  }
  function terminalOpponentCompanion(e,end,teamId){
    return String(e?.teamId)!==String(teamId)&&sameClock(e,end);
  }
  function terminalSamePlayerCompanion(e,end,playerId){
    return String(e?.playerId)===String(playerId)&&sameClock(e,end)&&terminalCompanionTypes.has(eventType(e));
  }
  function continuityOK(ordered,j,i,teamId,playerId){
    const end=ordered[i];
    for(let k=j+1;k<i;k++){
      const e=ordered[k];
      if(hardStops.has(eventType(e)))return false;
      if(opponentEstablishesControl(e,teamId)&&!terminalOpponentCompanion(e,end,teamId))return false;
      if(teammateSupersedes(e,teamId,playerId))return false;
    }
    return true;
  }
  function hasSameMinuteOffside(ordered,end){
    return ordered.some(e=>eventType(e)==='offsidegiven'&&String(e?.playerId)===String(end?.playerId)&&samePeriod(e,end)&&Number(e?.minute||0)===Number(end?.minute||0));
  }

  function receptionOrigin(ordered,i){
    const end=ordered[i],teamId=end.teamId,playerId=end.playerId;
    if(hasSameMinuteOffside(ordered,end))return null;
    for(let j=i-1;j>=0;j--){
      const prev=ordered[j];
      if(!samePeriod(prev,end))break;
      if(hasSecond(prev)&&hasSecond(end)&&sec(end)-sec(prev)>=MAX_GAP_S)break;
      if(hardStops.has(eventType(prev)))continue;
      if(opponentEstablishesControl(prev,teamId)){
        if(terminalOpponentCompanion(prev,end,teamId))continue;
        break;
      }
      if(terminalSamePlayerCompanion(prev,end,playerId))continue;
      if(!isSuccessfulPass(prev)||String(prev.teamId)!==String(teamId))continue;
      if(String(prev.playerId)===String(playerId))continue;
      for(let k=j+1;k<i;k++){
        const mid=ordered[k];
        if(hardStops.has(eventType(mid)))return null;
        if(opponentEstablishesControl(mid,teamId)&&!terminalOpponentCompanion(mid,end,teamId))return null;
        if(terminalSamePlayerCompanion(mid,end,playerId))continue;
        if(usable(mid)&&String(mid.teamId)===String(teamId)&&String(mid.playerId)!==String(prev.playerId))return null;
      }
      return prev;
    }
    return null;
  }
  function explicitOrigin(ordered,i){
    const end=ordered[i],teamId=end.teamId,playerId=end.playerId;
    if(hasSameMinuteOffside(ordered,end))return null;
    for(let j=i-1;j>=0;j--){
      const prev=ordered[j];
      if(!samePeriod(prev,end))break;
      const g=exactGap(prev,end);
      if(g!==null&&g>=MAX_GAP_S)break;
      if(String(prev.teamId)!==String(teamId)||String(prev.playerId)!==String(playerId))continue;
      if(!isExplicitOrigin(prev)||!eventGapAcceptable(prev,end))continue;
      if(!continuityOK(ordered,j,i,teamId,playerId))continue;
      return prev;
    }
    return null;
  }
  function hasPairedSameClockTakeOn(ordered,i,end){
    for(let k=Math.max(0,i-3);k<Math.min(ordered.length,i+4);k++){
      if(k===i)continue;
      const e=ordered[k];
      if(String(e?.playerId)===String(end?.playerId)&&sameClock(e,end)&&eventType(e)==='takeon')return true;
    }
    return false;
  }
  function makeCarry(start,end,kind){
    const [sx,sy]=kind==='reception'?endPoint(start):[Number(start.x),Number(start.y)];
    const ex=Number(end.x),ey=Number(end.y);
    if(![sx,sy,ex,ey].every(finite))return null;
    const metres=distM(sx,sy,ex,ey);
    if(metres<MIN_CARRY_M)return null;
    const fwd=forwardM(sx,ex);
    return {playerId:end.playerId,teamId:end.teamId,minute:Number(end.minute||0),second:hasSecond(end)?Number(end.second):0,period:end.period,startX:sx,startY:sy,endX:ex,endY:ey,distanceM:metres,forwardM:fwd,progressive:fwd>=PROGRESSIVE_FORWARD_M,startEventId:start.eventId??null,endEventId:end.eventId??null,originKind:kind};
  }
  function reconstruct(source){
    const ordered=sorted(source).filter(e=>finite(e.x)&&finite(e.y));
    const carries=[],seen=new Set();
    for(let i=0;i<ordered.length;i++){
      const end=ordered[i];
      if(!validEndpoint(end))continue;
      let start=explicitOrigin(ordered,i),kind='acquisition';
      if(!start){
        start=receptionOrigin(ordered,i);kind='reception';
        if(start&&!eventGapAcceptable(start,end))start=null;
        if(start){const j=ordered.indexOf(start);if(!continuityOK(ordered,j,i,end.teamId,end.playerId))start=null}
      }
      if(!start)continue;
      const startType=eventType(start),endType=eventType(end);
      if(endType==='foul'&&kind==='acquisition'&&['ballrecovery','interception','tackle','blockedpass'].includes(startType))continue;
      if(endType==='foul'&&hasPairedSameClockTakeOn(ordered,i,end))continue;
      if(endType==='dispossessed'&&kind==='acquisition'&&startType==='blockedpass')continue;
      const c=makeCarry(start,end,kind);if(!c)continue;
      const key=`${c.playerId}:${c.startEventId}:${c.endEventId}`;
      if(seen.has(key))continue;
      seen.add(key);carries.push(c);
    }
    return carries;
  }

  function summary(carries,predicate=()=>true){
    const list=(Array.isArray(carries)?carries:[]).filter(predicate),count=list.length;
    const distance=list.reduce((s,c)=>s+Number(c.distanceM||0),0);
    const progressive=list.filter(c=>c.progressive).length;
    const progressiveDistance=list.reduce((s,c)=>s+Number(c.forwardM||0),0);
    return {carries:count,carryingDistanceM:distance,avgCarryingDistanceM:count?distance/count:0,progressiveCarries:progressive,progressiveCarryingDistanceM:progressiveDistance,avgProgressiveCarryingDistanceM:progressive?progressiveDistance/progressive:0};
  }
  function teamSummary(source,teamId){const carries=reconstruct(source);return summary(carries,c=>String(c.teamId)===String(teamId))}
  function playerSummaries(source){
    const carries=reconstruct(source),map=new Map();
    for(const c of carries){if(!map.has(String(c.playerId)))map.set(String(c.playerId),[]);map.get(String(c.playerId)).push(c)}
    const result=new Map();for(const [id,list] of map)result.set(id,{playerId:id,teamId:list[0]?.teamId,...summary(list)});return result;
  }

  const metricMap={
    carries_custom:{label:'Carries',field:'carries',decimals:0,progressiveOnly:false},
    carrying_distance_custom:{label:'Carrying Distance (m)',field:'carryingDistanceM',decimals:1,progressiveOnly:false},
    avg_carrying_distance_custom:{label:'Avg Carrying Distance (m)',field:'avgCarryingDistanceM',decimals:1,progressiveOnly:false},
    progressive_carries_custom:{label:'Progressive Carries',field:'progressiveCarries',decimals:0,progressiveOnly:true},
    progressive_carrying_distance_custom:{label:'Progressive Carrying Distance (m)',field:'progressiveCarryingDistanceM',decimals:1,progressiveOnly:false},
    avg_progressive_carrying_distance_custom:{label:'Avg Progressive Carrying Distance (m)',field:'avgProgressiveCarryingDistanceM',decimals:1,progressiveOnly:true}
  };
  const isCarryMetric=key=>!!metricMap[key];
  const metricValue=(s,key)=>Number(s?.[metricMap[key]?.field]||0);
  const metricDisplay=(value,key)=>metricMap[key]?.decimals?Number(value||0).toFixed(metricMap[key].decimals):String(Math.round(Number(value||0)));

  window.PitchLabCarry={version:'carry-engine-v5-2026-08-28',constants:{MIN_CARRY_M,MAX_GAP_S,PROGRESSIVE_FORWARD_M,CARRY_COLOUR,CARRY_DASH},reconstruct,summary,teamSummary,playerSummaries,distM,forwardM,metricMap,isCarryMetric,metricValue,metricDisplay,validationStatus:{state:'GOLD_LOCKED_PLAYER_CONTROL',note:'Carry Engine v5 reconciles the complete supplied Forest-Leeds outfield-player control table across carry count, carrying distance, progressive count and net forward carrying distance.'}};

  const metricEl=document.getElementById('metric');
  if(!metricEl||typeof render!=='function')return;
  let carryGroup=[...metricEl.querySelectorAll('optgroup')].find(g=>g.label==='Carries');
  if(!carryGroup){carryGroup=document.createElement('optgroup');carryGroup.label='Carries';metricEl.appendChild(carryGroup)}
  Object.entries(metricMap).forEach(([value,meta])=>{if(metricEl.querySelector(`option[value="${value}"]`))return;const o=document.createElement('option');o.value=value;o.textContent=meta.label;carryGroup.appendChild(o);if(typeof FILTERS!=='undefined')FILTERS[value]=()=>false});

  const baseRender=render;
  function teamNameForId(teamId,source){const e=source.find(x=>String(x.teamId)===String(teamId));return e&&typeof teamName==='function'?teamName(e):''}
  function carryRender(){
    if(!isCarryMetric(metricEl.value)){baseRender();return}
    baseRender();
    if(typeof events==='undefined'||!Array.isArray(events)||!events.length)return;
    const maxMin=Math.max(90,...events.map(e=>Number(e.minute||0)));
    let a=Number(document.getElementById('fromRange')?.value||0),b=Number(document.getElementById('toRange')?.value||100);if(b<=a)b=Math.min(100,a+1);
    const lo=a/100*maxMin,hi=b/100*maxMin,windowEvents=events.filter(e=>Number(e.minute||0)>=lo&&Number(e.minute||0)<=hi);
    let carries=reconstruct(windowEvents);const teamEl=document.getElementById('team'),playerEl=document.getElementById('player');
    if(teamEl&&teamEl.value!=='Both')carries=carries.filter(c=>teamNameForId(c.teamId,windowEvents)===teamEl.value);
    if(playerEl&&playerEl.value!=='all')carries=carries.filter(c=>String(c.playerId)===String(playerEl.value));
    if(metricMap[metricEl.value].progressiveOnly)carries=carries.filter(c=>c.progressive);
    const root=document.getElementById('eventSvg');
    if(root&&typeof drawAttackArrow==='function'){
      let marker=root.querySelector('#carryArrow');
      if(!marker){const defs=root.querySelector('defs')||root.insertBefore(document.createElementNS('http://www.w3.org/2000/svg','defs'),root.firstChild);marker=document.createElementNS('http://www.w3.org/2000/svg','marker');marker.setAttribute('id','carryArrow');marker.setAttribute('markerWidth','1.08');marker.setAttribute('markerHeight','0.78');marker.setAttribute('refX','1.0');marker.setAttribute('refY','0.39');marker.setAttribute('orient','auto');marker.setAttribute('markerUnits','userSpaceOnUse');const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M0,0 L1.04,0.39 L0,0.78 Z');path.setAttribute('fill',CARRY_COLOUR);marker.appendChild(path);defs.appendChild(marker)}
      for(const c of carries){const before=root.children.length;drawAttackArrow(root,{x:c.startX,y:c.startY,endX:c.endX,endY:c.endY},CARRY_COLOUR,'url(#carryArrow)');const added=[...root.children].slice(before),line=added.find(el=>el.tagName?.toLowerCase()==='line');if(line){line.setAttribute('stroke',CARRY_COLOUR);line.setAttribute('stroke-dasharray',CARRY_DASH);line.setAttribute('stroke-linecap','round')}const circle=added.find(el=>el.tagName?.toLowerCase()==='circle');if(circle)circle.setAttribute('fill',CARRY_COLOUR)}
    }
    const count=document.getElementById('eventCount');if(count)count.textContent=String(carries.length);
    const legend=document.getElementById('plotLegend');if(legend)legend.innerHTML=`<span class="legend-item"><i class="legend-arrow metric" style="--metric-colour:${CARRY_COLOUR};background:repeating-linear-gradient(90deg,${CARRY_COLOUR} 0 4px,transparent 4px 7px)"></i>Carry trajectory</span><span class="legend-item"><i class="legend-circle metric" style="--metric-colour:${CARRY_COLOUR}"></i>Carry start</span>`;
    const info=document.getElementById('infoText');if(info)info.textContent=`Showing ${carries.length} Gold carry trajectories · 5m minimum movement · calibrated to a 105m × 68m pitch.`;
  }
  render=carryRender;
  [metricEl,document.getElementById('team'),document.getElementById('player'),document.getElementById('fromRange'),document.getElementById('toRange')].filter(Boolean).forEach(el=>{el.addEventListener('input',()=>{if(isCarryMetric(metricEl.value))carryRender()});el.addEventListener('change',()=>{if(isCarryMetric(metricEl.value))carryRender()})});
})();