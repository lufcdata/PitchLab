(()=>{
  const $=id=>document.getElementById(id);
  const VIRTUAL_TOTAL={key:'throwins_total',label:'Total Throw-Ins',members:['throwins_success','throwins_unsuccess']};
  const GOAL_COLOUR='#BDA060',ON_TARGET_COLOUR='#25ACF5',SHOT_COLOUR='#D5D9DB';
  let selected=['successful'],rendering=false;

  function metricLabel(key){
    if(key===VIRTUAL_TOTAL.key)return VIRTUAL_TOTAL.label;
    const o=[...($('metric')?.options||[])].find(x=>x.value===key);
    return o?.text||key;
  }
  function labels(){return selected.map(metricLabel)}
  function label(){const a=labels();return a.length===0?'Select Metrics':a.length===1?a[0]:`${a.length} Metrics · ${a.join(' + ')}`}
  function expanded(){
    const out=[];
    for(const k of selected){
      for(const x of(k===VIRTUAL_TOTAL.key?VIRTUAL_TOTAL.members:[k]))if(!out.includes(x))out.push(x);
    }
    return out;
  }
  function isGoalMetric(key){return key==='own_goals'||key==='goals'||key.startsWith('goals_')}
  function isShotMetric(key){return key==='shots'||key==='woodwork'||key.startsWith('shots_')||isGoalMetric(key)}
  function shotColour(key){return isGoalMetric(key)?GOAL_COLOUR:key==='shots_on'?ON_TARGET_COLOUR:SHOT_COLOUR}
  function layerPriority(key){return isGoalMetric(key)?300:key==='shots_on'?200:isShotMetric(key)?100:0}
  function shotLegend(key){return `<span class="legend-item season-shot-legend"><i class="legend-arrow metric" style="--metric-colour:${shotColour(key)}"></i>${metricLabel(key)}</span>`}
  function mappedLegend(key){return window.PitchLabSeasonEventMarkerSymbols?.legendHtml?.(key)||''}
  function syncToolbar(){
    const count=$('seasonMetricSelectedCount');if(count)count.textContent=`${selected.length} selected`;
    const clear=$('seasonMetricClear');if(clear)clear.disabled=selected.length===0;
  }
  function clearComposite(){
    window.PitchLabHeatMap?.setMode?.(false);
    const root=$('eventSvg');if(root)root.innerHTML='';
    const count=$('eventCount');if(count)count.textContent='0';
    const legend=$('plotLegend');if(legend)legend.innerHTML='';
    const title=$('plotTitle');if(title)title.textContent='Select Metrics';
    const info=$('infoText');if(info)info.textContent='Season Performance · choose one or more metrics to plot.';
  }

  function install(){
    const metric=$('metric');if(!metric||$('seasonMetricChecks'))return false;
    const field=metric.closest('.field');if(!field)return false;
    field.classList.add('season-metric-field');
    const playerField=$('player')?.closest('.field');
    const filters=field.parentElement;
    const periodCard=document.querySelector('.period-card');
    if(playerField){
      playerField.classList.add('season-player-field');
      if(periodCard&&filters&&playerField.parentElement===filters){
        periodCard.classList.add('season-period-field');
        filters.insertBefore(periodCard,playerField);
      }
      if(playerField.parentElement===field.parentElement)playerField.insertAdjacentElement('afterend',field);
    }
    const groups=[];
    for(const g of metric.querySelectorAll('optgroup'))groups.push({label:g.label,options:[...g.querySelectorAll('option')].map(o=>({value:o.value,text:o.text}))});
    const throwGroup=groups.find(g=>g.label==='Throw-Ins');
    if(throwGroup)throwGroup.options.unshift({value:VIRTUAL_TOTAL.key,text:VIRTUAL_TOTAL.label});
    metric.style.display='none';

    const box=document.createElement('div');box.id='seasonMetricChecks';box.className='season-metric-checks';
    box.innerHTML=`<div class="season-metric-toolbar"><span id="seasonMetricSelectedCount">1 selected</span><button id="seasonMetricClear" type="button">Clear all</button></div>${groups.map(g=>`<section class="season-metric-group"><b>${g.label}</b>${g.options.map(o=>`<label><input type="checkbox" value="${o.value}" ${o.value==='successful'?'checked':''}><span>${o.text}</span></label>`).join('')}</section>`).join('')}`;
    field.appendChild(box);

    box.addEventListener('change',e=>{
      if(!e.target.matches('input[type=checkbox]'))return;
      selected=[...box.querySelectorAll('input:checked')].map(x=>x.value);
      syncToolbar();renderComposite();
    });
    $('seasonMetricClear')?.addEventListener('click',()=>{
      box.querySelectorAll('input[type=checkbox]').forEach(x=>x.checked=false);
      selected=[];syncToolbar();renderComposite();
    });

    for(const id of ['player','fromRange','toRange'])$(id)?.addEventListener('change',()=>setTimeout(renderComposite,0));
    for(const id of ['fromRange','toRange'])$(id)?.addEventListener('input',()=>setTimeout(renderComposite,0));
    for(const id of ['dateFrom','dateTo'])$(id)?.addEventListener('change',()=>setTimeout(renderComposite,500));
    document.querySelectorAll('.period-buttons button').forEach(b=>b.addEventListener('click',()=>setTimeout(renderComposite,20)));
    syncToolbar();renderComposite();return true;
  }

  function renderOne(key){
    const metric=$('metric'),root=$('eventSvg');metric.value=key;
    if(typeof metric.onchange==='function')metric.onchange();else metric.dispatchEvent(new Event('change',{bubbles:true}));
    return{svg:root?.innerHTML||'',count:Number($('eventCount')?.textContent||0),legend:$('plotLegend')?.innerHTML||''};
  }

  function countForPlayer(key,playerId){
    const player=$('player'),metric=$('metric');if(!player||!metric)return 0;
    const oldPlayer=player.value,oldMetric=metric.value;
    let total=0;
    try{
      player.value=String(playerId);
      const keys=key===VIRTUAL_TOTAL.key?VIRTUAL_TOTAL.members:[key];
      total=keys.reduce((n,k)=>n+renderOne(k).count,0);
    }finally{
      player.value=oldPlayer;metric.value=oldMetric;
    }
    return total;
  }

  function renderComposite(){
    if(rendering)return;
    const metric=$('metric'),root=$('eventSvg');if(!metric||!root)return;
    const keys=expanded();
    if(!keys.length){clearComposite();return;}
    rendering=true;
    try{
      if(keys.length>1)window.PitchLabHeatMap?.setMode?.(false);
      const parts=keys.map(renderOne),total=parts.reduce((n,p)=>n+p.count,0);
      const layers=parts.map((part,i)=>({part,key:keys[i],i}));
      const drawOrder=[...layers].sort((a,b)=>layerPriority(a.key)-layerPriority(b.key)||a.i-b.i);
      root.innerHTML=drawOrder.map(x=>`<g data-season-metric-layer="${x.key}" data-season-layer-priority="${layerPriority(x.key)}">${x.part.svg}</g>`).join('');
      $('eventCount').textContent=String(total);
      const legend=$('plotLegend');
      if(legend){
        const legendOrder=[...layers].sort((a,b)=>layerPriority(b.key)-layerPriority(a.key)||a.i-b.i);
        legend.innerHTML=legendOrder.map(x=>mappedLegend(x.key)|| (isShotMetric(x.key)?shotLegend(x.key):`<span class="season-metric-legend-label">${metricLabel(x.key)}</span>${x.part.legend}`)).join('');
      }
      const title=$('plotTitle');if(title)title.textContent=label();
      const info=$('infoText');if(info)info.textContent=`Season Performance · ${selected.length} selected metric${selected.length===1?'':'s'} · derived sequences remain reconstructed match-by-match before aggregation.`;
    }finally{rendering=false}
  }

  function boot(){if(!install())setTimeout(boot,80)}
  window.PitchLabSeasonMultiMetrics=Object.freeze({version:'SEASON_MULTI_METRICS_V1_7_2026-09-09',label,labels,metricLabel,selected:()=>[...selected],expanded:()=>expanded(),countForPlayer,render:renderComposite,shotLayerPriority:layerPriority});
  boot();
})();