(()=>{
  const $=id=>document.getElementById(id);
  const VIRTUAL_TOTAL={key:'throwins_total',label:'Total Throw-Ins',members:['throwins_success','throwins_unsuccess']};
  let selected=['successful'],rendering=false;

  function metricLabel(key){
    if(key===VIRTUAL_TOTAL.key)return VIRTUAL_TOTAL.label;
    const o=[...($('metric')?.options||[])].find(x=>x.value===key);return o?.text||key;
  }
  function labels(){return selected.map(metricLabel)}
  function label(){const a=labels();return a.length===1?a[0]:`${a.length} Metrics · ${a.join(' + ')}`}
  function expanded(){const out=[];for(const k of selected){for(const x of(k===VIRTUAL_TOTAL.key?VIRTUAL_TOTAL.members:[k]))if(!out.includes(x))out.push(x)}return out}

  function install(){
    const metric=$('metric');if(!metric||$('seasonMetricChecks'))return false;
    const field=metric.closest('.field');if(!field)return false;
    const groups=[];for(const g of metric.querySelectorAll('optgroup'))groups.push({label:g.label,options:[...g.querySelectorAll('option')].map(o=>({value:o.value,text:o.text}))});
    const throwGroup=groups.find(g=>g.label==='Throw-Ins');if(throwGroup)throwGroup.options.unshift({value:VIRTUAL_TOTAL.key,text:VIRTUAL_TOTAL.label});
    metric.style.display='none';
    const box=document.createElement('div');box.id='seasonMetricChecks';box.className='season-metric-checks';
    box.innerHTML=groups.map(g=>`<section class="season-metric-group"><b>${g.label}</b>${g.options.map(o=>`<label><input type="checkbox" value="${o.value}" ${o.value==='successful'?'checked':''}><span>${o.text}</span></label>`).join('')}</section>`).join('');
    field.appendChild(box);
    box.addEventListener('change',e=>{if(!e.target.matches('input[type=checkbox]'))return;selected=[...box.querySelectorAll('input:checked')].map(x=>x.value);if(!selected.length){e.target.checked=true;selected=[e.target.value]}renderComposite()});
    renderComposite();return true;
  }

  function renderOne(key){
    const metric=$('metric'),root=$('eventSvg');metric.value=key;
    if(typeof metric.onchange==='function')metric.onchange();else metric.dispatchEvent(new Event('change',{bubbles:true}));
    return {svg:root?.innerHTML||'',count:Number($('eventCount')?.textContent||0),legend:$('plotLegend')?.innerHTML||''};
  }

  function renderComposite(){
    if(rendering)return;const metric=$('metric'),root=$('eventSvg');if(!metric||!root)return;
    const keys=expanded();if(!keys.length)return;rendering=true;
    try{
      if(keys.length>1)window.PitchLabHeatMap?.setMode?.(false);
      const parts=keys.map(renderOne),total=parts.reduce((n,p)=>n+p.count,0);
      root.innerHTML=parts.map((p,i)=>`<g data-season-metric-layer="${keys[i]}">${p.svg}</g>`).join('');
      $('eventCount').textContent=String(total);
      const legend=$('plotLegend');if(legend)legend.innerHTML=parts.map((p,i)=>`<span class="season-metric-legend-label">${metricLabel(keys[i])}</span>${p.legend}`).join('');
      const title=$('plotTitle');if(title)title.textContent=label();
      const info=$('infoText');if(info)info.textContent=`Season Performance · ${selected.length} selected metric${selected.length===1?'':'s'} · derived sequences remain reconstructed match-by-match before aggregation.`;
    }finally{rendering=false}
  }

  function boot(){if(!install())setTimeout(boot,80)}
  window.PitchLabSeasonMultiMetrics=Object.freeze({version:'SEASON_MULTI_METRICS_V1_2026-09-09',label,labels,selected:()=>[...selected],expanded:()=>expanded(),render:renderComposite});
  boot();
})();