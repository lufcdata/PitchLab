(()=>{
  const crestFor=name=>name==='Leeds'?'assets/club-logos/leeds%20png.png':name==='Bournemouth'?'assets/club-logos/Bournemouth.png':'';

  function ordinal(n){
    const mod100=n%100;
    if(mod100>=11&&mod100<=13)return `${n}th`;
    return `${n}${n%10===1?'st':n%10===2?'nd':n%10===3?'rd':'th'}`;
  }

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
        const rows=[...counts.values()].sort((x,y)=>y.value-x.value||x.name.localeCompare(y.name));
        const max=rows[0]?.value||1;
        const selected=playerEl.value;
        const valueFrequency=new Map();
        rows.forEach(r=>valueFrequency.set(r.value,(valueFrequency.get(r.value)||0)+1));

        document.getElementById('leadersMetric').textContent=metricEl.options[metricEl.selectedIndex]?.text||'Metric';
        document.getElementById('leadersScope').textContent=`${teamEl.value==='Both'?'Both Teams':teamEl.value} · ${Math.round(lo)}–${hi>=maxMin-.5?'FT':Math.round(hi)} mins`;
        document.getElementById('leadersTotal').textContent=`${counts.size} player${counts.size===1?'':'s'}`;

        let previousValue=null,previousRank=0;
        document.getElementById('leadersList').innerHTML=rows.length?rows.map((r,i)=>{
          const rank=previousValue===r.value?previousRank:i+1;
          previousValue=r.value;previousRank=rank;
          const isJoint=(valueFrequency.get(r.value)||0)>1;
          const crest=crestFor(r.team);
          const width=Math.max(3,(r.value/max)*100);
          const topClass=rank<=3?` is-top-${rank}`:'';
          const rankText=`${isJoint?'J-':''}${ordinal(rank)}`;
          return `<div class="metric-leader${selected===r.id?' is-selected':''}${topClass}" data-player-id="${r.id}">
            ${crest?`<img class="metric-leader__crest" src="${crest}" alt="${r.team} crest">`:'<span class="metric-leader__crest-placeholder"></span>'}
            <div class="metric-leader__name">${escapeHtml(r.name)}</div>
            <div class="metric-leader__value">${r.value}</div>
            <div class="metric-leader__track"><div class="metric-leader__bar" style="width:${width}%"></div></div>
            <span class="metric-leader__rank">${rank===1?'<span class="metric-leader__star">★</span>':''}${rankText}</span>
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