(()=>{
  const METRICS=Object.freeze([
    ['touches','Touches'],['successful','Successful Passes'],['allpasses','Total Passes'],['progressive','Progressive Passes'],['final_third_passes','Final Third Passes'],['through_balls','Through Balls'],
    ['carries_custom','Carries'],['progressive_carries_custom','Progressive Carries'],
    ['shots','Shots'],['chances_created','Chances Created'],['takeons_success','Successful Take-Ons'],['takeons_unsuccess','Unsuccessful Take-Ons'],
    ['recoveries','Ball Recoveries'],['tackles_won','Tackles Won'],['interceptions','Interceptions'],['clearances','Clearances'],['ground_duels_won','Ground Duels Won'],['aerial_duels_won','Aerial Duels Won']
  ]);
  const state={sortKey:'successful',sortDir:-1,per90:false,query:'',team:'Both',group:'All',detail:'All'};
  let root=null,mainHead=null,workspace=null,navButtons=[],carryCache=null,carrySource=null;

  const esc=value=>String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const num=value=>Number.isFinite(Number(value))?Number(value):0;
  const rawData=()=>typeof raw!=='undefined'?raw:null;
  const eventData=()=>typeof events!=='undefined'&&Array.isArray(events)?events:[];
  const bible=()=>window.PitchLabMetricBible;
  const teams=()=>{const r=rawData();return [r?.home?.name||'Home',r?.away?.name||'Away']};
  const allMeta=()=>{const r=rawData();if(!r)return [];return [...(r.home?.players||[]).map(p=>({...p,team:r.home?.name||'Home'})),...(r.away?.players||[]).map(p=>({...p,team:r.away?.name||'Away'}))]};
  const eventType=e=>String(typeof type==='function'?type(e):(e?.type?.displayName??e?.type?.name??e?.type??'')).replace(/[\s_-]/g,'').toLowerCase();

  function rolePosition(player,byId){
    let pos=String(player?.position||'').toUpperCase();
    if((!pos||pos==='SUB')&&player?.subbedOutPlayerId!=null)pos=String(byId.get(String(player.subbedOutPlayerId))?.position||'SUB').toUpperCase();
    return pos||'—';
  }
  function broadPosition(pos){
    const p=String(pos||'').toUpperCase();
    if(p==='GK')return 'GK';
    if(p.startsWith('D')||p.includes('BACK')||['WB','LWB','RWB'].includes(p))return 'DF';
    if(p.startsWith('M')||p.includes('MID'))return 'MF';
    if(p.startsWith('F')||p.startsWith('A')||p.startsWith('S')||p.includes('W'))return 'FW';
    return 'Other';
  }
  function substitutionMinute(playerId,kind){
    const target=kind==='on'?'substitutionon':'substitutionoff',id=String(playerId);
    const event=eventData().find(e=>String(e?.playerId??'')===id&&eventType(e)===target);
    return event?Math.min(90,Math.max(0,num(event.minute))):null;
  }
  function minutesPlayed(player){
    const start=player?.isFirstEleven?0:substitutionMinute(player?.playerId,'on');
    if(start==null)return 0;
    const off=substitutionMinute(player?.playerId,'off');
    const finish=off==null?90:off;
    return Math.max(0,Math.min(90,finish)-Math.min(90,start));
  }

  function carrySummaryMap(){
    const source=eventData();
    if(source===carrySource&&carryCache)return carryCache;
    carrySource=source;carryCache=window.PitchLabCarry?.playerSummaries?.(source)||new Map();return carryCache;
  }
  function metricValue(playerId,key){
    const source=eventData(),id=String(playerId);
    if(window.PitchLabCarry?.isCarryMetric?.(key)){
      const summary=carrySummaryMap().get(id)||carrySummaryMap().get(Number(playerId));
      return summary?num(window.PitchLabCarry.metricValue(summary,key)):0;
    }
    const b=bible(),def=b?.canonicalRegistry?.[key];
    const test=def?.test||((typeof FILTERS!=='undefined'&&FILTERS[key])||null);
    if(typeof test!=='function')return 0;
    let count=0;for(const e of source)if(String(e?.playerId??'')===id&&test(e))count++;
    return count;
  }

  function rows(){
    const meta=allMeta(),byId=new Map(meta.map(p=>[String(p.playerId),p]));
    return meta.map(p=>{
      const position=rolePosition(p,byId),minutes=minutesPlayed(p),values={};
      for(const [key] of METRICS)values[key]=metricValue(p.playerId,key);
      return {id:String(p.playerId),name:p.name||`Player ${p.playerId}`,shirt:p.shirtNo??'—',team:p.team,position,group:broadPosition(position),minutes,values};
    }).filter(r=>r.minutes>0);
  }
  function shownValue(row,key){
    const rawValue=key==='minutes'?row.minutes:row.values[key]||0;
    if(!state.per90||key==='minutes')return rawValue;
    return row.minutes>0?rawValue*90/row.minutes:0;
  }
  function formatValue(value,key){
    if(key==='minutes')return String(Math.round(value));
    if(state.per90)return Number(value).toFixed(1);
    return String(Math.round(value*10)/10).replace(/\.0$/,'');
  }

  function updatePositionOptions(data){
    const detail=root?.querySelector('#playerDbPosition');if(!detail)return;
    const current=state.detail;
    const positions=[...new Set(data.map(r=>r.position).filter(Boolean))].sort();
    detail.innerHTML='<option value="All">All Positions</option>'+positions.map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join('');
    if(positions.includes(current))detail.value=current;else{state.detail='All';detail.value='All'}
  }
  function filteredRows(data){
    const q=state.query.trim().toLowerCase();
    return data.filter(r=>(state.team==='Both'||r.team===state.team)&&(state.group==='All'||r.group===state.group)&&(state.detail==='All'||r.position===state.detail)&&(!q||r.name.toLowerCase().includes(q)||r.team.toLowerCase().includes(q)||String(r.shirt).includes(q)));
  }
  function sortedRows(data){
    const key=state.sortKey,dir=state.sortDir;
    return [...data].sort((a,b)=>{
      if(key==='player')return dir*a.name.localeCompare(b.name);
      if(key==='team')return dir*a.team.localeCompare(b.team);
      if(key==='position')return dir*a.position.localeCompare(b.position);
      const av=shownValue(a,key),bv=shownValue(b,key);return (av===bv?a.name.localeCompare(b.name):(av-bv))*dir;
    });
  }

  function render(){
    if(!root)return;
    const all=rows();updatePositionOptions(all);const data=sortedRows(filteredRows(all));
    const body=root.querySelector('#playerDbBody'),count=root.querySelector('#playerDbCount'),mode=root.querySelector('#playerDbMode');
    if(count)count.textContent=`${data.length} player${data.length===1?'':'s'}`;
    if(mode)mode.textContent=state.per90?'Per 90 minutes':'Totals';
    root.querySelectorAll('th[data-sort]').forEach(th=>{const active=th.dataset.sort===state.sortKey;th.classList.toggle('is-sorted',active);const mark=th.querySelector('.sort-mark');if(mark)mark.textContent=active?(state.sortDir<0?'↓':'↑'):'↕'});
    if(!body)return;
    body.innerHTML=data.length?data.map(r=>`<tr>
      <td class="player-col"><div class="player-db__player"><span class="player-db__shirt">${esc(r.shirt)}</span><div><div class="player-db__name">${esc(r.name)}</div><div class="player-db__team">${esc(r.team)}</div></div></div></td>
      <td><span class="player-db__pos">${esc(r.position)}</span></td><td>${Math.round(r.minutes)}</td>
      ${METRICS.map(([key])=>`<td class="${key===state.sortKey?'player-db__num--strong':''}">${formatValue(shownValue(r,key),key)}</td>`).join('')}
    </tr>`).join(''):`<tr><td colspan="${METRICS.length+3}" class="player-db__empty">No players match these filters.</td></tr>`;
  }

  function setView(on){
    if(!root)return;root.classList.toggle('is-active',on);if(mainHead)mainHead.style.display=on?'none':'';if(workspace)workspace.style.display=on?'none':'';
    navButtons.forEach(b=>b.classList.toggle('active',on?b.textContent.trim()==='Player':b.textContent.trim()==='Pitch Events'));
    if(on){syncFixture();render()}
  }
  function syncFixture(){
    const r=rawData(),el=root?.querySelector('#playerDbFixture');if(!el||!r)return;
    const score=String(r.score||r.ftScore||'').trim();el.innerHTML=`<b>${esc(r.home?.name||'Home')}${score?` ${esc(score)} `:' v '}${esc(r.away?.name||'Away')}</b> &nbsp;|&nbsp; Premier League`;
    const teamsSelect=root.querySelector('#playerDbTeam');const current=state.team;const names=teams();teamsSelect.innerHTML='<option value="Both">Both Teams</option>'+names.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('');if(current==='Both'||names.includes(current))teamsSelect.value=current;else{state.team='Both';teamsSelect.value='Both'}
  }

  function install(){
    const shell=document.querySelector('.shell'),topbar=document.querySelector('.topbar');mainHead=document.querySelector('.page-head');workspace=document.querySelector('.workspace');
    if(!shell||!topbar||!mainHead||!workspace||document.getElementById('playerDatabaseView'))return;
    navButtons=[...topbar.querySelectorAll('.nav button')];
    root=document.createElement('section');root.id='playerDatabaseView';root.className='player-db';
    root.innerHTML=`<div class="player-db__head"><div><div class="player-db__eyebrow">Player Database</div><h1 class="player-db__title">Match Player Leaderboard</h1><div class="player-db__sub">Gold Metric Bible player totals · sortable match database</div></div><div id="playerDbFixture" class="player-db__fixture"></div></div>
    <section class="player-db__panel"><div class="player-db__toolbar">
      <div class="player-db__field player-db__search"><label>Search Players</label><input id="playerDbSearch" class="player-db__control" type="search" placeholder="Search player, team or shirt number…"></div>
      <div class="player-db__field"><label>Team</label><select id="playerDbTeam" class="player-db__control"></select></div>
      <div class="player-db__field"><label>Position Group</label><select id="playerDbGroup" class="player-db__control"><option value="All">All Groups</option><option value="GK">Goalkeepers</option><option value="DF">Defenders</option><option value="MF">Midfielders</option><option value="FW">Forwards</option></select></div>
      <div class="player-db__field"><label>Match Position</label><select id="playerDbPosition" class="player-db__control"><option value="All">All Positions</option></select></div>
      <div class="player-db__toggle-wrap"><button id="playerDbPer90" class="player-db__toggle" type="button" aria-pressed="false"><span>Per 90</span><span class="player-db__toggle-track"><span class="player-db__toggle-knob"></span></span></button></div>
    </div><div class="player-db__meta"><span><strong id="playerDbCount">0 players</strong> · <span id="playerDbMode">Totals</span></span><span>Click any column to sort</span></div>
    <div class="player-db__table-wrap"><table class="player-db__table"><thead><tr>
      <th class="player-col" data-sort="player">Player <span class="sort-mark">↕</span></th><th data-sort="position">Pos <span class="sort-mark">↕</span></th><th data-sort="minutes">Mins <span class="sort-mark">↕</span></th>
      ${METRICS.map(([key,label])=>`<th data-sort="${key}">${esc(label)} <span class="sort-mark">↕</span></th>`).join('')}
    </tr></thead><tbody id="playerDbBody"></tbody></table></div><div class="player-db__gold-note"><span class="player-db__gold-dot"></span><span>Values reuse the same authoritative Gold predicates and Carry Engine as Pitch Events and Metric Leaders.</span></div></section>`;
    mainHead.insertAdjacentElement('beforebegin',root);syncFixture();

    root.querySelector('#playerDbSearch').addEventListener('input',e=>{state.query=e.target.value;render()});
    root.querySelector('#playerDbTeam').addEventListener('change',e=>{state.team=e.target.value;render()});
    root.querySelector('#playerDbGroup').addEventListener('change',e=>{state.group=e.target.value;render()});
    root.querySelector('#playerDbPosition').addEventListener('change',e=>{state.detail=e.target.value;render()});
    root.querySelector('#playerDbPer90').addEventListener('click',e=>{state.per90=!state.per90;e.currentTarget.setAttribute('aria-pressed',String(state.per90));render()});
    root.querySelectorAll('th[data-sort]').forEach(th=>th.addEventListener('click',()=>{const key=th.dataset.sort;if(state.sortKey===key)state.sortDir*=-1;else{state.sortKey=key;state.sortDir=key==='player'||key==='position'?1:-1}render()}));

    const playerNav=navButtons.find(b=>b.textContent.trim()==='Player'),pitchNav=navButtons.find(b=>b.textContent.trim()==='Pitch Events');
    playerNav?.addEventListener('click',()=>setView(true));pitchNav?.addEventListener('click',()=>setView(false));
    document.addEventListener('pitchlab:match-loaded',()=>{carrySource=null;carryCache=null;syncFixture();if(root.classList.contains('is-active'))render()});
    ['pitchlab:metric-bible-ready','pitchlab:gold-metric-bible-team-ready','pitchlab:gold-passing-family-ready','pitchlab:progressive-pass-definition-ready','pitchlab:gold-recovery-duels-family-ready'].forEach(name=>document.addEventListener(name,()=>{if(root.classList.contains('is-active'))render()}));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();