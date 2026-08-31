(()=>{
  const STORE='pitchlab.matchStatsSelection.v1';
  const ORDER='pitchlab.matchStatsOrder.v1';
  const $=s=>document.querySelector(s);

  function bibleMetrics(){
    const bible=window.PitchLabMetricBible;if(!bible)return [];
    const rows=[];
    for(const [key,def] of Object.entries(bible.canonicalRegistry||{})){
      if(def?.surfaces?.includes('matchStats'))rows.push({key,label:def.label||key,kind:def.kind||'event'});
    }
    for(const [key,def] of Object.entries(bible.teamRegistry||{})){
      if(def?.surfaces?.includes('matchStats'))rows.push({key,label:def.label||key,kind:'team'});
    }
    for(const [key,def] of Object.entries(bible.compositeRegistry||{})){
      if(def?.surfaces?.includes('matchStats'))rows.push({key,label:def.label||key,kind:'composite'});
    }
    const seen=new Set();return rows.filter(r=>!seen.has(r.key)&&seen.add(r.key));
  }

  function loadState(metrics){
    const keys=new Set(metrics.map(m=>m.key));
    let selected=[],order=[],hasSavedSelection=false;
    try{
      const saved=localStorage.getItem(STORE);hasSavedSelection=saved!==null;
      selected=JSON.parse(saved||'[]');order=JSON.parse(localStorage.getItem(ORDER)||'[]');
    }catch(_){/* ignore */}
    selected=selected.filter(k=>keys.has(k));
    order=order.filter(k=>keys.has(k));
    const knownOrder=new Set(order);
    const newKeys=metrics.map(m=>m.key).filter(k=>!knownOrder.has(k));
    for(const m of metrics)if(!order.includes(m.key))order.push(m.key);
    if(!hasSavedSelection)selected=[...order];
    else for(const key of newKeys)if(!selected.includes(key))selected.push(key);
    return {selected,order};
  }

  function saveState(selected,order){
    try{localStorage.setItem(STORE,JSON.stringify(selected));localStorage.setItem(ORDER,JSON.stringify(order))}catch(_){/* ignore */}
  }
  function rowLabel(row){return row.querySelector('.match-stats-row__label')?.textContent?.trim()||''}

  function applySelection(metrics,state){
    const body=$('#matchStatsBody');if(!body)return;
    const labelByKey=new Map(metrics.map(m=>[m.key,m.label]));
    const keyByLabel=new Map(metrics.map(m=>[m.label,m.key]));
    const selectedSet=new Set(state.selected);
    const rows=[...body.querySelectorAll('.match-stats-row')];
    const byLabel=new Map(rows.map(r=>[rowLabel(r),r]));

    // Match Stats display is Metric Bible-only. Legacy rows remain in code until migrated, but cannot surface here.
    for(const row of rows){
      const key=keyByLabel.get(rowLabel(row));
      row.style.display=key&&selectedSet.has(key)?'':'none';
    }

    // Only mutate row order when it is genuinely out of sync. This is critical because
    // Match Stats is observed for external row/value updates; unconditional appendChild()
    // calls here would wake the observer again and create a self-triggering DOM loop.
    const desired=state.order.filter(key=>selectedSet.has(key)).map(key=>byLabel.get(labelByKey.get(key))).filter(Boolean);
    const current=rows.filter(row=>desired.includes(row));
    const orderMatches=current.length===desired.length&&current.every((row,i)=>row===desired[i]);
    if(!orderMatches)for(const row of desired)body.appendChild(row);
  }

  function install(){
    const panel=$('#matchStatsPanel'),pitch=$('.pitch-panel');
    if(!panel||!pitch||$('#matchStatsSelector'))return false;
    const metrics=bibleMetrics();if(!metrics.length)return false;
    const state=loadState(metrics);
    const metricMap=new Map(metrics.map(m=>[m.key,m]));

    const selector=document.createElement('section');
    selector.id='matchStatsSelector';selector.className='match-stats-selector';
    selector.innerHTML=`
      <div class="match-stats-selector__head">
        <div><div class="match-stats-selector__kicker">Metric Bible</div><div class="match-stats-selector__title">Choose Match Stats</div></div>
        <div id="matchStatsSelectedCount" class="match-stats-selector__count"></div>
      </div>
      <div class="match-stats-selector__hint">Choose any number of metrics. Drag rows to set the order shown above.</div>
      <div id="matchStatsMetricPicker" class="match-stats-selector__list"></div>
      <div class="match-stats-selector__actions"><button id="matchStatsSelectAllButton" type="button" class="is-secondary">Select All</button><button id="matchStatsSelectButton" type="button">Select</button><button id="matchStatsClearButton" type="button" class="is-secondary">Clear</button></div>
      <div id="matchStatsSelectorMessage" class="match-stats-selector__message"></div>`;
    panel.insertAdjacentElement('afterend',selector);

    const list=$('#matchStatsMetricPicker'),count=$('#matchStatsSelectedCount'),message=$('#matchStatsSelectorMessage');
    let dragItem=null;
    function checkedKeys(){return [...list.querySelectorAll('input[type="checkbox"]:checked')].map(i=>i.value)}
    function updateCount(){const n=checkedKeys().length;count.textContent=`${n}/${metrics.length} selected`}
    function syncOrderFromDom(){state.order=[...list.querySelectorAll('[data-key]')].map(x=>x.dataset.key)}
    function renderPicker(){
      list.innerHTML=state.order.map(key=>{
        const m=metricMap.get(key);if(!m)return '';
        const checked=state.selected.includes(key)?' checked':'';
        return `<label class="match-stats-selector__item" draggable="true" data-key="${key}"><span class="match-stats-selector__drag" aria-hidden="true">⋮⋮</span><input type="checkbox" value="${key}"${checked}><span class="match-stats-selector__name">${m.label}</span><span class="match-stats-selector__badge match-stats-selector__badge--${m.kind}">${m.kind==='team'?'TEAM':m.kind==='composite'?'COMPOSITE':'EVENT'}</span></label>`;
      }).join('');updateCount();
    }

    list.addEventListener('change',e=>{if(e.target.matches('input[type="checkbox"]'))updateCount()});
    list.addEventListener('dragstart',e=>{
      dragItem=e.target.closest('[data-key]');if(!dragItem)return;
      dragItem.classList.add('is-dragging');e.dataTransfer.effectAllowed='move';
    });
    list.addEventListener('dragover',e=>{
      e.preventDefault();if(!dragItem)return;
      const target=e.target.closest('[data-key]');if(!target||target===dragItem)return;
      const rect=target.getBoundingClientRect();
      list.insertBefore(dragItem,e.clientY<rect.top+rect.height/2?target:target.nextSibling);
    });
    list.addEventListener('drop',e=>{e.preventDefault();syncOrderFromDom()});
    list.addEventListener('dragend',()=>{dragItem?.classList.remove('is-dragging');dragItem=null;syncOrderFromDom()});

    $('#matchStatsSelectAllButton').addEventListener('click',()=>{
      list.querySelectorAll('input[type="checkbox"]').forEach(i=>i.checked=true);
      syncOrderFromDom();state.selected=[...state.order];
      saveState(state.selected,state.order);applySelection(metrics,state);updateCount();
      message.textContent=`Showing all ${state.selected.length} Metric Bible stats.`;setTimeout(()=>{message.textContent=''},1800);
    });
    $('#matchStatsSelectButton').addEventListener('click',()=>{
      syncOrderFromDom();state.selected=checkedKeys();
      saveState(state.selected,state.order);applySelection(metrics,state);
      message.textContent=`Showing ${state.selected.length} Metric Bible stats.`;setTimeout(()=>{message.textContent=''},1800);
    });
    $('#matchStatsClearButton').addEventListener('click',()=>{
      state.selected=[];list.querySelectorAll('input[type="checkbox"]').forEach(i=>i.checked=false);
      syncOrderFromDom();saveState(state.selected,state.order);applySelection(metrics,state);updateCount();
      message.textContent='Match Stats selection cleared.';setTimeout(()=>{message.textContent=''},1800);
    });

    renderPicker();applySelection(metrics,state);
    const body=$('#matchStatsBody');
    if(body){
      let observerFrame=0;
      const scheduleSelection=()=>{if(observerFrame)return;observerFrame=requestAnimationFrame(()=>{observerFrame=0;applySelection(metrics,state);});};
      new MutationObserver(scheduleSelection).observe(body,{childList:true,subtree:true,characterData:true});
    }
    document.addEventListener('pitchlab:match-loaded',()=>setTimeout(()=>applySelection(metrics,state),50));
    return true;
  }

  const boot=()=>{if(!install())setTimeout(boot,150)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();