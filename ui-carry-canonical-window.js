(()=>{
  const CARRY_COLOUR='#3BEAED';
  const CARRY_DASH='2.4 2.4';
  let scheduled=false;

  function isCarryMetric(){
    const metric=document.getElementById('metric');
    return !!(metric&&window.PitchLabCarry?.isCarryMetric?.(metric.value));
  }

  function schedule(){
    if(!isCarryMetric()||scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;renderCanonicalCarries()});
  }

  function teamNameForId(teamId,source){
    const e=(Array.isArray(source)?source:[]).find(x=>String(x?.teamId)===String(teamId));
    return e&&typeof teamName==='function'?teamName(e):'';
  }

  function ensureMarker(root){
    let marker=root.querySelector('#carryArrow');
    if(marker)return marker;
    const ns='http://www.w3.org/2000/svg';
    const defs=root.querySelector('defs')||root.insertBefore(document.createElementNS(ns,'defs'),root.firstChild);
    marker=document.createElementNS(ns,'marker');
    marker.setAttribute('id','carryArrow');marker.setAttribute('markerWidth','1.08');marker.setAttribute('markerHeight','0.78');marker.setAttribute('refX','1.0');marker.setAttribute('refY','0.39');marker.setAttribute('orient','auto');marker.setAttribute('markerUnits','userSpaceOnUse');
    const path=document.createElementNS(ns,'path');path.setAttribute('d','M0,0 L1.04,0.39 L0,0.78 Z');path.setAttribute('fill',CARRY_COLOUR);marker.appendChild(path);defs.appendChild(marker);
    return marker;
  }

  function renderCanonicalCarries(){
    if(!isCarryMetric())return;
    const carry=window.PitchLabCarry,clock=window.PitchLabCanonicalTime;
    if(!carry||!clock||!Array.isArray(window.events))return;
    clock.derive(window.events);
    const scoped=clock.windowEvents(window.events);
    let carries=carry.reconstruct(scoped);
    const teamEl=document.getElementById('team'),playerEl=document.getElementById('player'),metricEl=document.getElementById('metric');
    if(teamEl&&teamEl.value!=='Both')carries=carries.filter(c=>teamNameForId(c.teamId,scoped)===teamEl.value);
    if(playerEl&&playerEl.value!=='all')carries=carries.filter(c=>String(c.playerId)===String(playerEl.value));
    if(carry.metricMap?.[metricEl.value]?.progressiveOnly)carries=carries.filter(c=>c.progressive);

    const root=document.getElementById('eventSvg');
    if(root&&typeof drawAttackArrow==='function'){
      root.innerHTML='';ensureMarker(root);
      for(const c of carries){
        const before=root.children.length;
        drawAttackArrow(root,{x:c.startX,y:c.startY,endX:c.endX,endY:c.endY},CARRY_COLOUR,'url(#carryArrow)');
        const added=[...root.children].slice(before),line=added.find(el=>el.tagName?.toLowerCase()==='line');
        if(line){line.setAttribute('stroke',CARRY_COLOUR);line.setAttribute('stroke-dasharray',CARRY_DASH);line.setAttribute('stroke-linecap','round')}
        const circle=added.find(el=>el.tagName?.toLowerCase()==='circle');if(circle)circle.setAttribute('fill',CARRY_COLOUR);
      }
    }

    const count=document.getElementById('eventCount');if(count)count.textContent=String(carries.length);
    const legend=document.getElementById('plotLegend');if(legend)legend.innerHTML=`<span class="legend-item"><i class="legend-arrow metric" style="--metric-colour:${CARRY_COLOUR};background:repeating-linear-gradient(90deg,${CARRY_COLOUR} 0 4px,transparent 4px 7px)"></i>Carry trajectory</span><span class="legend-item"><i class="legend-circle metric" style="--metric-colour:${CARRY_COLOUR}"></i>Carry start</span>`;
    const info=document.getElementById('infoText');if(info)info.textContent=`Showing ${carries.length} Gold carry trajectories · canonical provider-period timing applied · 5m minimum movement · calibrated to a 105m × 68m pitch.`;
  }

  function installAuthoritativeRenderGuard(){
    const pitchWindow=window.PitchLabPitchTimeWindow;
    if(!pitchWindow||pitchWindow.__carryAware)return;
    const canonical=pitchWindow.render;
    if(typeof canonical!=='function')return;
    const guarded=()=>{if(isCarryMetric())renderCanonicalCarries();else canonical();};
    window.PitchLabPitchTimeWindow=Object.freeze({...pitchWindow,render:guarded,__carryAware:true});
    try{window.render=guarded}catch(_){/* global binding may be non-writable */}
  }

  for(const id of ['metric','team','player','fromRange','toRange']){
    const el=document.getElementById(id);if(!el)continue;
    el.addEventListener('input',schedule);el.addEventListener('change',schedule);
  }
  document.addEventListener('pitchlab:match-loaded',schedule);
  document.addEventListener('pitchlab:canonical-time-ready',schedule);
  document.addEventListener('pitchlab:metric-bible-ready',schedule);
  window.PitchLabCarryCanonicalWindow=Object.freeze({version:'CARRY_CANONICAL_WINDOW_V2_2026-08-30',render:renderCanonicalCarries});

  // ui-pitch-time-window.js loads immediately before this file and owns the final
  // generic Pitch Events render. Guard that surface so carry metrics cannot fall
  // back to their intentionally-false FILTERS entries and erase Gold trajectories.
  installAuthoritativeRenderGuard();
  schedule();
})();