(()=>{
  const $=id=>document.getElementById(id);
  let limit=5,rendering=false,queued=null;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const shortDate=value=>{const m=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}-${m[2]}-${m[1].slice(-2)}`:String(value||'')};
  const periodLabel=()=>($('plotWindow')?.textContent||'Full Match').replace(/FULL MATCH/i,'Full Match');
  function metricOptions(){
    const metric=$('metric');if(!metric)return[];
    const out=[];
    for(const g of metric.querySelectorAll('optgroup')){
      const options=[...g.querySelectorAll('option')].map(o=>({value:o.value,text:o.text}));
      if(g.label==='Throw-Ins')options.unshift({value:'throwins_total',text:'Total Throw-Ins'});
      out.push({label:g.label,options});
    }
    return out;
  }
  function install(){
    if($('seasonMetricLeaders'))return true;
    const metricField=document.querySelector('.season-metric-field');if(!metricField)return false;
    const groups=metricOptions();if(!groups.length)return false;
    const panel=document.createElement('section');panel.id='seasonMetricLeaders';panel.className='season-leaders';
    panel.innerHTML=`<div class="season-leaders-head"><div><div class="season-leaders-kicker">Metric Leaders</div><div id="seasonLeadersTitle" class="season-leaders-title">Successful Passes Leaders</div><div id="seasonLeadersContext" class="season-leaders-context">Selected date range · Full Match</div></div><div class="season-leaders-controls"><select id="seasonLeaderMetric" aria-label="Metric Leaders metric">${groups.map(g=>`<optgroup label="${esc(g.label)}">${g.options.map(o=>`<option value="${esc(o.value)}">${esc(o.text)}</option>`).join('')}</optgroup>`).join('')}</select><div class="season-leaders-limit"><button type="button" data-limit="5" class="active">Top 5</button><button type="button" data-limit="10">Top 10</button></div></div></div><div id="seasonLeadersList" class="season-leaders-list"></div>`;
    metricField.insertAdjacentElement('afterend',panel);
    $('seasonLeaderMetric')?.addEventListener('change',schedule);
    panel.querySelector('.season-leaders-limit')?.addEventListener('click',e=>{const b=e.target.closest('button[data-limit]');if(!b)return;limit=Number(b.dataset.limit)||5;panel.querySelectorAll('button[data-limit]').forEach(x=>x.classList.toggle('active',x===b));schedule()});
    $('seasonLeadersList')?.addEventListener('click',e=>{const row=e.target.closest('[data-player-id]');if(!row)return;const player=$('player');if(!player)return;player.value=row.dataset.playerId;player.dispatchEvent(new Event('change',{bubbles:true}));});
    for(const id of ['dateFrom','dateTo','fromRange','toRange'])$(id)?.addEventListener('change',()=>setTimeout(schedule,550));
    for(const id of ['fromRange','toRange'])$(id)?.addEventListener('input',()=>setTimeout(schedule,40));
    document.querySelectorAll('.period-buttons button').forEach(b=>b.addEventListener('click',()=>setTimeout(schedule,40)));
    const player=$('player');if(player)new MutationObserver(()=>schedule()).observe(player,{childList:true,subtree:true});
    schedule();return true;
  }
  function players(){
    const p=$('player');if(!p)return[];
    return [...p.options].filter(o=>o.value&&o.value!=='all').map(o=>({id:o.value,name:o.text.trim()}));
  }
  function schedule(){clearTimeout(queued);queued=setTimeout(render,80)}
  function render(){
    if(rendering)return;const api=window.PitchLabSeasonMultiMetrics,select=$('seasonLeaderMetric'),list=$('seasonLeadersList');if(!api?.countForPlayer||!select||!list)return;
    const roster=players();if(!roster.length){list.innerHTML='<div class="season-leaders-empty">No Leeds players available for this date range.</div>';return}
    rendering=true;
    try{
      const key=select.value,label=api.metricLabel?.(key)||select.options[select.selectedIndex]?.text||key;
      const rows=roster.map(p=>({...p,value:api.countForPlayer(key,p.id)})).sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name)).slice(0,limit);
      const max=Math.max(1,...rows.map(r=>r.value));
      $('seasonLeadersTitle').textContent=`${label} Leaders`;
      const a=shortDate($('dateFrom')?.value),b=shortDate($('dateTo')?.value),matches=window.PitchLabSeasonPerformance?.state?.selected?.length||0;
      $('seasonLeadersContext').textContent=`${a} - ${b} · ${matches} Match${matches===1?'':'es'} · ${periodLabel()}`;
      list.innerHTML=rows.map((r,i)=>`<div class="season-leader-row" data-player-id="${esc(r.id)}" title="View ${esc(r.name)} on the pitch"><div class="season-leader-bar" style="width:${Math.max(4,(r.value/max)*100)}%"></div><div class="season-leader-rank">${i+1}</div><img class="season-leader-avatar" src="assets/players-images/${encodeURIComponent(r.name)}.png" alt="" onerror="this.style.visibility='hidden'"><div class="season-leader-name">${esc(r.name)}</div><div class="season-leader-value">${r.value}</div></div>`).join('');
    }finally{
      rendering=false;api.render?.();
    }
  }
  function boot(){if(!install())setTimeout(boot,100)}
  window.PitchLabSeasonMetricLeaders=Object.freeze({version:'SEASON_METRIC_LEADERS_V1_2026-09-09',render:schedule});
  boot();
})();
