(()=>{
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const periodName=e=>String(dn(e?.period)||'').toLowerCase().replace(/[\s_-]/g,'');
  const typeName=e=>String(dn(e?.type)||'').toLowerCase().replace(/[\s_-]/g,'');
  const localSecond=e=>Number(e?.minute||0)*60+Number(e?.second||0);
  const isFirst=e=>{const p=periodName(e);return p.includes('first')||p==='1'||p==='firsthalf'};
  const isSecond=e=>{const p=periodName(e);return p.includes('second')||p==='2'||p==='secondhalf'};
  const isEnd=e=>{const t=typeName(e);return t==='end'||t.includes('periodend')||t.includes('halfend')||t.includes('endperiod')};
  const PERIOD_BOUNDARY_EPSILON=0.001;
  let timing={firstHalfEnd:45*60,secondHalfEnd:90*60,fullTimeline:90*60};
  let activePreset='full';
  let applyingPreset=false;

  function derive(source=window.events){
    const list=Array.isArray(source)?source:[];
    const first=list.filter(isFirst),second=list.filter(isSecond);
    const fEndPool=first.filter(isEnd),sEndPool=second.filter(isEnd);
    const firstHalfEnd=Math.max(45*60,...(fEndPool.length?fEndPool:first).map(localSecond).filter(Number.isFinite));
    const secondHalfEnd=Math.max(90*60,...(sEndPool.length?sEndPool:second).map(localSecond).filter(Number.isFinite));
    timing={firstHalfEnd,secondHalfEnd,fullTimeline:firstHalfEnd+PERIOD_BOUNDARY_EPSILON+Math.max(0,secondHalfEnd-45*60)};
    return timing;
  }

  function timelineSecond(e){
    if(isFirst(e))return localSecond(e);
    if(isSecond(e))return timing.firstHalfEnd+PERIOD_BOUNDARY_EPSILON+Math.max(0,localSecond(e)-45*60);
    return NaN;
  }
  function clockSecond(timeline){const t=Math.max(0,Number(timeline)||0);return t<=timing.firstHalfEnd?t:45*60+Math.max(0,t-timing.firstHalfEnd-PERIOD_BOUNDARY_EPSILON)}
  function formatClock(timeline){const s=Math.max(0,Math.round(clockSecond(timeline)));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`}
  function bounds(){
    const from=document.getElementById('fromRange'),to=document.getElementById('toRange'),max=timing.fullTimeline;
    if(!from||!to)return{lo:0,hi:max,max};let a=Number(from.value),b=Number(to.value);if(b<=a)b=Math.min(100,a+1);
    return{lo:a/100*max,hi:b/100*max,max};
  }
  function inWindow(e,lo,hi){const t=timelineSecond(e);return Number.isFinite(t)&&t>=lo&&t<=hi}
  function windowEvents(source=window.events){const list=Array.isArray(source)?source:[];const {lo,hi}=bounds();return list.filter(e=>inWindow(e,lo,hi))}

  function patchBible(){
    const bible=window.PitchLabMetricBible;if(!bible)return;
    bible.ts=timelineSecond;bible.windowBounds=()=>bounds();bible.windowEvents=source=>windowEvents(source);
    bible.metricEvents=(key,source=window.events,team='Both')=>{
      const canonicalDef=bible.canonicalRegistry?.[key];const fn=canonicalDef?.test||((typeof FILTERS!=='undefined'&&FILTERS[key])||(()=>false));
      let list=windowEvents(source).filter(fn);if(team&&team!=='Both')list=list.filter(e=>typeof teamName==='function'?teamName(e)===team:String(e?.teamId)===String(team));return list;
    };
    bible.playerRows=(key,source=window.events,team='Both')=>{
      const scoped=windowEvents(source);
      if(window.PitchLabCarry?.isCarryMetric?.(key)){
        const rows=[];for(const [id,s] of window.PitchLabCarry.playerSummaries(scoped)){
          const ev=scoped.find(e=>String(e.teamId)===String(s.teamId)),tm=ev&&typeof teamName==='function'?teamName(ev):'';
          if(team!=='Both'&&tm!==team)continue;const value=window.PitchLabCarry.metricValue(s,key);if(!value)continue;rows.push({id:String(id),team:tm,value,display:window.PitchLabCarry.metricDisplay(value,key)});
        }return rows;
      }
      const map=new Map();for(const e of bible.metricEvents(key,source,team)){if(!e?.playerId)continue;const id=String(e.playerId),r=map.get(id)||{id,team:typeof teamName==='function'?teamName(e):'',value:0};r.value++;map.set(id,r)}return [...map.values()];
    };
  }

  function updateLabels(){
    const {lo,hi,max}=bounds(),fromLabel=lo<0.5?'0:00':formatClock(lo),toLabel=hi>=max-0.5?'FT':formatClock(hi);
    for(const id of ['fromText','sumFrom']){const el=document.getElementById(id);if(el)el.textContent=fromLabel}
    for(const id of ['toText','sumTo']){const el=document.getElementById(id);if(el)el.textContent=toLabel}
    const plot=document.getElementById('plotWindow');if(plot)plot.textContent=`${fromLabel} - ${toLabel}`;
  }
  function announce(){document.dispatchEvent(new CustomEvent('pitchlab:canonical-time-ready',{detail:{version:'CANONICAL_TIME_V4_2026-08-28',timing:{...timing},activePreset}}))}
  function refresh(source=window.events){derive(source);patchBible();updateLabels();announce()}
  function applyPreset(kind){
    const from=document.getElementById('fromRange'),to=document.getElementById('toRange');if(!from||!to)return;const max=timing.fullTimeline;
    activePreset=kind;applyingPreset=true;
    if(kind==='full'){from.value=0;to.value=100}else if(kind==='first'){from.value=0;to.value=timing.firstHalfEnd/max*100}else{from.value=timing.firstHalfEnd/max*100;to.value=100}
    from.dispatchEvent(new Event('input',{bubbles:true}));to.dispatchEvent(new Event('input',{bubbles:true}));applyingPreset=false;requestAnimationFrame(updateLabels);
  }
  function install(){
    refresh(window.events);
    const from=document.getElementById('fromRange'),to=document.getElementById('toRange');
    const manualRangeChange=()=>{if(!applyingPreset)activePreset=null;requestAnimationFrame(updateLabels)};
    from?.addEventListener('input',manualRangeChange);to?.addEventListener('input',manualRangeChange);
    document.getElementById('fullBtn')?.addEventListener('click',()=>requestAnimationFrame(()=>applyPreset('full')));document.getElementById('firstBtn')?.addEventListener('click',()=>requestAnimationFrame(()=>applyPreset('first')));document.getElementById('secondBtn')?.addEventListener('click',()=>requestAnimationFrame(()=>applyPreset('second')));
  }
  document.addEventListener('pitchlab:metric-bible-ready',()=>refresh(window.events));
  document.addEventListener('pitchlab:match-loaded',e=>{
    derive(e.detail?.events||window.events);patchBible();
    if(activePreset)applyPreset(activePreset);else updateLabels();
    announce();
  });
  window.PitchLabCanonicalTime=Object.freeze({version:'CANONICAL_TIME_V4_2026-08-28',derive,timelineSecond,clockSecond,formatClock,bounds,inWindow,windowEvents,get timing(){return timing},get activePreset(){return activePreset}});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();