(()=>{
  const stage=document.querySelector('.pitch-stage'), panel=document.querySelector('.pitch-panel');
  const metric=document.getElementById('metric'),team=document.getElementById('team'),player=document.getElementById('player');
  if(!stage||!panel||!metric||!team||!player)return;
  const rail=document.querySelector('.pitch-map-mode__rail');if(!rail)return;
  const button=document.createElement('button');button.className='pitch-map-mode__button';button.type='button';button.id='actionsMapMode';button.setAttribute('aria-pressed','false');button.textContent='Actions Map';rail.appendChild(button);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('pitch-actions-map');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('preserveAspectRatio','none');stage.appendChild(svg);
  let active=false;
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const has=(e,...q)=>typeof hasQ==='function'&&hasQ(e,...q);
  function filtered(){
    if(typeof events==='undefined'||!Array.isArray(events))return[];let list=window.PitchLabCanonicalTime?.windowEvents?window.PitchLabCanonicalTime.windowEvents(events):events;
    if(team.value!=='Both'&&typeof teamName==='function')list=list.filter(e=>teamName(e)===team.value);
    if(player.value!=='all')list=list.filter(e=>String(e.playerId)===String(player.value));
    return list.filter(e=>Number.isFinite(+e.x)&&Number.isFinite(+e.y));
  }
  function outcome(e){return window.PitchLabActionOutcomeDefinition?.classifyAction?.(e)||'ignore'}
  function relevant(e,key){
    const fn=typeof FILTERS!=='undefined'&&FILTERS[key];
    if(key==='successful_actions')return outcome(e)==='successful';if(key==='unsuccessful_actions')return outcome(e)==='unsuccessful';if(key==='total_actions')return outcome(e)!=='ignore';
    if(typeof fn==='function')return !!fn(e);
    return false;
  }
  function side(e,key){
    if(['successful_actions','unsuccessful_actions','total_actions'].includes(key))return outcome(e);
    const t=et(e),o=String(dn(e.outcomeType)||'').toLowerCase();
    if(t==='foul')return o==='successful'?'successful':'unsuccessful';
    if(['challenge','dispossessed','error','offsidegiven'].includes(t))return'unsuccessful';
    if(['ballrecovery','interception','clearance','blockedpass','save','tackle'].includes(t))return'successful';
    return o==='unsuccessful'?'unsuccessful':'successful';
  }
  function core(points){
    if(points.length<4)return points;const k=Math.max(3,Math.min(8,Math.round(Math.sqrt(points.length))));
    const scored=points.map((p,i)=>{const ds=points.filter((_,j)=>j!==i).map(q=>Math.hypot(p.x-q.x,p.y-q.y)).sort((a,b)=>a-b);return{p,d:ds[Math.min(k-1,ds.length-1)]||0}}).sort((a,b)=>a.d-b.d);
    const keep=Math.max(3,Math.ceil(points.length*.86));return scored.slice(0,keep).map(x=>x.p);
  }
  function hull(ps){
    if(ps.length<3)return ps;const pts=[...ps].sort((a,b)=>a.x-b.x||a.y-b.y),cross=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);const lo=[];for(const p of pts){while(lo.length>=2&&cross(lo.at(-2),lo.at(-1),p)<=0)lo.pop();lo.push(p)}const hi=[];for(let i=pts.length-1;i>=0;i--){const p=pts[i];while(hi.length>=2&&cross(hi.at(-2),hi.at(-1),p)<=0)hi.pop();hi.push(p)}lo.pop();hi.pop();return lo.concat(hi);
  }
  function poly(points,kind){if(points.length<3)return;const h=hull(core(points));if(h.length<3)return;const el=document.createElementNS(svg.namespaceURI,'polygon');el.setAttribute('points',h.map(p=>`${100-p.y},${100-p.x}`).join(' '));el.classList.add('pitch-actions-map__hull',`is-${kind}`);svg.appendChild(el)}
  function render(){if(!active)return;svg.innerHTML='';const key=metric.value,list=filtered().filter(e=>relevant(e,key)),good=[],bad=[];for(const e of list){const p={x:+e.x,y:+e.y};(side(e,key)==='unsuccessful'?bad:good).push(p)}poly(good,'successful');poly(bad,'unsuccessful')}
  function setMode(on){active=!!on;stage.classList.toggle('is-actions-map',active);panel.classList.toggle('has-actions-map-active',active);button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));if(active){window.PitchLabHeatMap?.setMode?.(false);document.getElementById('eventMapMode')?.classList.remove('is-active');document.getElementById('eventMapMode')?.setAttribute('aria-pressed','false');render()}else svg.innerHTML=''}
  button.addEventListener('click',()=>setMode(true));document.getElementById('eventMapMode')?.addEventListener('click',()=>setMode(false));document.getElementById('heatMapMode')?.addEventListener('click',()=>setMode(false));
  [metric,team,player,document.getElementById('fromRange'),document.getElementById('toRange'),document.getElementById('dateFrom'),document.getElementById('dateTo')].forEach(el=>{el?.addEventListener('input',render);el?.addEventListener('change',render)});document.addEventListener('pitchlab:match-loaded',render);document.addEventListener('pitchlab:canonical-time-ready',render);
  window.PitchLabActionsMap=Object.freeze({version:'ACTIONS_MAP_V1_2026-09-11',render,setMode});
})();