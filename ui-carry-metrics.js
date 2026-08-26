(()=>{
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const eventType=e=>String(dn(e?.type)||'').toLowerCase().replace(/[\s_-]/g,'');
  const outcome=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const sec=e=>Number(e?.minute||0)*60+Number(e?.second||0);
  const finite=v=>Number.isFinite(Number(v));
  const period=e=>String(dn(e?.period)||'');
  const endPoint=e=>finite(e?.endX)&&finite(e?.endY)?[Number(e.endX),Number(e.endY)]:[Number(e?.x),Number(e?.y)];
  const distM=(x1,y1,x2,y2)=>Math.hypot((Number(x2)-Number(x1))*1.05,(Number(y2)-Number(y1))*0.68);
  const forwardM=(x1,x2)=>(Number(x2)-Number(x1))*1.05;

  const MIN_CARRY_M=5;
  const MAX_CARRY_M=60;
  const MAX_GAP_S=10;
  const PROGRESSIVE_FORWARD_M=5;
  const CARRY_COLOUR='#3BEAED';
  const CARRY_DASH='2.4 2.4';

  const ignoredTypes=new Set(['offsidegiven','cornerawarded','card','start','end','formationchange','substitutionoff','substitutionon']);
  const softOpponentEvents=new Set(['challenge','takeon','aerial']);
  const controlledOpponentEvents=new Set(['pass','ballrecovery','interception','tackle','takeon','balltouch','aerial','clearance','save','keeperpickup','keepersweeper']);

  function sorted(source){
    return [...(Array.isArray(source)?source:[])].sort((a,b)=>sec(a)-sec(b)||(Number(a.eventId)||0)-(Number(b.eventId)||0));
  }

  function usable(e){
    return !!e?.playerId&&finite(e.x)&&finite(e.y)&&!ignoredTypes.has(eventType(e));
  }

  function breaksControl(e,teamId){
    if(!usable(e)||e.teamId===teamId)return false;
    const t=eventType(e);
    if(softOpponentEvents.has(t)&&outcome(e)==='unsuccessful')return false;
    return controlledOpponentEvents.has(t)&&outcome(e)!=='unsuccessful';
  }

  // PROVISIONAL CARRY RECONSTRUCTION UNDER FORENSIC VALIDATION.
  // The Forest and Bournemouth control sets have reopened this family; do not treat this
  // reconstruction as Golden until the start/end ownership model matches both fixtures.
  function reconstruct(source){
    const ordered=sorted(source).filter(e=>finite(e.x)&&finite(e.y));
    const carries=[];
    const seen=new Set();

    for(let i=1;i<ordered.length;i++){
      const next=ordered[i];
      if(!usable(next))continue;
      const teamId=next.teamId,playerId=next.playerId;

      for(let j=i-1;j>=0;j--){
        const prev=ordered[j];
        const gap=sec(next)-sec(prev);
        if(gap>MAX_GAP_S)break;
        if(gap<0||period(prev)!==period(next))continue;
        if(eventType(prev)==='offsidegiven')continue;

        let broken=false;
        for(let k=j+1;k<i;k++){
          if(breaksControl(ordered[k],teamId)){broken=true;break}
        }
        if(broken)continue;
        if(prev.teamId!==teamId)continue;

        const [sx,sy]=endPoint(prev);
        if(!finite(sx)||!finite(sy))continue;
        const ex=Number(next.x),ey=Number(next.y);
        const metres=distM(sx,sy,ex,ey);
        if(metres<MIN_CARRY_M||metres>MAX_CARRY_M)continue;

        const key=`${playerId}:${prev.eventId??j}:${next.eventId??i}`;
        if(seen.has(key))break;
        seen.add(key);
        carries.push({
          playerId,teamId,
          minute:Number(next.minute||0),second:Number(next.second||0),period:next.period,
          startX:sx,startY:sy,endX:ex,endY:ey,
          distanceM:metres,
          forwardM:forwardM(sx,ex),
          progressive:forwardM(sx,ex)>=PROGRESSIVE_FORWARD_M,
          startEventId:prev.eventId??null,endEventId:next.eventId??null
        });
        break;
      }
    }
    return carries;
  }

  function summary(carries,predicate=()=>true){
    const list=(Array.isArray(carries)?carries:[]).filter(predicate);
    const count=list.length;
    const distance=list.reduce((s,c)=>s+Number(c.distanceM||0),0);
    const progressive=list.filter(c=>c.progressive).length;
    const progressiveDistance=list.reduce((s,c)=>s+Number(c.forwardM||0),0);
    return {
      carries:count,
      carryingDistanceM:distance,
      avgCarryingDistanceM:count?distance/count:0,
      progressiveCarries:progressive,
      progressiveCarryingDistanceM:progressiveDistance,
      avgProgressiveCarryingDistanceM:progressive?progressiveDistance/progressive:0
    };
  }

  function teamSummary(source,teamId){
    const carries=reconstruct(source);
    return summary(carries,c=>String(c.teamId)===String(teamId));
  }

  function playerSummaries(source){
    const carries=reconstruct(source);
    const map=new Map();
    for(const c of carries){
      if(!map.has(String(c.playerId)))map.set(String(c.playerId),[]);
      map.get(String(c.playerId)).push(c);
    }
    const result=new Map();
    for(const [id,list] of map)result.set(id,{playerId:id,teamId:list[0]?.teamId,...summary(list)});
    return result;
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

  window.PitchLabCarry={
    version:'provisional-forest-bournemouth-audit-2026-08-26',
    constants:{MIN_CARRY_M,MAX_CARRY_M,MAX_GAP_S,PROGRESSIVE_FORWARD_M,CARRY_COLOUR,CARRY_DASH},
    reconstruct,summary,teamSummary,playerSummaries,distM,forwardM,
    metricMap,isCarryMetric,metricValue,metricDisplay,
    validationStatus:{
      state:'REOPENED',
      note:'Forest and Bournemouth player controls are being used to validate the carry start/end ownership model.'
    }
  };

  const metricEl=document.getElementById('metric');
  if(!metricEl||typeof render!=='function')return;
  let carryGroup=[...metricEl.querySelectorAll('optgroup')].find(g=>g.label==='Carries');
  if(!carryGroup){carryGroup=document.createElement('optgroup');carryGroup.label='Carries';metricEl.appendChild(carryGroup)}
  Object.entries(metricMap).forEach(([value,meta])=>{
    if(metricEl.querySelector(`option[value="${value}"]`))return;
    const o=document.createElement('option');o.value=value;o.textContent=meta.label;carryGroup.appendChild(o);
    if(typeof FILTERS!=='undefined')FILTERS[value]=()=>false;
  });

  const baseRender=render;
  function teamNameForId(teamId,source){
    const e=source.find(x=>String(x.teamId)===String(teamId));
    return e&&typeof teamName==='function'?teamName(e):'';
  }
  function carryRender(){
    if(!isCarryMetric(metricEl.value)){baseRender();return}
    baseRender();
    if(typeof events==='undefined'||!Array.isArray(events)||!events.length)return;

    const maxMin=Math.max(90,...events.map(e=>Number(e.minute||0)));
    let a=Number(document.getElementById('fromRange')?.value||0),b=Number(document.getElementById('toRange')?.value||100);
    if(b<=a)b=Math.min(100,a+1);
    const lo=a/100*maxMin,hi=b/100*maxMin;
    const windowEvents=events.filter(e=>Number(e.minute||0)>=lo&&Number(e.minute||0)<=hi);
    let carries=reconstruct(windowEvents);
    const teamEl=document.getElementById('team'),playerEl=document.getElementById('player');
    if(teamEl&&teamEl.value!=='Both')carries=carries.filter(c=>teamNameForId(c.teamId,windowEvents)===teamEl.value);
    if(playerEl&&playerEl.value!=='all')carries=carries.filter(c=>String(c.playerId)===String(playerEl.value));
    if(metricMap[metricEl.value].progressiveOnly)carries=carries.filter(c=>c.progressive);

    const root=document.getElementById('eventSvg');
    if(root&&typeof drawAttackArrow==='function'){
      let marker=root.querySelector('#carryArrow');
      if(!marker){
        const defs=root.querySelector('defs')||root.insertBefore(document.createElementNS('http://www.w3.org/2000/svg','defs'),root.firstChild);
        marker=document.createElementNS('http://www.w3.org/2000/svg','marker');
        marker.setAttribute('id','carryArrow');marker.setAttribute('markerWidth','1.08');marker.setAttribute('markerHeight','0.78');marker.setAttribute('refX','1.0');marker.setAttribute('refY','0.39');marker.setAttribute('orient','auto');marker.setAttribute('markerUnits','userSpaceOnUse');
        const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M0,0 L1.04,0.39 L0,0.78 Z');path.setAttribute('fill',CARRY_COLOUR);marker.appendChild(path);defs.appendChild(marker);
      }
      for(const c of carries){
        const before=root.children.length;
        drawAttackArrow(root,{x:c.startX,y:c.startY,endX:c.endX,endY:c.endY},CARRY_COLOUR,'url(#carryArrow)');
        const added=[...root.children].slice(before);
        const line=added.find(el=>el.tagName?.toLowerCase()==='line');
        if(line){line.setAttribute('stroke',CARRY_COLOUR);line.setAttribute('stroke-dasharray',CARRY_DASH);line.setAttribute('stroke-linecap','round');}
        const circle=added.find(el=>el.tagName?.toLowerCase()==='circle');
        if(circle)circle.setAttribute('fill',CARRY_COLOUR);
      }
    }
    const count=document.getElementById('eventCount');if(count)count.textContent=String(carries.length);
    const legend=document.getElementById('plotLegend');if(legend)legend.innerHTML=`<span class="legend-item"><i class="legend-arrow metric" style="--metric-colour:${CARRY_COLOUR};background:repeating-linear-gradient(90deg,${CARRY_COLOUR} 0 4px,transparent 4px 7px)"></i>Carry trajectory</span><span class="legend-item"><i class="legend-circle metric" style="--metric-colour:${CARRY_COLOUR}"></i>Carry start</span>`;
    const info=document.getElementById('infoText');if(info)info.textContent=`Showing ${carries.length} provisional carry trajectories · reconstruction currently under Forest/Bournemouth validation.`;
  }
  render=carryRender;
  [metricEl,document.getElementById('team'),document.getElementById('player'),document.getElementById('fromRange'),document.getElementById('toRange')].filter(Boolean).forEach(el=>{
    el.addEventListener('input',()=>{if(isCarryMetric(metricEl.value))carryRender()});
    el.addEventListener('change',()=>{if(isCarryMetric(metricEl.value))carryRender()});
  });
})();