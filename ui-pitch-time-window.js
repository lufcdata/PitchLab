(()=>{
  const originalRender=typeof render==='function'?render:null;
  const markerDefs='<defs><marker id="passArrow" markerWidth="1.08" markerHeight="0.78" refX="1.0" refY="0.39" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L1.04,0.39 L0,0.78 Z" fill="#43ece0"/></marker><marker id="missArrow" markerWidth="1.08" markerHeight="0.78" refX="1.0" refY="0.39" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L1.04,0.39 L0,0.78 Z" fill="#8e96a3"/></marker><marker id="eventArrow" markerWidth="1.08" markerHeight="0.78" refX="1.0" refY="0.39" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L1.04,0.39 L0,0.78 Z" fill="#43ede1"/></marker><marker id="assistArrow" markerWidth="1.08" markerHeight="0.78" refX="1.0" refY="0.39" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L1.04,0.39 L0,0.78 Z" fill="#FCDD2D"/></marker><marker id="bigChanceArrow" markerWidth="1.08" markerHeight="0.78" refX="1.0" refY="0.39" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L1.04,0.39 L0,0.78 Z" fill="#FF620D"/></marker><marker id="onTargetArrow" markerWidth="1.08" markerHeight="0.78" refX="1.0" refY="0.39" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L1.04,0.39 L0,0.78 Z" fill="#25ACF5"/></marker><marker id="shotGreyArrow" markerWidth="1.08" markerHeight="0.78" refX="1.0" refY="0.39" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L1.04,0.39 L0,0.78 Z" fill="#D5D9DB"/></marker></defs>';

  function renderFreeKickAwards(root,awards){
    const family=window.PitchLabFreeKickDefinition;
    if(!family?.restartForAward){for(const award of awards)drawPoint(root,award);return}
    for(const award of awards){
      const restart=family.restartForAward(award,events);
      if(!restart){drawPoint(root,award);continue}
      if(family.isDirectFreeKickShot?.(restart)){
        const s=shotStyleForEvent(restart,'shots_dfk');drawShotArrow(root,restart,s.colour,s.marker);
      }else drawPass(root,restart);
    }
  }

  function canonicalRender(){
    if(typeof raw==='undefined'||!raw)return;
    const clock=window.PitchLabCanonicalTime;
    if(!clock){originalRender?.();return}
    clock.derive(events);
    const {lo,hi,max}=clock.bounds();
    const fn=FILTERS[metric.value]||(()=>false);
    let list=events.filter(e=>{const t=clock.timelineSecond(e);return Number.isFinite(t)&&t>=lo&&t<=hi&&fn(e)});
    if(team.value!=='Both')list=list.filter(e=>teamName(e)===team.value);
    if(player.value!=='all')list=list.filter(e=>String(e.playerId)===player.value);
    list.sort((a,b)=>eventPriority(a)-eventPriority(b));

    const root=document.getElementById('eventSvg');if(!root)return;root.innerHTML=markerDefs;
    if(metric.value==='free_kicks'){
      renderFreeKickAwards(root,list);
      document.getElementById('plotLegend').innerHTML='<span class="legend-item"><i class="legend-arrow"></i>Successful Pass</span><span class="legend-item"><i class="legend-arrow unsuccess"></i>Unsuccessful Pass</span><span class="legend-item"><i class="legend-arrow metric" style="--metric-colour:#25ACF5"></i>Direct Free-Kick Shot</span><span class="legend-item"><i class="legend-circle"></i>Restart Location</span>';
    }else if(lineMetric(metric.value)){
      for(const e of list)drawPass(root,e);
      document.getElementById('plotLegend').innerHTML='<span class="legend-item"><i class="legend-arrow"></i>Successful</span><span class="legend-item"><i class="legend-arrow unsuccess"></i>Unsuccessful</span><span class="legend-item"><i class="legend-circle"></i>Event Start</span>';
    }else if(shotArrowMetric(metric.value)){
      for(const e of list){const s=shotStyleForEvent(e,metric.value);drawShotArrow(root,e,s.colour,s.marker)}
      if(metric.value==='shots')document.getElementById('plotLegend').innerHTML='<span class="legend-item"><i class="legend-arrow metric" style="--metric-colour:#25ACF5"></i>On Target</span><span class="legend-item"><i class="legend-arrow metric" style="--metric-colour:#43ede1"></i>Other Shots</span><span class="legend-item"><i class="legend-arrow metric" style="--metric-colour:#D5D9DB"></i>Off Target / Blocked</span>';
      else{const s=shotStyleForEvent(list[0]||{},metric.value);document.getElementById('plotLegend').innerHTML=`<span class="legend-item"><i class="legend-arrow metric" style="--metric-colour:${s.colour}"></i>${metric.options[metric.selectedIndex].text} trajectory</span><span class="legend-item"><i class="legend-circle metric" style="--metric-colour:${s.colour}"></i>Shot Location</span>`}
    }else if(goalArrowMetric(metric.value)){
      for(const e of list)drawShotArrow(root,e,'#43ede1','url(#eventArrow)');
      document.getElementById('plotLegend').innerHTML='<span class="legend-item"><i class="legend-arrow metric" style="--metric-colour:#43ede1"></i>'+metric.options[metric.selectedIndex].text+' trajectory</span><span class="legend-item"><i class="legend-circle metric" style="--metric-colour:#43ede1"></i>Shot Location</span>';
    }else if(attackArrowMetric(metric.value)){
      for(const e of list){const s=attackStyleForEvent(e,metric.value);drawAttackArrow(root,e,s.colour,s.marker)}
      if(metric.value==='chances_created'||metric.value==='keypasses')document.getElementById('plotLegend').innerHTML='<span class="legend-item"><i class="legend-arrow metric" style="--metric-colour:#FCDD2D"></i>Assist</span><span class="legend-item"><i class="legend-arrow metric" style="--metric-colour:#FF620D"></i>Big Chance Created</span><span class="legend-item"><i class="legend-arrow metric" style="--metric-colour:#43ede1"></i>Chance Created</span>';
      else{const s=attackStyleForEvent(list[0]||{},metric.value);document.getElementById('plotLegend').innerHTML=`<span class="legend-item"><i class="legend-arrow metric" style="--metric-colour:${s.colour}"></i>${metric.options[metric.selectedIndex].text} trajectory</span><span class="legend-item"><i class="legend-circle metric" style="--metric-colour:${s.colour}"></i>Event Start</span>`}
    }else{
      for(const e of list)drawPoint(root,e);
      document.getElementById('plotLegend').innerHTML='<span class="legend-item"><i class="legend-circle"></i>'+metric.options[metric.selectedIndex].text+'</span>';
    }

    document.getElementById('eventCount').textContent=list.length;
    const a=Number(from.value),b=Number(to.value);
    const fromLabel=lo<0.5?'0:00':clock.formatClock(lo),toLabel=hi>=max-0.5?'FT':clock.formatClock(hi);
    for(const id of ['fromText','sumFrom']){const el=document.getElementById(id);if(el)el.textContent=fromLabel}
    for(const id of ['toText','sumTo']){const el=document.getElementById(id);if(el)el.textContent=toLabel}
    const track=document.getElementById('activeTrack');if(track){track.style.left=`${a}%`;track.style.width=`${Math.max(0,b-a)}%`}
    document.getElementById('plotTitle').textContent=metric.options[metric.selectedIndex].text;
    document.getElementById('plotTeam').textContent=team.value;
    document.getElementById('plotWindow').textContent=`${fromLabel} - ${toLabel}`;
    const sumTeam=document.getElementById('sumTeam'),sumMetric=document.getElementById('sumMetric');if(sumTeam)sumTeam.textContent=team.value;if(sumMetric)sumMetric.textContent=metric.options[metric.selectedIndex].text;
    const info=document.getElementById('infoText');if(info)info.textContent=metric.value==='free_kicks'?`Showing ${list.length} Gold free kicks awarded · each counted award is rendered from its paired real restart pass/shot trajectory · canonical provider-period timing applied.`:`Showing ${list.length} locked-definition ${metric.options[metric.selectedIndex].text.toLowerCase()} events · canonical provider-period timing applied.`;
  }

  let renderFrame=0;
  function scheduleRender(){if(renderFrame)return;renderFrame=requestAnimationFrame(()=>{renderFrame=0;canonicalRender();});}
  try{window.render=canonicalRender}catch(_){/* global function binding remains callable through event rebinds below */}
  from.oninput=to.oninput=scheduleRender;metric.onchange=scheduleRender;team.onchange=()=>{populatePlayers();scheduleRender()};player.onchange=scheduleRender;
  document.addEventListener('pitchlab:match-loaded',scheduleRender);
  document.addEventListener('pitchlab:metric-bible-ready',scheduleRender);
  document.addEventListener('pitchlab:free-kick-definition-ready',scheduleRender);
  window.PitchLabPitchTimeWindow=Object.freeze({version:'PITCH_TIME_WINDOW_V2_2026-08-31',render:canonicalRender});
  scheduleRender();
})();