(()=>{
  const $=id=>document.getElementById(id);
  const BOURNEMOUTH_ID='1903384';
  const FOREST_ID='1983552';
  const FOREST_PARTS=[
    './data/ws1983552_00.part','./data/ws1983552_01.part','./data/ws1983552_02.part',
    './data/ws1983552_03.part','./data/ws1983552_04.part',
    './data/ws1983552_05a.part','./data/ws1983552_05b.part',
    './data/ws1983552_06a.part','./data/ws1983552_06b.part',
    './data/ws1983552_07a.part','./data/ws1983552_07b.part',
    './data/ws1983552_08a.part','./data/ws1983552_08b.part'
  ];

  async function fetchText(url){
    const r=await fetch(url+'?v='+Date.now(),{cache:'no-store'});
    if(!r.ok)throw new Error(`Comparison fixture failed to load (${r.status})`);
    return (await r.text()).trim();
  }

  async function decodeForestFixture(){
    const parts=await Promise.all(FOREST_PARTS.map(fetchText));
    const b64=parts.join('');
    let bin;
    try{bin=atob(b64)}catch(err){throw new Error('Forest comparison fixture is incomplete or corrupt.');}
    const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    if(typeof DecompressionStream!=='function')throw new Error('This browser does not support the compressed comparison fixture.');
    try{
      const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      return JSON.parse(await new Response(stream).text());
    }catch(err){
      throw new Error('Forest comparison fixture could not be decompressed.');
    }
  }

  async function loadBournemouthFixture(){
    const r=await fetch('./WS_1903384_raw.json?v='+Date.now(),{cache:'no-store'});
    if(!r.ok)throw new Error(`Bournemouth fixture failed to load (${r.status})`);
    return r.json();
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

  function updateQuery(id){
    try{
      const target=window.parent===window?window:window.parent;
      const u=new URL(target.location.href);
      if(id===FOREST_ID)u.searchParams.set('match',FOREST_ID);else u.searchParams.delete('match');
      target.history.replaceState({},'',u);
    }catch(_){/* non-critical */}
  }

  function applyFixture(data,id){
    if(!data||!Array.isArray(data.events)||!data.events.length)throw new Error('Comparison fixture contains no event data.');
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
    updateQuery(id);
    if(typeof render==='function')render();
    document.dispatchEvent(new CustomEvent('pitchlab:match-loaded',{detail:{id,raw:data,events:data.events}}));
    $('fromRange')?.dispatchEvent(new Event('input',{bubbles:true}));
    $('toRange')?.dispatchEvent(new Event('input',{bubbles:true}));
  }

  async function loadFixture(id){
    const sel=$('pitchlabMatch');
    if(sel)sel.disabled=true;
    try{
      const data=id===FOREST_ID?await decodeForestFixture():await loadBournemouthFixture();
      applyFixture(data,id);
      if($('error'))$('error').textContent='';
    }finally{if(sel)sel.disabled=false;}
  }

  function installSelector(){
    const filters=document.querySelector('.controls-panel .filters');
    if(!filters)return false;
    if($('pitchlabMatch'))return true;
    const field=document.createElement('div');
    field.className='field pitchlab-match-field';
    field.innerHTML=`<label>Match</label><select id="pitchlabMatch" class="selectlike"><option value="${BOURNEMOUTH_ID}">Bournemouth 2–2 Leeds</option><option value="${FOREST_ID}">Nottingham Forest 0–1 Leeds</option></select>`;
    filters.prepend(field);
    const sel=$('pitchlabMatch');
    sel.addEventListener('change',async()=>{
      try{await loadFixture(sel.value);}
      catch(err){console.error(err);if($('error'))$('error').textContent=err.message;}
    });
    return true;
  }

  function requestedMatch(){
    try{return new URLSearchParams(window.parent.location.search).get('match')||new URLSearchParams(location.search).get('match')||'';}
    catch(_){return new URLSearchParams(location.search).get('match')||'';}
  }

  async function install(){
    let tries=0;
    while(!installSelector()&&tries<50){tries++;await new Promise(r=>setTimeout(r,100));}
    if(requestedMatch()===FOREST_ID){
      try{await loadFixture(FOREST_ID);}
      catch(err){console.error(err);if($('error'))$('error').textContent=err.message;}
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();