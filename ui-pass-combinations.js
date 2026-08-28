(()=>{
  const metricEl=document.getElementById('metric');
  const teamEl=document.getElementById('team');
  const playerEl=document.getElementById('player');
  const from=document.getElementById('fromRange');
  const to=document.getElementById('toRange');
  const leaders=document.getElementById('metricLeaders');
  const controls=document.querySelector('.controls-panel');
  const eventCount=document.getElementById('eventCount');
  if(!metricEl||!teamEl||!playerEl||!from||!to||!leaders||!controls||!eventCount||document.getElementById('passCombinationsPanel'))return;

  const COMBO_OPTIONS=[
    ['passing_combinations','Passing Combinations'],
    ['passing_network','Passing Network'],
    ['reciprocal_pass_counts','Reciprocal Pass Counts'],
    ['progressive_combinations','Progressive Combinations'],
    ['final_third_combinations','Final-third Combinations'],
    ['box_partnerships','Passes into the Box Partnerships']
  ];
  const comboKeys=new Set(COMBO_OPTIONS.map(x=>x[0]));
  const fullMetricHtml=metricEl.innerHTML;
  let savedMetricValue=metricEl.value;
  let comboMode=false;
  let selectedPair=null;
  let selectedDirection='both';
  let recipientMap=new Map();
  let pairIndex=new Map();

  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const eventType=e=>String(typeof type==='function'?type(e):dn(e?.type)||'');
  const periodOf=e=>String(dn(e?.period)||'');
  const teamOf=e=>typeof teamName==='function'?teamName(e):String(e?.teamId||'');
  const localEventSec=e=>Number(e?.minute||0)*60+Number(e?.second||0);
  const eventSec=e=>window.PitchLabCanonicalTime?.timelineSecond?.(e)??localEventSec(e);
  const playerName=id=>(typeof players!=='undefined'&&players?.[id]?.name)||`Player ${id}`;
  const isPass=e=>typeof pass==='function'?pass(e):eventType(e)==='Pass';
  const isSuccess=e=>typeof success==='function'?success(e):String(dn(e?.outcomeType)||'').toLowerCase()==='successful';
  const hasCoords=e=>Number.isFinite(Number(e?.x))&&Number.isFinite(Number(e?.y));
  const samePeriod=(a,b)=>periodOf(a)===periodOf(b);
  const baseProgressive=typeof FILTERS!=='undefined'?FILTERS.progressive:null;
  const baseFinalThird=typeof FILTERS!=='undefined'?FILTERS.final_third_passes_success:null;
  const baseBox=typeof FILTERS!=='undefined'?FILTERS.box_passes_success:null;

  const receiverCandidateTypes=new Set(['Pass','BallTouch','TakeOn','Shot','Goal','SavedShot','MissedShots','ShotOnPost','Dispossessed','Foul','Tackle','Interception','BallRecovery','Aerial','Clearance']);
  const opponentControlTypes=new Set(['Pass','BallTouch','TakeOn','Shot','Goal','SavedShot','MissedShots','ShotOnPost','Tackle','Interception','BallRecovery','Aerial','Clearance']);
  const stopTypes=new Set(['OffsidePass','OffsideGiven','End','Start','SubstitutionOff','SubstitutionOn']);

  function rebuildRecipientMap(){
    recipientMap=new Map();pairIndex=new Map();
    if(typeof events==='undefined'||!Array.isArray(events))return;
    for(let i=0;i<events.length;i++){
      const e=events[i];
      if(!isPass(e)||!isSuccess(e)||!e?.playerId)continue;
      const passer=String(e.playerId),team=e.teamId;
      const startSec=eventSec(e);
      let receiver=null;
      for(let j=i+1;j<events.length&&j<=i+9;j++){
        const n=events[j];
        if(!samePeriod(e,n)||eventSec(n)-startSec>12)break;
        const t=eventType(n);
        if(stopTypes.has(t))break;
        if(n.teamId!==team){
          if(opponentControlTypes.has(t)&&hasCoords(n))break;
          continue;
        }
        if(!n.playerId||String(n.playerId)===passer)continue;
        if(receiverCandidateTypes.has(t)||hasCoords(n)){
          receiver=String(n.playerId);break;
        }
      }
      if(!receiver)continue;
      recipientMap.set(e,receiver);
      const ids=[passer,receiver].sort();
      const pairKey=`${ids[0]}|${ids[1]}`;
      if(!pairIndex.has(pairKey))pairIndex.set(pairKey,{a:ids[0],b:ids[1],ab:0,ba:0,total:0,team:teamOf(e)});
      const p=pairIndex.get(pairKey);
      if(passer===p.a&&receiver===p.b)p.ab++;else p.ba++;
      p.total++;
    }
  }

  function passQualifies(e,key){
    if(!recipientMap.has(e)||!isPass(e)||!isSuccess(e))return false;
    if(key==='progressive_combinations')return typeof baseProgressive==='function'&&baseProgressive(e);
    if(key==='final_third_combinations')return typeof baseFinalThird==='function'?baseFinalThird(e):Number(e.x)>=66.6667;
    if(key==='box_partnerships')return typeof baseBox==='function'?baseBox(e):false;
    if(key==='reciprocal_pass_counts'){
      const receiver=recipientMap.get(e),ids=[String(e.playerId),receiver].sort();
      const p=pairIndex.get(`${ids[0]}|${ids[1]}`);
      return !!p&&p.ab>0&&p.ba>0;
    }
    return true;
  }

  function pairAllows(e){
    if(!selectedPair)return true;
    const passer=String(e.playerId),receiver=recipientMap.get(e);
    if(!receiver)return false;
    const {a,b}=selectedPair;
    const between=(passer===a&&receiver===b)||(passer===b&&receiver===a);
    if(!between)return false;
    if(selectedDirection==='a-b')return passer===a&&receiver===b;
    if(selectedDirection==='b-a')return passer===b&&receiver===a;
    return true;
  }

  if(typeof FILTERS!=='undefined'){
    COMBO_OPTIONS.forEach(([key])=>{FILTERS[key]=e=>passQualifies(e,key)&&pairAllows(e)});
  }
  if(typeof lineMetric==='function'){
    const baseLineMetric=lineMetric;
    lineMetric=key=>baseLineMetric(key)||comboKeys.has(key);
  }

  const switcher=document.createElement('div');
  switcher.className='leaders-mode-switch';
  switcher.innerHTML='<button type="button" class="leaders-mode-switch__button is-active" data-mode="leaders">Metric Leaders</button><button type="button" class="leaders-mode-switch__button" data-mode="combinations">Pass Combinations</button>';
  controls.insertBefore(switcher,leaders);

  const panel=document.createElement('section');
  panel.id='passCombinationsPanel';
  panel.className='pass-combinations';
  panel.innerHTML=`
    <div class="pass-combinations__head">
      <div><div class="pass-combinations__kicker">Pass Combinations</div><div id="comboMetricLabel" class="pass-combinations__metric">Passing Combinations</div></div>
      <div id="comboScope" class="pass-combinations__scope">—</div>
    </div>
    <div id="comboSelection" class="pass-combinations__selection is-hidden">
      <div id="comboPairLabel" class="pass-combinations__pair-label"></div>
      <div class="pass-combinations__direction" role="group" aria-label="Pass direction">
        <button type="button" data-dir="a-b">A → B</button><button type="button" data-dir="b-a">B → A</button><button type="button" data-dir="both" class="is-active">Both</button>
      </div>
      <button id="comboClear" type="button" class="pass-combinations__clear">All partnerships</button>
    </div>
    <div id="comboList" class="pass-combinations__list"><div class="pass-combinations__empty">Loading pass combinations…</div></div>
    <div class="pass-combinations__foot"><span>Successful passes · inferred receiver</span><span id="comboTotal"></span></div>`;
  controls.insertBefore(panel,leaders.nextSibling);

  const comboMetricLabel=document.getElementById('comboMetricLabel');
  const comboScope=document.getElementById('comboScope');
  const comboList=document.getElementById('comboList');
  const comboSelection=document.getElementById('comboSelection');
  const comboPairLabel=document.getElementById('comboPairLabel');
  const comboTotal=document.getElementById('comboTotal');

  function setMetricSelectForMode(on){
    if(on){
      savedMetricValue=metricEl.value;
      metricEl.innerHTML=`<optgroup label="Pass Combinations">${COMBO_OPTIONS.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</optgroup>`;
      metricEl.value='passing_combinations';
      playerEl.value='all';
    }else{
      metricEl.innerHTML=fullMetricHtml;
      metricEl.value=[...metricEl.options].some(o=>o.value===savedMetricValue)?savedMetricValue:metricEl.options[0]?.value;
      selectedPair=null;selectedDirection='both';
    }
    metricEl.dispatchEvent(new Event('change',{bubbles:true}));
  }

  function setMode(on){
    comboMode=on;
    leaders.classList.toggle('is-combinations-hidden',on);
    panel.classList.toggle('is-visible',on);
    switcher.querySelectorAll('button').forEach(b=>b.classList.toggle('is-active',(b.dataset.mode==='combinations')===on));
    setMetricSelectForMode(on);
    if(on){rebuildRecipientMap();updatePanel();}
  }

  function timeWindow(){
    const canonical=window.PitchLabCanonicalTime;
    if(canonical?.bounds)return canonical.bounds();
    if(typeof events==='undefined'||!events.length)return {lo:0,hi:90*60,max:90*60};
    const max=Math.max(90*60,...events.map(localEventSec));
    let a=+from.value,b=+to.value;if(b<=a)b=Math.min(100,a+1);
    return {lo:a/100*max,hi:b/100*max,max};
  }

  function eligiblePasses(){
    if(typeof events==='undefined'||!Array.isArray(events))return [];
    const canonical=window.PitchLabCanonicalTime;
    const {lo,hi}=timeWindow();
    const key=metricEl.value;
    let list=events.filter(e=>(canonical?.inWindow?canonical.inWindow(e,lo,hi):(localEventSec(e)>=lo&&localEventSec(e)<=hi))&&passQualifies(e,key));
    if(teamEl.value!=='Both')list=list.filter(e=>teamOf(e)===teamEl.value);
    return list;
  }

  function buildRows(){
    const list=eligiblePasses();
    const map=new Map();
    for(const e of list){
      const passer=String(e.playerId),receiver=recipientMap.get(e);if(!receiver)continue;
      const ids=[passer,receiver].sort();const key=`${ids[0]}|${ids[1]}`;
      const row=map.get(key)||{a:ids[0],b:ids[1],ab:0,ba:0,total:0,team:teamOf(e)};
      if(passer===row.a&&receiver===row.b)row.ab++;else row.ba++;
      row.total++;map.set(key,row);
    }
    let rows=[...map.values()];
    if(metricEl.value==='reciprocal_pass_counts')rows=rows.filter(r=>r.ab>0&&r.ba>0);
    return rows.sort((x,y)=>y.total-x.total||Math.max(y.ab,y.ba)-Math.max(x.ab,x.ba)||playerName(x.a).localeCompare(playerName(y.a)));
  }

  function updatePanel(){
    if(!comboMode)return;
    if(typeof events==='undefined'||!events.length){comboList.innerHTML='<div class="pass-combinations__empty">Loading pass combinations…</div>';return;}
    if(!recipientMap.size)rebuildRecipientMap();
    const rows=buildRows();
    const {lo,hi,max}=timeWindow();
    const canonical=window.PitchLabCanonicalTime;
    const loLabel=canonical?.formatClock?canonical.formatClock(lo):`${Math.floor(lo/60)}:${String(Math.floor(lo%60)).padStart(2,'0')}`;
    const hiLabel=hi>=max-.5?'FT':(canonical?.formatClock?canonical.formatClock(hi):`${Math.floor(hi/60)}:${String(Math.floor(hi%60)).padStart(2,'0')}`);
    comboMetricLabel.textContent=metricEl.options[metricEl.selectedIndex]?.text||'Pass Combinations';
    comboScope.textContent=`${teamEl.value==='Both'?'Both Teams':teamEl.value} · ${loLabel}–${hiLabel}`;
    comboTotal.textContent=`${rows.length} partnership${rows.length===1?'':'s'}`;
    comboSelection.classList.toggle('is-hidden',!selectedPair);
    if(selectedPair){comboPairLabel.textContent=`${playerName(selectedPair.a)} ↔ ${playerName(selectedPair.b)}`;}
    const maxTotal=rows[0]?.total||1;
    comboList.innerHTML=rows.length?rows.map((r,i)=>{
      const active=selectedPair&&selectedPair.a===r.a&&selectedPair.b===r.b;
      const width=Math.max(3,r.total/maxTotal*100);
      return `<button type="button" class="pass-combo-row${active?' is-selected':''}" data-a="${r.a}" data-b="${r.b}">
        <span class="pass-combo-row__rank">${i+1}</span>
        <span class="pass-combo-row__names"><b>${escapeHtml(playerName(r.a))}</b><i>↔</i><b>${escapeHtml(playerName(r.b))}</b></span>
        <span class="pass-combo-row__directions"><em>${r.ab}</em><small>A→B</small><em>${r.ba}</em><small>B→A</small></span>
        <span class="pass-combo-row__track"><i style="width:${width}%"></i></span>
        <span class="pass-combo-row__total">${r.total}</span>
      </button>`;
    }).join(''):'<div class="pass-combinations__empty">No inferred pass partnerships for this metric and time window.</div>';
  }

  function escapeHtml(v){return String(v).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt',"'":'&#39;','"':'&quot;'}[ch]));}

  switcher.addEventListener('click',e=>{const b=e.target.closest('button[data-mode]');if(b)setMode(b.dataset.mode==='combinations');});
  comboList.addEventListener('click',e=>{
    const row=e.target.closest('.pass-combo-row');if(!row)return;
    selectedPair={a:row.dataset.a,b:row.dataset.b};selectedDirection='both';
    panel.querySelectorAll('[data-dir]').forEach(b=>b.classList.toggle('is-active',b.dataset.dir==='both'));
    if(typeof render==='function')render();updatePanel();
  });
  panel.querySelector('.pass-combinations__direction').addEventListener('click',e=>{
    const b=e.target.closest('button[data-dir]');if(!b||!selectedPair)return;
    selectedDirection=b.dataset.dir;panel.querySelectorAll('[data-dir]').forEach(x=>x.classList.toggle('is-active',x===b));
    if(typeof render==='function')render();
  });
  document.getElementById('comboClear').addEventListener('click',()=>{selectedPair=null;selectedDirection='both';if(typeof render==='function')render();updatePanel();});
  metricEl.addEventListener('change',()=>{if(comboMode){selectedPair=null;selectedDirection='both';if(typeof render==='function')render();updatePanel();}});
  teamEl.addEventListener('change',()=>{if(comboMode){selectedPair=null;rebuildRecipientMap();updatePanel();}});
  [from,to].forEach(el=>{el.addEventListener('input',()=>{if(comboMode)updatePanel()});el.addEventListener('change',()=>{if(comboMode)updatePanel()});});
  document.addEventListener('pitchlab:canonical-time-ready',()=>{if(comboMode)updatePanel()});
  document.addEventListener('pitchlab:match-loaded',()=>{rebuildRecipientMap();if(comboMode)updatePanel()});
  const observer=new MutationObserver(()=>{if(comboMode){rebuildRecipientMap();updatePanel();}});observer.observe(eventCount,{childList:true,characterData:true,subtree:true});
})();