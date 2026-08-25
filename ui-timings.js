(()=>{
  const FALLBACK={firstHalfEnd:46*60+57,fullTime:98*60+18};
  const ballStatus=[
    ['BALL STATUS','Ball In Play','51:23'],
    ['BALL STATUS','Ball In Play %','51.3%'],
    ['BALL STATUS','Ball Out of Play','48:52'],
    ['BALL STATUS','Ball Out of Play %','48.7%'],
    ['STOPPAGES','Game Stops','97'],
    ['STOPPAGES','Throw-in Stops','46'],
    ['STOPPAGES','Free-kick Restarts','18'],
    ['STOPPAGES','Goal-kick Stops','14'],
    ['STOPPAGES','Corner Stops','13'],
    ['STOPPAGES','Goal Stops','4'],
    ['STOPPAGES','Offside Stops','2'],
    ['STOPPAGES','Post-goal / Other Time','6:04']
  ];

  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const eventSeconds=e=>Number(e?.minute||0)*60+Number(e?.second||0);
  const periodName=e=>String(dn(e?.period)||'').toLowerCase().replace(/[\s_-]/g,'');
  const typeName=e=>String(dn(e?.type)||'').toLowerCase().replace(/[\s_-]/g,'');
  const isFirst=e=>{const p=periodName(e);return p.includes('first')||p==='1'||p==='firsthalf'};
  const isSecond=e=>{const p=periodName(e);return p.includes('second')||p==='2'||p==='secondhalf'};
  const isPeriodEnd=e=>{const t=typeName(e);return t==='end'||t.includes('periodend')||t.includes('halfend')||t.includes('endperiod')};
  const fmt=seconds=>{const s=Math.max(0,Math.round(seconds));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`};

  function derive(events){
    const list=Array.isArray(events)?events:[];
    const first=list.filter(isFirst);
    const second=list.filter(isSecond);
    const firstEndEvents=first.filter(isPeriodEnd);
    const secondEndEvents=second.filter(isPeriodEnd);
    const firstHalfEnd=Math.max(45*60,...(firstEndEvents.length?firstEndEvents:first).map(eventSeconds).filter(Number.isFinite));
    const fullTime=Math.max(90*60,...(secondEndEvents.length?secondEndEvents:second.length?second:list).map(eventSeconds).filter(Number.isFinite));
    return normalise({firstHalfEnd,fullTime});
  }

  function normalise(t){
    const firstHalfEnd=Number.isFinite(t?.firstHalfEnd)&&t.firstHalfEnd>=45*60?t.firstHalfEnd:FALLBACK.firstHalfEnd;
    const fullTime=Number.isFinite(t?.fullTime)&&t.fullTime>=90*60?t.fullTime:FALLBACK.fullTime;
    return {
      firstHalfStart:0,
      firstHalfEnd,
      firstHalfDuration:firstHalfEnd,
      firstHalfAdded:Math.max(0,firstHalfEnd-45*60),
      secondHalfStart:45*60,
      secondHalfEnd:fullTime,
      secondHalfDuration:Math.max(0,fullTime-45*60),
      secondHalfAdded:Math.max(0,fullTime-90*60),
      fullTime
    };
  }

  function timingCards(t){return [
    ['1st Half Duration',fmt(t.firstHalfDuration)],
    ['1st Half Added Time',fmt(t.firstHalfAdded)],
    ['2nd Half Duration',fmt(t.secondHalfDuration)],
    ['2nd Half Added Time',fmt(t.secondHalfAdded)]
  ]}

  function rangeRows(t){return [
    ['HALF WINDOWS','1st Half',`0:00 — ${fmt(t.firstHalfEnd)}`],
    ['HALF WINDOWS','2nd Half',`45:00 — ${fmt(t.secondHalfEnd)}`],
    ...ballStatus
  ]}

  function render(t){
    const summary=document.querySelector('.summary-card');
    if(!summary)return;
    summary.dataset.matchTimingsInstalled='1';
    summary.classList.add('match-timings-summary');
    const oldPanel=document.getElementById('matchTimings');
    if(oldPanel)oldPanel.remove();

    let current='';
    const detailRows=rangeRows(t).map(([section,name,value])=>{
      const heading=section!==current?`<div class="match-timings__section">${section}</div>`:'';
      current=section;
      return `${heading}<div class="match-timing-detail"><span class="match-timing-detail__name">${name}</span><span class="match-timing-detail__value">${value}</span></div>`;
    }).join('');

    summary.innerHTML=`
      <div class="match-timings-summary__head">Match Timings</div>
      <div class="match-timings-summary__grid match-timings-summary__grid--halves">
        ${timingCards(t).map(([label,value])=>`<div class="match-timings-summary__item"><span>${label}</span><b>${value}</b></div>`).join('')}
      </div>
      <div class="match-timings-summary__windows" aria-label="Half timing windows">
        <span><b>1H</b> 0:00 — ${fmt(t.firstHalfEnd)}</span>
        <span><b>2H</b> 45:00 — ${fmt(t.secondHalfEnd)} <em>FT</em></span>
      </div>
      <button class="match-timings-summary__toggle" type="button" aria-expanded="false" aria-controls="matchTimingsDetails">
        <span>Expand Details</span><span class="match-timings-summary__chevron" aria-hidden="true">⌄</span>
      </button>
      <div id="matchTimingsDetails" class="match-timings-summary__details" hidden>${detailRows}</div>
      <div hidden aria-hidden="true"><span id="sumFrom"></span><span id="sumTo"></span><span id="sumTeam"></span><span id="sumMetric"></span></div>`;

    const toggle=summary.querySelector('.match-timings-summary__toggle');
    const detailsEl=summary.querySelector('#matchTimingsDetails');
    toggle.addEventListener('click',()=>{
      const expanded=toggle.getAttribute('aria-expanded')==='true';
      toggle.setAttribute('aria-expanded',String(!expanded));
      detailsEl.hidden=expanded;
      toggle.querySelector('span:first-child').textContent=expanded?'Expand Details':'Hide Details';
      summary.classList.toggle('is-expanded',!expanded);
    });
  }

  function publish(t){
    window.PitchLabTiming=t;
    window.dispatchEvent(new CustomEvent('pitchlab:timings-ready',{detail:t}));
    render(t);
  }

  async function install(){
    publish(normalise(FALLBACK));
    try{
      const r=await fetch('./WS_1903384_raw.json?v='+Date.now(),{cache:'no-store'});
      if(!r.ok)return;
      const data=await r.json();
      publish(derive(data?.events));
    }catch(_){/* keep the safe display fallback */}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
