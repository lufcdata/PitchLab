(()=>{
  const MANIFEST='data/season/2026-27/manifest.json',CLUB='Leeds';
  const S={manifest:null,packs:new Map(),colour:'#FAD119',per90:false,eligible:[],selected:[],loading:false};
  const $=id=>document.getElementById(id);
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const teamId=e=>String(e?.teamId??'');
  const rawSec=e=>Number(e?.minute||0)*60+Number(e?.second||0);
  const sec=e=>{const t=window.PitchLabCanonicalTime?.timelineSecond?.(e);return Number.isFinite(t)?t:rawSec(e)};
  const niceDate=s=>{if(!s)return'';const [y,m,d]=s.split('-').map(Number);return new Date(Date.UTC(y,m-1,d)).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})};
  const fmt=v=>Number.isInteger(v)?v.toLocaleString('en-GB'):v.toLocaleString('en-GB',{maximumFractionDigits:2});
  const slug=s=>String(s||'player-stats').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

  async function gzipJson(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(`Could not load ${url}`);if(typeof DecompressionStream==='undefined'||!r.body)throw new Error('Compressed season packs are not supported by this browser.');return JSON.parse(await new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).text())}

  function metricOptions(){
    const source=$('metric'),out=[],seen=new Set();
    if(source)for(const o of source.querySelectorAll('option')){const key=o.value,fn=window.PitchLabMetricBible?.canonicalRegistry?.[key]?.test||(typeof FILTERS!=='undefined'?FILTERS[key]:null);if(key&&typeof fn==='function'&&!seen.has(key)){seen.add(key);out.push({key,label:o.textContent.trim(),fn})}}
    const reg=window.PitchLabMetricBible?.canonicalRegistry||{};for(const [key,d] of Object.entries(reg)){if(typeof d?.test==='function'&&!seen.has(key)){seen.add(key);out.push({key,label:d.label||key,fn:d.test})}}
    return out.sort((a,b)=>a.label.localeCompare(b.label));
  }

  function install(){
    document.body.classList.add('player-stats-mode');
    const nav=document.querySelector('.nav');if(nav){nav.querySelectorAll('button').forEach(b=>b.classList.remove('active'));let b=[...nav.querySelectorAll('button')].find(x=>x.dataset.playerStatsNav==='1');if(b)b.classList.add('active')}
    const shell=document.querySelector('.shell');if(!shell||$('playerStatsPage'))return;
    const page=document.createElement('main');page.id='playerStatsPage';page.className='player-stats-page';
    page.innerHTML=`<aside class="player-stats-controls"><h2>Player Stats</h2><div class="ps-muted">Build a clean 1080 × 1350 ranked player graphic.</div><div class="ps-control-grid">
      <div class="ps-field ps-wide"><label>Metric</label><select id="psMetric" class="ps-input"></select></div>
      <div class="ps-field"><label>Date From</label><input id="psFrom" class="ps-input" type="date"></div><div class="ps-field"><label>Date To</label><input id="psTo" class="ps-input" type="date"></div>
      <div class="ps-field ps-wide"><label>Competition</label><select id="psCompetition" class="ps-input"></select></div>
      <div class="ps-range-card"><div class="ps-range-top"><span>Match range</span><b id="psRangeLabel">—</b></div><div class="ps-dual-range"><div id="psActiveTrack" class="ps-active-track"></div><input id="psMatchFrom" type="range" min="1" max="1" value="1" aria-label="First match"><input id="psMatchTo" type="range" min="1" max="1" value="1" aria-label="Last match"></div></div>
      <div class="ps-field ps-wide"><label>Values</label><div class="ps-toggle-row"><button id="psTotal" class="ps-toggle active" type="button">TOTAL</button><button id="psPer90" class="ps-toggle" type="button">PER 90</button></div></div>
      <div class="ps-field ps-wide"><label>Bar colour</label><div class="ps-colour-row"><button class="ps-colour" data-colour="#F2F1F0" type="button">WHITE</button><button class="ps-colour active" data-colour="#FAD119" type="button">YELLOW</button></div></div>
    </div><div class="ps-actions"><button id="psExport" class="ps-export" type="button">EXPORT 1080 × 1350 PNG</button></div><div id="psStatus" class="ps-status">Loading season data…</div></aside>
    <section class="ps-preview-wrap"><div class="ps-canvas-shell"><canvas id="playerStatsCanvas" width="1080" height="1350" aria-label="Player statistics ranked bar chart"></canvas><div class="ps-canvas-badge">1080 × 1350 EXPORT</div></div></section>`;
    shell.appendChild(page);
    const opts=metricOptions(),sel=$('psMetric');for(const m of opts){const o=document.createElement('option');o.value=m.key;o.textContent=m.label;sel.appendChild(o)}
    const preferred=['progressive_passes','touches','shots','chances_created','successful'];const p=preferred.find(k=>opts.some(x=>x.key===k));if(p)sel.value=p;
    ['psMetric','psFrom','psTo','psCompetition'].forEach(id=>$(id)?.addEventListener('change',refresh));
    $('psMatchFrom').addEventListener('input',rangeInput);$('psMatchTo').addEventListener('input',rangeInput);
    $('psTotal').addEventListener('click',()=>setPer90(false));$('psPer90').addEventListener('click',()=>setPer90(true));
    document.querySelectorAll('.ps-colour').forEach(b=>b.addEventListener('click',()=>{S.colour=b.dataset.colour;document.querySelectorAll('.ps-colour').forEach(x=>x.classList.toggle('active',x===b));draw()}));
    $('psExport').addEventListener('click',exportPng);
    init();
  }

  async function init(){
    try{S.manifest=await (await fetch(MANIFEST,{cache:'no-store'})).json();const ms=[...S.manifest.matches].sort((a,b)=>a.date.localeCompare(b.date)||Number(a.matchId)-Number(b.matchId));const dates=ms.map(m=>m.date);$('psFrom').value=dates[0];$('psTo').value=dates[dates.length-1];const comps=[...new Set(ms.map(m=>m.competition).filter(Boolean))].sort();$('psCompetition').innerHTML='<option value="all">All Competitions</option>'+comps.map(c=>`<option value="${c.replace(/"/g,'&quot;')}">${c}</option>`).join('');await refresh()}catch(err){$('psStatus').textContent=err.message;console.error('[Player Stats]',err)}
  }

  function candidates(){if(!S.manifest)return[];const from=$('psFrom').value,to=$('psTo').value,comp=$('psCompetition').value;return [...S.manifest.matches].filter(m=>(!from||m.date>=from)&&(!to||m.date<=to)&&(comp==='all'||m.competition===comp)).sort((a,b)=>a.date.localeCompare(b.date)||Number(a.matchId)-Number(b.matchId))}
  function syncRanges(reset=false){S.eligible=candidates();const n=Math.max(1,S.eligible.length),a=$('psMatchFrom'),b=$('psMatchTo');a.max=b.max=n;if(reset||Number(a.value)>n)a.value=1;if(reset||Number(b.value)>n)b.value=n;if(Number(a.value)>Number(b.value))a.value=b.value;rangeVisual();S.selected=S.eligible.slice(Number(a.value)-1,Number(b.value))}
  function rangeVisual(){const a=Number($('psMatchFrom').value),b=Number($('psMatchTo').value),n=Math.max(1,S.eligible.length);$('psRangeLabel').textContent=S.eligible.length?`${a}–${b} of ${S.eligible.length}`:'0 matches';const den=Math.max(1,n-1),left=(a-1)/den*100,right=(b-1)/den*100;$('psActiveTrack').style.left=`${left}%`;$('psActiveTrack').style.width=`${Math.max(0,right-left)}%`}
  function rangeInput(e){const a=$('psMatchFrom'),b=$('psMatchTo');if(e.target===a&&Number(a.value)>Number(b.value))a.value=b.value;if(e.target===b&&Number(b.value)<Number(a.value))b.value=a.value;rangeVisual();S.selected=S.eligible.slice(Number(a.value)-1,Number(b.value));loadAndDraw()}

  async function refresh(){syncRanges(true);await loadAndDraw()}
  async function loadAndDraw(){if(S.loading)return;S.loading=true;$('psStatus').textContent='Loading selected matches…';try{for(const m of S.selected){if(!S.packs.has(m.matchId))S.packs.set(m.matchId,await gzipJson(m.pack))}$('psStatus').textContent=`${S.selected.length} match${S.selected.length===1?'':'es'} · ${S.selected.reduce((n,m)=>n+(S.packs.get(m.matchId)?.events?.length||0),0).toLocaleString('en-GB')} events`;draw()}catch(err){$('psStatus').textContent=err.message;console.error(err)}finally{S.loading=false}}

  function setPer90(v){S.per90=v;$('psTotal').classList.toggle('active',!v);$('psPer90').classList.toggle('active',v);draw()}
  function chosenMetric(){const key=$('psMetric').value,def=window.PitchLabMetricBible?.canonicalRegistry?.[key],fallback=typeof FILTERS!=='undefined'?FILTERS[key]:null;return{key,label:$('psMetric').selectedOptions[0]?.textContent||'Metric',fn:def?.test||fallback}}
  function matchEnd(pack){const vals=(pack.events||[]).map(sec).filter(Number.isFinite);return Math.max(90*60,...vals)}
  function playerMinutes(pack,pid,clubId){const list=(pack.events||[]).filter(e=>String(e.playerId??'')===String(pid)&&teamId(e)===String(clubId)).sort((a,b)=>sec(a)-sec(b));if(!list.length)return 0;const on=list.find(e=>et(e)==='substitutionon'),off=list.find(e=>et(e)==='substitutionoff'),red=list.find(e=>et(e)==='card'&&String((e.qualifiers||[]).map(q=>dn(q.type)).join(' ')).toLowerCase().includes('red'));let start=on?sec(on):0,end=off?sec(off):matchEnd(pack);if(red)end=Math.min(end,sec(red));return Math.max(0,(end-start)/60)}
  function rows(){const metric=chosenMetric();if(typeof metric.fn!=='function')return[];const map=new Map(),clubId=String(S.manifest?.clubTeamId??19);for(const m of S.selected){const pack=S.packs.get(m.matchId);if(!pack)continue;const names=pack.playerIdNameDictionary||{},clubEvents=(pack.events||[]).filter(e=>teamId(e)===clubId);const pids=new Set(clubEvents.map(e=>String(e.playerId??'')).filter(Boolean));for(const pid of pids){const r=map.get(pid)||{id:pid,name:names[pid]||`Player ${pid}`,value:0,minutes:0,matches:0};r.value+=clubEvents.filter(e=>String(e.playerId??'')===pid&&metric.fn(e)).length;const mins=playerMinutes(pack,pid,clubId);r.minutes+=mins;if(mins>0)r.matches++;map.set(pid,r)}}let out=[...map.values()].filter(r=>r.value>0);if(S.per90)out=out.filter(r=>r.minutes>0).map(r=>({...r,display:r.value*90/r.minutes}));else out=out.map(r=>({...r,display:r.value}));return out.sort((a,b)=>b.display-a.display||a.name.localeCompare(b.name)).slice(0,15)}

  function roundedRect(ctx,x,y,w,h,r){const rr=Math.min(r,h/2,w/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath()}
  function fitText(ctx,text,maxWidth){if(ctx.measureText(text).width<=maxWidth)return text;let t=text;while(t.length>1&&ctx.measureText(`${t}…`).width>maxWidth)t=t.slice(0,-1);return `${t}…`}
  function draw(){
    const c=$('playerStatsCanvas');if(!c)return;const ctx=c.getContext('2d'),metric=chosenMetric(),data=rows(),W=1080,H=1350;
    const bg='#171928',heading='#f8f8fb',label='#d7dae4',meta='#a7abbd',muted='#777c91',accent='#48f0ca',rowBorder='rgba(255,255,255,.07)',rowA='rgba(255,255,255,.045)',track='rgba(255,255,255,.06)';
    ctx.clearRect(0,0,W,H);ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,273);ctx.lineTo(W,273);ctx.stroke();
    ctx.textAlign='center';ctx.fillStyle=heading;ctx.font='700 32.5px Urbanist, sans-serif';ctx.fillText(`${CLUB} — ${metric.label}${S.per90?' per 90':''}`,W/2,112);
    const comp=$('psCompetition')?.selectedOptions[0]?.textContent||'All Competitions',dateText=S.selected.length?`${niceDate(S.selected[0].date)} — ${niceDate(S.selected[S.selected.length-1].date)}`:'No matches';
    ctx.fillStyle=meta;ctx.font='600 22px Urbanist, sans-serif';ctx.fillText(`2026/27`,W/2-185,164);ctx.fillStyle=accent;ctx.fillText('|',W/2-82,164);ctx.fillStyle=meta;ctx.fillText(comp,W/2+18,164);ctx.fillStyle=accent;ctx.fillText('|',W/2+142,164);ctx.fillStyle=meta;ctx.font='600 18px Urbanist, sans-serif';ctx.fillText(dateText,W/2,207);
    const left=70,right=70,rowX=88,rowW=W-176,rowH=54,gap=7,startY=304,max=Math.max(1,...data.map(r=>r.display));
    data.forEach((r,i)=>{
      const y=startY+i*(rowH+gap);ctx.fillStyle=rowA;ctx.strokeStyle=rowBorder;ctx.lineWidth=1;roundedRect(ctx,rowX,y,rowW,rowH,10);ctx.fill();ctx.stroke();
      ctx.textAlign='center';ctx.fillStyle=accent;ctx.font='700 14px Urbanist, sans-serif';ctx.fillText(`#${i+1}`,rowX+28,y+34);
      ctx.textAlign='left';ctx.fillStyle=label;ctx.font='600 18px Urbanist, sans-serif';ctx.fillText(fitText(ctx,r.name,260),rowX+58,y+34);
      ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='700 19px Urbanist, sans-serif';ctx.fillText(fmt(S.per90?Math.round(r.display*100)/100:r.display),rowX+475,y+34);
      const tx=rowX+560,tw=208,ty=y+25;ctx.fillStyle=track;roundedRect(ctx,tx,ty,tw,5,3);ctx.fill();ctx.fillStyle=S.colour;roundedRect(ctx,tx,ty,Math.max(4,tw*(r.display/max)),5,3);ctx.fill();
      const bx=rowX+805,by=y+10,bw=78,bh=34;ctx.fillStyle='rgba(255,255,255,.10)';roundedRect(ctx,bx,by,bw,bh,6);ctx.fill();ctx.fillStyle='#f7f8fc';ctx.font='800 12px Urbanist, sans-serif';ctx.textAlign='center';ctx.fillText(`${r.matches} app${r.matches===1?'':'s'}`,bx+bw/2,by+22);
    });
    if(!data.length){ctx.textAlign='center';ctx.fillStyle=muted;ctx.font='600 24px Urbanist, sans-serif';ctx.fillText('No player events match the current filters.',W/2,520)}
    ctx.textAlign='left';ctx.fillStyle=muted;ctx.font='800 13px Urbanist, sans-serif';ctx.fillText('PITCHLAB',76,1311);ctx.textAlign='center';ctx.fillStyle='#f7f8fc';ctx.font='600 italic 24px Georgia, serif';ctx.fillText('lufcdata',W/2,1310);ctx.textAlign='right';ctx.fillStyle=muted;ctx.font='800 13px Urbanist, sans-serif';ctx.fillText('LUFCDATA.LAB',W-76,1311);ctx.textAlign='left';
  }
  function exportPng(){const c=$('playerStatsCanvas');if(!c)return;c.toBlob(blob=>{if(!blob)return;const a=document.createElement('a'),metric=chosenMetric();a.href=URL.createObjectURL(blob);a.download=`${slug(CLUB)}-${slug(metric.label)}${S.per90?'-per-90':''}-1080x1350.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000)},'image/png')}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0));else setTimeout(install,0);
})();