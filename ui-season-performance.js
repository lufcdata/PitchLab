(()=>{
  const CLUB='Leeds', MANIFEST_URL='data/season/2026-27/manifest.json';
  const state={manifest:null,packs:new Map(),selected:[],allCarries:[],loading:false,validation:null};
  const $=id=>document.getElementById(id);
  const fmtDate=s=>{const d=new Date(`${s}T12:00:00`);return Number.isNaN(d.getTime())?s:d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})};
  const selectedPlayerName=()=>{const p=$('player');return p?.value==='all'?'Whole Team':(p?.options[p.selectedIndex]?.text||'Whole Team')};
  const selectedMetricName=()=>{const m=$('metric');return m?.options[m.selectedIndex]?.text||'Metric'};
  const safeName=s=>String(s||'season-performance').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const periodName=e=>String(e?.period?.displayName??e?.period?.name??e?.period??'').toLowerCase().replace(/[\s_-]/g,'');
  const isFirst=e=>{const p=periodName(e);return p.includes('first')||p==='1'||p==='firsthalf'};
  const isSecond=e=>{const p=periodName(e);return p.includes('second')||p==='2'||p==='secondhalf'};

  async function fetchGzipJson(url){
    const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(`Could not load ${url}`);
    if(typeof DecompressionStream==='undefined'||!r.body)throw new Error('This browser does not support compressed season packs.');
    const stream=r.body.pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  }

  function installShell(){
    document.body.classList.add('season-performance-mode');
    const eyebrow=document.querySelector('.eyebrow'),h1=document.querySelector('.page-head h1'),sub=document.querySelector('.page-head .sub');
    if(eyebrow)eyebrow.textContent='Season Performance';
    if(h1)h1.textContent='Season Spatial Performance';
    if(sub)sub.textContent='Gold metric definitions · multi-match aggregation · 1080 × 1350 export';
    const ct=document.querySelector('.controls-title');
    if(ct)ct.innerHTML='<span>Season Controls</span><span class="season-count"><b id="seasonMatchCount">0</b> matches</span>';
    const teamField=$('team')?.closest('.field');if(teamField)teamField.classList.add('season-hidden');
    const team=$('team');if(team){team.innerHTML='<option value="Leeds">Leeds</option>';team.value='Leeds'}
    const filters=document.querySelector('.filters');
    if(filters&&!$('seasonContext')){
      const context=document.createElement('div');context.id='seasonContext';context.className='season-context-card';
      context.innerHTML='<div><strong id="seasonRangeLabel">Loading season…</strong><span id="seasonCompetitionLabel">Premier League · 2026/27</span></div><b id="seasonEventsLoaded">—</b>';
      filters.before(context);
    }
    const panel=document.querySelector('.controls-panel');
    if(panel&&!$('seasonExport')){
      const actions=document.createElement('div');actions.className='season-actions';
      actions.innerHTML='<button id="seasonImport" class="season-export" type="button">Load Season JSONs…</button><input id="seasonImportFiles" type="file" accept=".json,application/json" multiple hidden><button id="seasonExport" class="season-export" type="button">Export 1080 × 1350 PNG</button><span id="seasonStatus" class="season-status">Season packs load on demand</span>';
      panel.appendChild(actions);$('seasonExport').addEventListener('click',exportPng);
      $('seasonImport').addEventListener('click',()=>$('seasonImportFiles')?.click());
      $('seasonImportFiles')?.addEventListener('change',importLocalFiles);
    }
    const heading=document.querySelector('.plot-heading');
    if(heading&&!$('seasonPlayerLine')){const p=document.createElement('div');p.id='seasonPlayerLine';p.className='season-player-line';heading.appendChild(p)}
  }

  function matchInRange(m){
    const a=$('dateFrom')?.value||state.manifest.defaultFrom,b=$('dateTo')?.value||state.manifest.defaultTo;
    return m.date>=a&&m.date<=b;
  }

  async function loadSelected(){
    if(state.loading||!state.manifest)return;
    state.loading=true;
    const status=$('seasonStatus');if(status){status.textContent='Loading selected matches…';status.classList.remove('season-error')}
    try{
      const matches=state.manifest.matches.filter(matchInRange);
      for(const m of matches){
        if(state.packs.has(m.matchId)||!m.pack)continue;
        try{
          const pack=await fetchGzipJson(m.pack);
          for(const e of pack.events||[]){e.__matchId=pack.matchId;e.__matchDate=m.date}
          state.packs.set(m.matchId,pack);
        }catch(err){console.warn('[PitchLab Season] hosted pack unavailable',m.matchId,err)}
      }
      state.selected=matches.filter(m=>state.packs.has(m.matchId));
      applyAggregate();
      if(status)status.textContent=state.selected.length?`${state.selected.length} match${state.selected.length===1?'':'es'} loaded`:'Hosted season packs not installed yet · use Load Season JSONs…';
    }catch(err){
      console.error(err);
      if(status){status.textContent=err.message;status.classList.add('season-error')}
    }finally{state.loading=false}
  }

  function inferCrest(name){
    if(name==='Leeds')return'assets/club-logos/leeds png.png';
    const known={'Brighton':'assets/club-logos/Brighton.png','Brighton & Hove Albion':'assets/club-logos/Brighton.png','Nottingham Forest':'assets/club-logos/Nottingham Forest.png','Brentford':'assets/club-logos/Brentford.png'};
    return known[name]||`assets/club-logos/${encodeURIComponent(name)}.png`;
  }

  function validateLocalFixture(data,fileName){
    if(!Array.isArray(data?.events)||!data.events.length)throw new Error(`${fileName}: fixture contains no events`);
    const home=data.home||{},away=data.away||{};
    if(!home.name||!away.name)throw new Error(`${fileName}: missing home/away team metadata`);
    const homeIsClub=home.name===CLUB,awayIsClub=away.name===CLUB;
    if(homeIsClub===awayIsClub)throw new Error(`${fileName}: fixture must contain ${CLUB} on exactly one side`);
    const clubMeta=homeIsClub?home:away,clubSide=homeIsClub?'home':'away';
    if(clubMeta.teamId===undefined||clubMeta.teamId===null)throw new Error(`${fileName}: ${CLUB} is missing teamId`);
    const subjectId=state.manifest?.clubTeamId;
    if(subjectId!==undefined&&subjectId!==null&&String(clubMeta.teamId)!==String(subjectId))throw new Error(`${fileName}: ${CLUB} teamId ${clubMeta.teamId} conflicts with season teamId ${subjectId}`);
    const date=String(data.startDate||data.startTime||'').slice(0,10);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error(`${fileName}: fixture has no valid YYYY-MM-DD date`);
    return {home,away,clubMeta,clubSide,date};
  }

  function ensureManifestMatch(data,date,index,identity){
    let match=state.manifest.matches.find(m=>m.date===date&&m.home===data.home?.name&&m.away===data.away?.name);
    if(match){
      if(match.clubSide&&match.clubSide!==identity.clubSide)throw new Error(`Manifest side mismatch for ${match.matchId}`);
      if(match.clubTeamId!==undefined&&String(match.clubTeamId)!==String(identity.clubMeta.teamId))throw new Error(`Manifest teamId mismatch for ${match.matchId}`);
      return match;
    }
    const matchId=Number(data.matchId||data.id)||(Number(String(date).replace(/-/g,''))*100+index);
    match={matchId,date,home:data.home?.name||'Home',away:data.away?.name||'Away',clubSide:identity.clubSide,clubTeamId:identity.clubMeta.teamId,score:String(data.ftScore||data.score||'').replace(/\s*:\s*/g,'–'),competition:state.manifest.competition,pack:null,homeCrest:inferCrest(data.home?.name||'Home'),awayCrest:inferCrest(data.away?.name||'Away'),local:true};
    state.manifest.matches.push(match);state.manifest.matches.sort((a,b)=>a.date.localeCompare(b.date)||Number(a.matchId)-Number(b.matchId));return match;
  }

  async function importLocalFiles(){
    const input=$('seasonImportFiles'),files=[...(input?.files||[])];if(!files.length)return;
    const status=$('seasonStatus');if(status){status.textContent=`Reading ${files.length} JSON file${files.length===1?'':'s'}…`;status.classList.remove('season-error')}
    let imported=0,rejected=0;
    for(let fileIndex=0;fileIndex<files.length;fileIndex++){
      const file=files[fileIndex];
      try{
        const data=JSON.parse(await file.text()),identity=validateLocalFixture(data,file.name),date=identity.date;
        const match=ensureManifestMatch(data,date,fileIndex,identity);
        const pack={matchId:match.matchId,startDate:data.startDate,startTime:data.startTime,home:{teamId:data.home?.teamId,name:data.home?.name},away:{teamId:data.away?.teamId,name:data.away?.name},club:{name:CLUB,side:identity.clubSide,teamId:identity.clubMeta.teamId},ftScore:data.ftScore||data.score,htScore:data.htScore,playerIdNameDictionary:data.playerIdNameDictionary||Object.fromEntries([...(data.home?.players||[]),...(data.away?.players||[])].map(p=>[p.playerId,p.name])),events:data.events};
        for(const e of pack.events){e.__matchId=pack.matchId;e.__matchDate=match.date}state.packs.set(pack.matchId,pack);imported++;
      }catch(err){rejected++;console.warn('[PitchLab Season] rejected JSON',file.name,err)}
    }
    state.selected=state.manifest.matches.filter(matchInRange).filter(m=>state.packs.has(m.matchId));applyAggregate();
    if(status){status.textContent=`${imported} JSON${imported===1?'':'s'} imported · ${state.selected.length} matches in range${rejected?` · ${rejected} rejected`:''}`;if(rejected)status.classList.add('season-error')}
    if(input)input.value='';
  }

  function applyAggregate(){
    const packs=state.selected.map(m=>state.packs.get(m.matchId)).filter(Boolean),combined=[];teamIds={};players={};
    for(const pack of packs){teamIds[pack.home.teamId]=pack.home.name;teamIds[pack.away.teamId]=pack.away.name;for(const [id,name] of Object.entries(pack.playerIdNameDictionary||{}))players[id]={name};combined.push(...(pack.events||[]));}
    events=combined;raw={home:{name:CLUB},away:{name:'Season'},season:state.manifest.season,startDate:$('dateFrom')?.value,ftScore:''};
    const p=$('player'),old=p?.value||'all';if(typeof populatePlayers==='function')populatePlayers();if(p&&[...p.options].some(o=>o.value===old))p.value=old;
    updateCarries();syncUi();seasonRender();
  }

  function validateCarryBoundaries(perMatchLists){
    const failures=[],expectedByMatch={},actualByMatch={};
    for(const m of state.selected){
      const id=String(m.matchId),pack=state.packs.get(m.matchId),ids=new Set((pack?.events||[]).map(e=>String(e.eventId)));
      const expected=perMatchLists.get(id)||[];expectedByMatch[id]=expected.length;
      const actual=state.allCarries.filter(c=>String(c.__matchId)===id);actualByMatch[id]=actual.length;
      if(actual.length!==expected.length)failures.push({matchId:m.matchId,reason:'per-match carry parity',expected:expected.length,actual:actual.length});
      for(const c of actual){if(!pack||!ids.has(String(c.startEventId))||!ids.has(String(c.endEventId)))failures.push({matchId:m.matchId,reason:'cross-match carry endpoint',carry:c});}
    }
    const expectedTotal=Object.values(expectedByMatch).reduce((a,b)=>a+b,0),actualTotal=state.allCarries.length;
    if(actualTotal!==expectedTotal)failures.push({reason:'aggregate carry parity',expected:expectedTotal,actual:actualTotal});
    state.validation={carryBoundaryFailures:failures.filter(f=>f.reason==='cross-match carry endpoint').length,carryParityFailures:failures.filter(f=>f.reason.includes('parity')).length,expectedByMatch,actualByMatch,expectedTotal,actualTotal,passed:failures.length===0,failures};
    if(failures.length)throw new Error(`Season carry validation failed (${failures.length})`);return state.validation;
  }

  function updateCarries(){
    state.allCarries=[];if(!window.PitchLabCarry)return;
    const perMatchLists=new Map();
    for(const m of state.selected){
      const pack=state.packs.get(m.matchId);if(!pack)continue;
      const rawList=window.PitchLabCarry.reconstruct(pack.events||[]);perMatchLists.set(String(m.matchId),rawList);
      state.allCarries.push(...rawList.map(c=>({...c,__matchId:m.matchId,__matchDate:m.date})));
    }
    validateCarryBoundaries(perMatchLists);
  }

  function carryInWindow(c,pack){
    const clock=window.PitchLabCanonicalTime;if(!clock)return true;
    const end=(pack.events||[]).find(e=>String(e.eventId)===String(c.endEventId));if(!end)return false;
    if(clock.activePreset==='full')return true;if(clock.activePreset==='first')return isFirst(end);if(clock.activePreset==='second')return isSecond(end);
    clock.derive(pack.events||[]);const {lo,hi}=clock.bounds(),t=clock.timelineSecond(end);return Number.isFinite(t)&&t>=lo&&t<=hi;
  }

  function renderCarriesSeason(){
    const metricEl=$('metric'),root=$('eventSvg');if(!metricEl||!root)return;let list=[];
    for(const m of state.selected){const pack=state.packs.get(m.matchId);if(!pack)continue;list.push(...state.allCarries.filter(c=>String(c.__matchId)===String(m.matchId)&&carryInWindow(c,pack)));}
    const p=$('player');if(p&&p.value!=='all')list=list.filter(c=>String(c.playerId)===String(p.value));if(window.PitchLabCarry.metricMap?.[metricEl.value]?.progressiveOnly)list=list.filter(c=>c.progressive);
    root.innerHTML='<defs><marker id="seasonCarryArrow" markerWidth="1.08" markerHeight="0.78" refX="1.0" refY="0.39" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L1.04,0.39 L0,0.78 Z" fill="#3BEAED"/></marker></defs>';
    for(const c of list){const before=root.children.length;drawAttackArrow(root,{x:c.startX,y:c.startY,endX:c.endX,endY:c.endY},'#3BEAED','url(#seasonCarryArrow)');const added=[...root.children].slice(before),line=added.find(el=>el.tagName?.toLowerCase()==='line');if(line){line.setAttribute('stroke','#3BEAED');line.setAttribute('stroke-dasharray','2.4 2.4');line.setAttribute('stroke-linecap','round')}}
    $('eventCount').textContent=String(list.length);$('plotLegend').innerHTML='<span class="legend-item"><i class="legend-arrow metric" style="--metric-colour:#3BEAED;background:repeating-linear-gradient(90deg,#3BEAED 0 4px,transparent 4px 7px)"></i>Carry trajectory</span><span class="legend-item"><i class="legend-circle metric" style="--metric-colour:#3BEAED"></i>Carry start</span>';
  }

  function seasonRender(){const key=$('metric')?.value,carryMetric=window.PitchLabCarry?.isCarryMetric?.(key);if(carryMetric&&document.querySelector('.pitch-stage.is-heatmap'))window.PitchLabHeatMap?.setMode?.(false);if(carryMetric)renderCarriesSeason();else window.PitchLabPitchTimeWindow?.render?.();syncUi();window.PitchLabHeatMap?.render?.();}
  function syncUi(){const n=state.selected.length,count=$('seasonMatchCount');if(count)count.textContent=String(n);const a=$('dateFrom')?.value||'',b=$('dateTo')?.value||'';const rl=$('seasonRangeLabel');if(rl)rl.textContent=n===1?singleFixtureLabel(state.selected[0]):`${fmtDate(a)} — ${fmtDate(b)}`;const el=$('seasonEventsLoaded');if(el)el.textContent=`${events.length.toLocaleString()} events`;const pl=$('seasonPlayerLine');if(pl)pl.textContent=`${selectedPlayerName()} · ${n} match${n===1?'':'es'}`;const title=$('plotTitle');if(title)title.textContent=selectedMetricName();const t=$('plotTeam');if(t)t.textContent=selectedPlayerName();const info=$('infoText');if(info)info.textContent=`Season Performance · ${n} match${n===1?'':'es'} · ${state.manifest.competition} · derived sequences are reconstructed match-by-match before aggregation.`;}
  function singleFixtureLabel(m){return m?`${m.home} ${m.score} ${m.away}`:'No matches'}
  function bind(){for(const id of ['dateFrom','dateTo']){const el=$(id);if(el)el.addEventListener('change',loadSelected)}for(const id of ['metric','player','fromRange','toRange']){const el=$(id);if(el){el.onchange=seasonRender;el.oninput=seasonRender}}document.querySelectorAll('.period-buttons button').forEach(b=>b.addEventListener('click',()=>setTimeout(seasonRender,0)));}

  function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error(`Could not load ${src}`));img.src=src})}
  async function drawCrest(ctx,src,x,y,size){try{const img=await loadImage(src),r=Math.min(size/img.width,size/img.height),w=img.width*r,h=img.height*r;ctx.drawImage(img,x+(size-w)/2,y+(size-h)/2,w,h)}catch(_){}}
  async function drawSvgOverlay(ctx,x,y,w,h){const svg=$('eventSvg');if(!svg)return;const clone=svg.cloneNode(true);clone.setAttribute('xmlns','http://www.w3.org/2000/svg');clone.setAttribute('width',String(w));clone.setAttribute('height',String(h));const blob=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob);try{const img=await loadImage(url);ctx.drawImage(img,x,y,w,h)}finally{URL.revokeObjectURL(url)}}

  async function exportPng(){
    const btn=$('seasonExport'),old=btn.textContent;btn.textContent='Rendering…';btn.disabled=true;
    try{const c=document.createElement('canvas');c.width=1080;c.height=1350;const ctx=c.getContext('2d');ctx.fillStyle='#0d0e19';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#4ef0ce';ctx.font='800 22px Urbanist, Arial';ctx.fillText('PITCHLAB · SEASON PERFORMANCE',70,76);ctx.fillStyle='#f5f6fa';ctx.font='700 44px Space Grotesk, Arial';ctx.fillText(selectedMetricName(),70,138);ctx.fillStyle='#8a91a0';ctx.font='700 23px Urbanist, Arial';ctx.fillText(selectedPlayerName(),70,176);const matches=state.selected,a=$('dateFrom').value,b=$('dateTo').value;if(matches.length===1){const m=matches[0];await drawCrest(ctx,m.homeCrest,70,206,72);await drawCrest(ctx,m.awayCrest,938,206,72);ctx.fillStyle='#f5f6fa';ctx.textAlign='center';ctx.font='700 26px Space Grotesk, Arial';ctx.fillText(`${m.home}   ${m.score}   ${m.away}`,540,246);ctx.fillStyle='#777f8e';ctx.font='700 18px Urbanist, Arial';ctx.fillText(`${fmtDate(m.date)} · ${m.competition}`,540,278)}else{await drawCrest(ctx,'assets/club-logos/leeds png.png',70,206,74);ctx.textAlign='left';ctx.fillStyle='#f5f6fa';ctx.font='700 28px Space Grotesk, Arial';ctx.fillText(`Leeds United · ${matches.length} Matches`,164,238);ctx.fillStyle='#777f8e';ctx.font='700 18px Urbanist, Arial';ctx.fillText(`${fmtDate(a)} — ${fmtDate(b)} · ${state.manifest.competition}`,164,272)}ctx.textAlign='left';const px=251,py=318,pw=578,ph=Math.round(pw*105/68),pitch=await loadImage('Pitch%20AI%20App%20Ready%20Official%20Aug%2024%202026%20V2.png');ctx.drawImage(pitch,px,py,pw,ph);const heatActive=!!document.querySelector('.pitch-stage.is-heatmap')&&!window.PitchLabCarry?.isCarryMetric?.($('metric')?.value);if(heatActive){const heat=document.querySelector('.pitch-heatmap-canvas');if(heat)ctx.drawImage(heat,px,py,pw,ph)}else await drawSvgOverlay(ctx,px,py,pw,ph);ctx.fillStyle='#697181';ctx.font='800 17px Urbanist, Arial';ctx.fillText(`${$('eventCount').textContent} EVENTS · ${matches.length} MATCH${matches.length===1?'':'ES'} · ${$('plotWindow')?.textContent||'FULL MATCH'}`,70,1260);ctx.fillStyle='#f5f6fa';ctx.font='800 24px Space Grotesk, Arial';ctx.textAlign='center';ctx.fillText('LUFCDATA.LAB',540,1310);ctx.globalAlpha=.32;await drawCrest(ctx,'assets/club-logos/leeds png.png',70,1275,44);ctx.globalAlpha=1;const link=document.createElement('a');link.download=`${safeName(selectedMetricName())}-${safeName(selectedPlayerName())}-${a}-${b}.png`;link.href=c.toDataURL('image/png');link.click();}catch(err){console.error(err);alert(`Export failed: ${err.message}`)}finally{btn.textContent=old;btn.disabled=false}
  }

  async function init(){installShell();try{const r=await fetch(MANIFEST_URL,{cache:'no-store'});if(!r.ok)throw new Error('Season manifest unavailable');state.manifest=await r.json();$('dateFrom').value=state.manifest.defaultFrom;$('dateTo').value=state.manifest.defaultTo;bind();await loadSelected();window.PitchLabSeasonPerformance=Object.freeze({version:'SEASON_PERFORMANCE_V1_3_2026-09-08',reload:loadSelected,render:seasonRender,exportPng,validateCarryBoundaries,state});}catch(err){console.error(err);const s=$('seasonStatus');if(s){s.textContent=err.message;s.classList.add('season-error')}}}
  init();
})();