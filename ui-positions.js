(()=>{
  const $=id=>document.getElementById(id);
  const pitchPanel=document.querySelector('.pitch-panel');
  const stage=document.querySelector('.pitch-stage');
  const toolbar=document.querySelector('.pitch-view-toggle');
  const statsToggle=$('pitchViewToggle');
  const from=$('fromRange'),to=$('toRange'),teamEl=$('team'),eventCount=$('eventCount');
  if(!pitchPanel||!stage||!toolbar||!from||!to||!teamEl||!eventCount||$('positionsViewToggle'))return;

  const positionsToggle=document.createElement('button');
  positionsToggle.id='positionsViewToggle';
  positionsToggle.type='button';
  positionsToggle.className='pitch-view-toggle__button pitch-view-toggle__button--secondary';
  positionsToggle.textContent='Positions';
  positionsToggle.setAttribute('aria-pressed','false');
  toolbar.appendChild(positionsToggle);

  const layer=document.createElement('div');
  layer.id='positionsLayer';
  layer.className='positions-layer';
  stage.appendChild(layer);

  let active=false;
  const localEvtSec=e=>Number(e?.minute||0)*60+Number(e?.second||0);
  const coords=e=>Number.isFinite(Number(e?.x))&&Number.isFinite(Number(e?.y));
  const getTeam=e=>typeof teamName==='function'?teamName(e):'';
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt',"'":'&#39;','"':'&quot;'}[c]));
  const surname=name=>{const clean=String(name||'Player').trim();const parts=clean.split(/\s+/);return parts[parts.length-1]||clean;};
  function playerMeta(){
    const map=new Map();if(typeof raw==='undefined'||!raw)return map;
    const add=(p,team)=>{const id=String(p?.playerId??p?.id??'');if(!id)return;map.set(id,{name:p?.name||p?.displayName||`Player ${id}`,number:p?.shirtNo??p?.shirtNumber??p?.shirt??p?.number??'',team});};
    (raw.home?.players||[]).forEach(p=>add(p,raw.home?.name||'Home'));(raw.away?.players||[]).forEach(p=>add(p,raw.away?.name||'Away'));return map;
  }
  function currentWindow(){
    if(typeof events==='undefined'||!Array.isArray(events)||!events.length)return {list:[],max:90*60};
    const canonical=window.PitchLabCanonicalTime;
    if(canonical?.windowEvents&&canonical?.bounds){const b=canonical.bounds();return {list:canonical.windowEvents(events).filter(e=>coords(e)&&e.playerId),max:b.max};}
    const max=Math.max(90*60,...events.map(localEvtSec));let a=+from.value,b=+to.value;if(b<=a)b=Math.min(100,a+1);const lo=a/100*max,hi=b/100*max;return {list:events.filter(e=>localEvtSec(e)>=lo&&localEvtSec(e)<=hi&&coords(e)&&e.playerId),max};
  }
  function render(){
    if(!active)return;if(typeof events==='undefined'||!Array.isArray(events)||!events.length){layer.innerHTML='<div class="positions-empty">Loading average positions…</div>';return}
    const meta=playerMeta();const {list}=currentWindow();const selectedTeam=teamEl.value;const filtered=selectedTeam==='Both'?list:list.filter(e=>getTeam(e)===selectedTeam);const acc=new Map();
    for(const e of filtered){const id=String(e.playerId);const m=meta.get(id)||{name:(typeof players!=='undefined'&&players[e.playerId]?.name)||`Player ${id}`,number:'',team:getTeam(e)};const row=acc.get(id)||{id,name:m.name,number:m.number,team:m.team||getTeam(e),sx:0,sy:0,n:0};row.sx+=Number(e.x);row.sy+=Number(e.y);row.n+=1;acc.set(id,row);}
    const homeName=typeof raw!=='undefined'?raw.home?.name:'';const rows=[...acc.values()].filter(r=>r.n>0).sort((a,b)=>b.n-a.n);if(!rows.length){layer.innerHTML='<div class="positions-empty">No player locations in this period.</div>';return}
    layer.innerHTML=rows.map(r=>{const avgX=r.sx/r.n,avgY=r.sy/r.n;const left=Math.max(2,Math.min(98,100-avgY));const top=Math.max(2,Math.min(98,100-avgX));const away=homeName&&r.team!==homeName;return `<div class="position-player${away?' position-player--away':''}" style="left:${left}%;top:${top}%" data-player-id="${esc(r.id)}" title="${esc(r.name)} · ${r.n} located events"><div class="position-player__circle">${esc(r.number||'•')}</div><div class="position-player__name">${esc(surname(r.name))}</div></div>`;}).join('');
  }
  let renderFrame=0;
  function scheduleRender(){if(renderFrame)return;renderFrame=requestAnimationFrame(()=>{renderFrame=0;render();});}
  function setActive(on){active=!!on;if(active&&pitchPanel.classList.contains('is-match-stats-view'))statsToggle?.click();pitchPanel.classList.toggle('is-positions-view',active);positionsToggle.classList.toggle('is-active',active);positionsToggle.setAttribute('aria-pressed',String(active));if(active)render();}
  positionsToggle.addEventListener('click',()=>setActive(!active));statsToggle?.addEventListener('click',()=>{if(active)setActive(false)},true);[from,to,teamEl].forEach(el=>{el.addEventListener('input',scheduleRender);el.addEventListener('change',scheduleRender)});document.addEventListener('pitchlab:canonical-time-ready',scheduleRender);document.addEventListener('pitchlab:match-loaded',scheduleRender);new MutationObserver(scheduleRender).observe(eventCount,{childList:true,characterData:true,subtree:true});
})();