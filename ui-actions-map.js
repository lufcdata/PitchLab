(()=>{
  const stage=document.querySelector('.pitch-stage'),metric=document.getElementById('metric'),team=document.getElementById('team'),player=document.getElementById('player'),from=document.getElementById('fromRange'),to=document.getElementById('toRange');
  if(!stage||!metric||!team||!player)return;
  const rail=document.querySelector('.pitch-map-mode__rail');if(!rail)return;
  const button=document.createElement('button');button.className='pitch-map-mode__button';button.type='button';button.id='actionsMapMode';button.textContent='Actions Map';button.setAttribute('aria-pressed','false');rail.appendChild(button);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('pitch-actions-map');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');stage.appendChild(svg);
  const BLUE='#20B9F2',RED='#FF525B';let active=false,raf=0;
  const et=e=>String(e?.type?.displayName??e?.type?.name??e?.type??'').replace(/[\s_-]/g,'').toLowerCase();
  const outcome=e=>String(e?.outcomeType?.displayName??e?.outcomeType?.name??e?.outcomeType??'').toLowerCase();
  function source(){
    if(typeof events==='undefined'||!Array.isArray(events))return[];const key=metric.value;if(window.PitchLabCarry?.isCarryMetric?.(key))return[];
    const bible=window.PitchLabMetricBible;let list;
    if(bible?.metricEvents)list=bible.metricEvents(key,events,team.value);else{const fn=(typeof FILTERS!=='undefined'&&FILTERS[key])||(()=>false),scoped=window.PitchLabCanonicalTime?.windowEvents?window.PitchLabCanonicalTime.windowEvents(events):events;list=scoped.filter(fn);if(team.value!=='Both'&&typeof teamName==='function')list=list.filter(e=>teamName(e)===team.value)}
    if(player.value!=='all')list=list.filter(e=>String(e?.playerId)===String(player.value));return list.filter(e=>Number.isFinite(+e.x)&&Number.isFinite(+e.y));
  }
  function polarity(e){
    const action=window.PitchLabActionOutcomeDefinition?.classifyAction?.(e);if(action==='successful')return'positive';if(action==='unsuccessful')return'negative';
    const t=et(e),o=outcome(e);if(t==='foul')return o==='successful'?'positive':'negative';if(t==='challenge'||t==='dispossessed'||t==='error'||t==='offsidegiven')return'negative';if(t==='tackle'||t==='takeon'||t==='aerial'||t==='pass')return o==='unsuccessful'?'negative':'positive';return o==='unsuccessful'?'negative':'positive';
  }
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function dominantCluster(points){
    if(points.length<4)return points;const radius=22,min=Math.max(3,Math.ceil(points.length*.08));let best=[];
    for(const seed of points){const near=points.filter(p=>dist(seed,p)<=radius);if(near.length>best.length)best=near}
    if(best.length<min)return points;
    let cluster=best;for(let pass=0;pass<2;pass++){const cx=cluster.reduce((s,p)=>s+p.x,0)/cluster.length,cy=cluster.reduce((s,p)=>s+p.y,0)/cluster.length;cluster=points.filter(p=>Math.hypot(p.x-cx,p.y-cy)<=radius*1.35)}return cluster.length>=min?cluster:best;
  }
  function hull(points){
    const pts=[...new Map(points.map(p=>[`${p.x.toFixed(3)},${p.y.toFixed(3)}`,p])).values()].sort((a,b)=>a.x-b.x||a.y-b.y);if(pts.length<3)return pts;
    const cross=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x),lo=[],up=[];for(const p of pts){while(lo.length>=2&&cross(lo.at(-2),lo.at(-1),p)<=0)lo.pop();lo.push(p)}for(let i=pts.length-1;i>=0;i--){const p=pts[i];while(up.length>=2&&cross(up.at(-2),up.at(-1),p)<=0)up.pop();up.push(p)}lo.pop();up.pop();return lo.concat(up);
  }
  function pathFor(points){return hull(points).map((p,i)=>`${i?'L':'M'} ${(100-p.y).toFixed(2)} ${(100-p.x).toFixed(2)}`).join(' ')+' Z'}
  function addBoundary(points,colour,kind){
    if(points.length<3)return;const d=pathFor(dominantCluster(points));if(!d)return;
    if(kind==='negative'){const wash=document.createElementNS(svg.namespaceURI,'path');wash.setAttribute('d',d);wash.setAttribute('class','pitch-actions-map__wash is-negative');svg.appendChild(wash)}
    const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',d);path.setAttribute('class',`pitch-actions-map__hull is-${kind}`);path.style.setProperty('--action-colour',colour);svg.appendChild(path)
  }
  function render(){if(!active)return;svg.innerHTML='';const list=source(),positive=[],negative=[];for(const e of list){const p={x:+e.x,y:+e.y};(polarity(e)==='negative'?negative:positive).push(p)}addBoundary(positive,BLUE,'positive');addBoundary(negative,RED,'negative')}
  function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(render)}
  function setMode(on){active=!!on;stage.classList.toggle('is-actions-map',active);button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));if(active){window.PitchLabHeatMap?.setMode?.(false);document.getElementById('eventMapMode')?.classList.remove('is-active');document.getElementById('eventMapMode')?.setAttribute('aria-pressed','false');schedule()}}
  button.addEventListener('click',()=>setMode(true));document.getElementById('eventMapMode')?.addEventListener('click',()=>setMode(false));document.getElementById('heatMapMode')?.addEventListener('click',()=>setMode(false));
  [metric,team,player,from,to].forEach(el=>{el?.addEventListener('input',schedule);el?.addEventListener('change',schedule)});document.addEventListener('pitchlab:canonical-time-ready',schedule);document.addEventListener('pitchlab:match-loaded',schedule);const count=document.getElementById('eventCount');if(count)new MutationObserver(schedule).observe(count,{subtree:true,childList:true,characterData:true});
  window.PitchLabActionsMap=Object.freeze({version:'ACTIONS_MAP_V1_1_2026-09-11',render:schedule,setMode});
})();