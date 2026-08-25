(()=>{
  const MAX_ROWS=10;
  const crestFor=name=>name==='Leeds'?'assets/club-logos/leeds%20png.png':name==='Bournemouth'?'assets/club-logos/Bournemouth.png':'';

  function install(){
    const controls=document.querySelector('.controls-panel');
    const metricEl=document.getElementById('metric');
    const teamEl=document.getElementById('team');
    const playerEl=document.getElementById('player');
    const eventCount=document.getElementById('eventCount');
    if(!controls||!metricEl||!teamEl||!playerEl||!eventCount||document.getElementById('metricLeaders'))return;

    const panel=document.createElement('section');
    panel.id='metricLeaders';
    panel.className='metric-leaders';
    panel.innerHTML=`
      <div class="metric-leaders__head">
        <div>
          <div class="metric-leaders__kicker">Metric Leaders</div>
          <div class="metric-leaders__metric" id="leadersMetric">—</div>
        </div>
        <div class="metric-leaders__scope" id="leadersScope">—</div>
      </div>
      <div class="metric-leaders__list" id="leadersList"></div>
      <div class="metric-leaders__foot"><span>Players ranked high → low</span><span id="leadersTotal"></span></div>`;
    controls.appendChild(panel);

    function update(){
      try{
        if(typeof raw==='undefined'||!raw||typeof events==='undefined'||!events.length||typeof FILTERS==='undefined'){
          document.getElementById('leadersList').innerHTML='<div class="metric-leaders__empty">Loading match leaders…</div>';
          return;
        }
        const maxMin=Math.max(90,...events.map(minute));
        let a=+from.value,b=+to.value;
        if(b<=a)b=Math.min(100,a+1);
        const lo=a/100*maxMin,hi=b/100*maxMin;
        const fn=FILTERS[metricEl.value]||(()=>false);
        let list=events.filter(e=>minute(e)>=lo&&minute(e)<=hi&&fn(e)&&e.playerId);
        if(teamEl.value!=='Both')list=list.filter(e=>teamName(e)===teamEl.value);

        const counts=new Map();
        for(const e of list){
          const id=String(e.playerId);
          const item=counts.get(id)||{id,name:(players[e.playerId]||{}).name||`Player ${id}`,team:teamName(e),value:0};
          item.value+=1;
          counts.set(id,item);
        }
        const rows=[...counts.values()].sort((x,y)=>y.value-x.value||x.name.localeCompare(y.name)).slice(0,MAX_ROWS);
        const max=rows[0]?.value||1;
        const selected=playerEl.value;
        document.getElementById('leadersMetric').textContent=metricEl.options[metricEl.selectedIndex]?.text||'Metric';
        document.getElementById('leadersScope').textContent=`${teamEl.value==='Both'?'Both Teams':teamEl.value} · ${Math.round(lo)}–${hi>=maxMin-.5?'FT':Math.round(hi)} mins`;
        document.getElementById('leadersTotal').textContent=`${counts.size} player${counts.size===1?'':'s'}`;
        document.getElementById('leadersList').innerHTML=rows.length?rows.map((r,i)=>{
          const crest=crestFor(r.team);
          const width=Math.max(2,(r.value/max)*100);
          return `<div class="metric-leader${selected===r.id?' is-selected':''}" data-player-id="${r.id}">
            ${crest?`<img class="metric-leader__crest" src="${crest}" alt="${r.team} crest">`:'<span></span>'}
            <div class="metric-leader__body">
              <div class="metric-leader__top"><span class="metric-leader__name">${escapeHtml(r.name)}</span><span class="metric-leader__team">${escapeHtml(r.team)}</span></div>
              <div class="metric-leader__track"><div class="metric-leader__bar" style="width:${width}%"></div></div>
            </div>
            <div class="metric-leader__value">${r.value}</div>
            <span class="metric-leader__rank">#${i+1}</span>
          </div>`;
        }).join(''):'<div class="metric-leaders__empty">No players recorded for this metric and time window.</div>';
      }catch(err){
        console.warn('Metric leaders update failed',err);
      }
    }

    const observer=new MutationObserver(update);
    observer.observe(eventCount,{childList:true,characterData:true,subtree:true});
    [metricEl,teamEl,playerEl,from,to].forEach(el=>{if(el){el.addEventListener('input',update);el.addEventListener('change',update)}});
    update();
  }

  function escapeHtml(value){
    return String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();