(()=>{
  const $=id=>document.getElementById(id);
  const pitchPanel=document.querySelector('.pitch-panel');
  const stage=document.querySelector('.pitch-stage');
  const toolbar=document.querySelector('.pitch-view-toggle');
  const from=$('fromRange'),to=$('toRange'),teamEl=$('team'),playerEl=$('player'),eventCount=$('eventCount');
  if(!pitchPanel||!stage||!toolbar||!from||!to||!teamEl||!eventCount||$('passingNetworkViewToggle'))return;

  const button=document.createElement('button');
  button.id='passingNetworkViewToggle';
  button.type='button';
  button.className='pitch-view-toggle__button pitch-view-toggle__button--secondary';
  button.textContent='Passing Network';
  button.setAttribute('aria-pressed','false');
  toolbar.appendChild(button);

  const layer=document.createElement('div');
  layer.id='passingNetworkLayer';
  layer.className='passing-network-layer';
  layer.innerHTML='<svg class="passing-network__links" aria-hidden="true"></svg><div class="passing-network__nodes"></div><div class="passing-network__legend"><button type="button" class="passing-network__legend-toggle" aria-expanded="true">Legend</button><div class="passing-network__legend-content"><span><i class="passing-network__legend-line passing-network__legend-line--thin"></i>fewer passes</span><span><i class="passing-network__legend-line passing-network__legend-line--thick"></i>more passes</span><span><i class="passing-network__legend-node passing-network__legend-node--small"></i>lower involvement</span><span><i class="passing-network__legend-node passing-network__legend-node--large"></i>higher involvement</span></div></div>';
  stage.appendChild(layer);

  const svg=layer.querySelector('.passing-network__links');
  const nodes=layer.querySelector('.passing-network__nodes');
  const legend=layer.querySelector('.passing-network__legend');
  const legendToggle=layer.querySelector('.passing-network__legend-toggle');
  let active=false;

  legendToggle.addEventListener('click',()=>{
    const collapsed=legend.classList.toggle('is-collapsed');
    legendToggle.setAttribute('aria-expanded',String(!collapsed));
  });

  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const typeOf=e=>String(typeof type==='function'?type(e):dn(e?.type)||'');
  const outcome=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const isPass=e=>typeof pass==='function'?pass(e):typeOf(e)==='Pass';
  const isSuccess=e=>typeof success==='function'?success(e):outcome(e)==='successful';
  const evtSec=e=>Number(e?.minute||0)*60+Number(e?.second||0);
  const coords=e=>Number.isFinite(Number(e?.x))&&Number.isFinite(Number(e?.y));
  const periodOf=e=>String(dn(e?.period)||'');
  const samePeriod=(a,b)=>periodOf(a)===periodOf(b);
  const teamNameOf=e=>typeof teamName==='function'?teamName(e):'';
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const surname=name=>{const p=String(name||'Player').trim().split(/\s+/);return p[p.length-1]||name};
  const receiverTypes=new Set(['Pass','BallTouch','TakeOn','Shot','Goal','SavedShot','MissedShots','ShotOnPost','Dispossessed','Foul','Tackle','Interception','BallRecovery','Aerial','Clearance']);
  const opponentControlTypes=new Set(['Pass','BallTouch','TakeOn','Shot','Goal','SavedShot','MissedShots','ShotOnPost','Tackle','Interception','BallRecovery','Aerial','Clearance']);
  const stopTypes=new Set(['OffsidePass','OffsideGiven','End','Start','SubstitutionOff','SubstitutionOn']);

  function playerMeta(){
    const map=new Map();
    if(typeof raw==='undefined'||!raw)return map;
    const add=(p,team)=>{
      const id=String(p?.playerId??p?.id??'');if(!id)return;
      map.set(id,{name:p?.name||p?.displayName||`Player ${id}`,number:p?.shirtNo??p?.shirtNumber??p?.shirt??p?.number??'',team});
    };
    (raw.home?.players||[]).forEach(p=>add(p,raw.home?.name||'Home'));
    (raw.away?.players||[]).forEach(p=>add(p,raw.away?.name||'Away'));
    return map;
  }

  function windowData(){
    if(typeof events==='undefined'||!Array.isArray(events)||!events.length)return {all:[],located:[],max:90*60};
    const max=Math.max(90*60,...events.map(evtSec));
    let a=+from.value,b=+to.value;if(b<=a)b=Math.min(100,a+1);
    const lo=a/100*max,hi=b/100*max;
    const all=events.filter(e=>evtSec(e)>=lo&&evtSec(e)<=hi);
    return {all,located:all.filter(e=>e?.playerId&&coords(e)),max};
  }

  function receiverMap(list){
    const map=new Map();
    const index=new Map(list.map((e,i)=>[e,i]));
    for(const e of list){
      if(!isPass(e)||!isSuccess(e)||!e?.playerId)continue;
      const i=index.get(e),passer=String(e.playerId),team=e.teamId,start=evtSec(e);
      for(let j=i+1;j<list.length&&j<=i+9;j++){
        const n=list[j];
        if(!samePeriod(e,n)||evtSec(n)-start>12)break;
        const t=typeOf(n);
        if(stopTypes.has(t))break;
        if(n.teamId!==team){if(opponentControlTypes.has(t)&&coords(n))break;continue;}
        if(!n.playerId||String(n.playerId)===passer)continue;
        if(receiverTypes.has(t)||coords(n)){map.set(e,String(n.playerId));break;}
      }
    }
    return map;
  }

  function render(){
    if(!active)return;
    if(typeof events==='undefined'||!Array.isArray(events)||!events.length){nodes.innerHTML='<div class="passing-network__empty">Loading passing network…</div>';svg.innerHTML='';return;}
    const meta=playerMeta();
    const {all,located}=windowData();
    const selectedTeam=teamEl.value;
    const home=typeof raw!=='undefined'?(raw.home?.name||''):'';
    const away=typeof raw!=='undefined'?(raw.away?.name||''):'';
    const selectedColour=selectedTeam!=='Both'&&selectedTeam===away?'var(--away-team-colour,#5d79d8)':'var(--home-team-colour,#4ef0ce)';
    layer.style.setProperty('--network-team-colour',selectedColour);
    const filteredLocated=selectedTeam==='Both'?located:located.filter(e=>teamNameOf(e)===selectedTeam);
    const pos=new Map();
    for(const e of filteredLocated){
      const id=String(e.playerId),m=meta.get(id)||{name:`Player ${id}`,number:'',team:teamNameOf(e)};
      const row=pos.get(id)||{id,name:m.name,number:m.number,team:m.team||teamNameOf(e),sx:0,sy:0,n:0};
      row.sx+=Number(e.x);row.sy+=Number(e.y);row.n++;pos.set(id,row);
    }
    const rmap=receiverMap(all);
    const pairs=new Map(),involvement=new Map();
    for(const e of all){
      if(!rmap.has(e))continue;
      if(selectedTeam!=='Both'&&teamNameOf(e)!==selectedTeam)continue;
      const a=String(e.playerId),b=rmap.get(e);if(!pos.has(a)||!pos.has(b))continue;
      const key=[a,b].sort().join('|');
      pairs.set(key,(pairs.get(key)||0)+1);
      involvement.set(a,(involvement.get(a)||0)+1);
      involvement.set(b,(involvement.get(b)||0)+1);
    }
    const rows=[...pos.values()].filter(r=>r.n>0&&involvement.get(r.id)>0);
    if(!rows.length){nodes.innerHTML='<div class="passing-network__empty">No successful pass network in this period.</div>';svg.innerHTML='';return;}
    const points=new Map();
    for(const r of rows){
      const x=Math.max(2,Math.min(98,100-r.sy/r.n));
      const y=Math.max(2,Math.min(98,100-r.sx/r.n));
      points.set(r.id,{x,y,row:r});
    }
    const pairRows=[...pairs.entries()].map(([key,total])=>({key,total,ids:key.split('|')})).filter(p=>points.has(p.ids[0])&&points.has(p.ids[1]));
    const maxPair=Math.max(1,...pairRows.map(p=>p.total));
    const maxInv=Math.max(1,...rows.map(r=>involvement.get(r.id)||0));
    svg.setAttribute('viewBox','0 0 100 100');
    svg.setAttribute('preserveAspectRatio','none');
    svg.innerHTML=pairRows.map(p=>{
      const A=points.get(p.ids[0]),B=points.get(p.ids[1]);
      const ratio=p.total/maxPair;
      const width=(0.45+7.55*Math.pow(ratio,1.18)).toFixed(2);
      const opacity=(0.20+0.78*Math.pow(ratio,.78)).toFixed(2);
      const team=A.row.team;
      const cls=home&&team!==home?' passing-network__link--away':' passing-network__link--home';
      return `<line class="passing-network__link${cls}" x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" style="stroke-width:${width};opacity:${opacity}"><title>${esc(A.row.name)} ↔ ${esc(B.row.name)}: ${p.total} passes</title></line>`;
    }).join('');
    nodes.innerHTML=rows.map(r=>{
      const p=points.get(r.id),inv=involvement.get(r.id)||0;
      const size=26+22*Math.sqrt(inv/maxInv);
      const awayNode=home&&r.team!==home;
      const selected=playerEl&&playerEl.value!=='all'&&String(playerEl.value)===r.id;
      return `<div class="passing-network__player${awayNode?' passing-network__player--away':''}${selected?' is-selected':''}" style="left:${p.x}%;top:${p.y}%;--network-node-size:${size.toFixed(1)}px" title="${esc(r.name)} · ${inv} pass involvements"><div class="passing-network__circle">${esc(r.number||'•')}</div><div class="passing-network__name">${esc(surname(r.name))}</div><div class="passing-network__involvement">${inv}</div></div>`;
    }).join('');
  }

  function deactivateOthers(){
    if(pitchPanel.classList.contains('is-match-stats-view'))$('matchStatsViewButton')?.click();
    if(pitchPanel.classList.contains('is-positions-view'))$('positionsViewToggle')?.click();
  }
  function setActive(on){
    active=!!on;
    if(active)deactivateOthers();
    pitchPanel.classList.toggle('is-passing-network-view',active);
    button.classList.toggle('is-active',active);
    button.setAttribute('aria-pressed',String(active));
    $('pitchMapViewButton')?.classList.toggle('is-active',!active&&!pitchPanel.classList.contains('is-match-stats-view')&&!pitchPanel.classList.contains('is-positions-view'));
    if(active)render();
  }
  button.addEventListener('click',()=>setActive(true));
  $('pitchMapViewButton')?.addEventListener('click',()=>{if(active)setActive(false)},true);
  $('matchStatsViewButton')?.addEventListener('click',()=>{if(active)setActive(false)},true);
  $('positionsViewToggle')?.addEventListener('click',()=>{if(active)setActive(false)},true);
  [from,to,teamEl,playerEl].filter(Boolean).forEach(el=>{el.addEventListener('input',render);el.addEventListener('change',render)});
  document.addEventListener('pitchlab:team-colours-changed',render);
  new MutationObserver(render).observe(eventCount,{childList:true,characterData:true,subtree:true});
})();