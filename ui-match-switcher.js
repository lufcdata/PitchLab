(()=>{
  const $=id=>document.getElementById(id);
  const BOURNEMOUTH_ID='1903384';
  const FOREST_ID='1983552';

  async function decodeGzipBase64(url){
    const r=await fetch(url+'?v='+Date.now(),{cache:'no-store'});
    if(!r.ok)throw new Error(`Comparison fixture failed to load (${r.status})`);
    const b64=(await r.text()).trim();
    const bin=atob(b64);
    const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    if(typeof DecompressionStream!=='function')throw new Error('This browser does not support the compressed comparison fixture.');
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  }

  function fixtureLabel(data){
    const h=data?.home?.name||'Home',a=data?.away?.name||'Away';
    const ft=String(data?.ftScore||data?.score||'').replace(/\s*:\s*/,'–');
    return `${h} ${ft||'–'} ${a}`;
  }

  function rebuildTeamOptions(data){
    const team=$('team');
    if(!team)return;
    const home=data?.home?.name||'Home',away=data?.away?.name||'Away';
    const old=team.value;
    team.innerHTML=`<option value="${home}">${home}</option><option value="${away}">${away}</option><option value="Both">Both Teams</option>`;
    team.value=[home,away,'Both'].includes(old)?old:(away==='Leeds'?'Leeds':home);
  }

  function applyFixture(data,id){
    if(!data||!Array.isArray(data.events))throw new Error('Comparison fixture contains no event data.');
    raw=data;
    events=data.events;
    for(const k of Object.keys(teamIds))delete teamIds[k];
    for(const k of Object.keys(players))delete players[k];
    if(data.home)teamIds[data.home.teamId]=data.home.name;
    if(data.away)teamIds[data.away.teamId]=data.away.name;
    [...(data.home?.players||[]),...(data.away?.players||[])].forEach(p=>players[p.playerId]={name:p.name});
    rebuildTeamOptions(data);
    if(data.startDate&&$('dateFrom'))$('dateFrom').value=$('dateTo').value=String(data.startDate).slice(0,10);
    if(typeof populatePlayers==='function')populatePlayers();
    const pill=document.querySelector('.match-pill b');
    if(pill)pill.textContent=fixtureLabel(data);
    const sel=$('pitchlabMatch');if(sel)sel.value=id;
    if(typeof render==='function')render();
    document.dispatchEvent(new CustomEvent('pitchlab:match-loaded',{detail:{id,raw:data,events:data.events}}));
  }

  async function loadForest(){
    const data=await decodeGzipBase64('./WS_1983552_compact.b64');
    applyFixture(data,FOREST_ID);
  }

  function installSelector(){
    const filters=document.querySelector('.controls-panel .filters');
    if(!filters||$('pitchlabMatch'))return;
    const field=document.createElement('div');
    field.className='field';
    field.innerHTML=`<label>Match</label><select id="pitchlabMatch" class="selectlike"><option value="${BOURNEMOUTH_ID}">Bournemouth 2–2 Leeds</option><option value="${FOREST_ID}">Nottingham Forest 0–1 Leeds</option></select>`;
    filters.appendChild(field);
    const sel=$('pitchlabMatch');
    sel.addEventListener('change',async()=>{
      try{
        if(sel.value===FOREST_ID){await loadForest();}
        else location.reload();
      }catch(err){console.error(err);if($('error'))$('error').textContent=err.message;}
    });
  }

  async function install(){
    installSelector();
    let requested='';
    try{
      requested=new URLSearchParams(window.parent.location.search).get('match')||new URLSearchParams(location.search).get('match')||'';
    }catch(_){requested=new URLSearchParams(location.search).get('match')||'';}
    if(requested===FOREST_ID){
      try{await loadForest();}
      catch(err){console.error(err);if($('error'))$('error').textContent=err.message;}
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();