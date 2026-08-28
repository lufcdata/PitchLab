(()=>{
  const $=id=>document.getElementById(id);
  const from=$('fromRange'),to=$('toRange');
  const wrap=document.querySelector('.period-card .range-wrap');
  if(!from||!to||!wrap)return;

  const ticks=document.createElement('div');ticks.className='period-ticks';wrap.appendChild(ticks);
  const firstAdded=document.createElement('div');firstAdded.className='period-added-segment period-added-segment--first';firstAdded.setAttribute('aria-hidden','true');wrap.appendChild(firstAdded);
  const secondAdded=document.createElement('div');secondAdded.className='period-added-segment period-added-segment--second';secondAdded.setAttribute('aria-hidden','true');wrap.appendChild(secondAdded);
  const halftimeGap=document.createElement('div');halftimeGap.className='halftime-gap';halftimeGap.setAttribute('aria-hidden','true');wrap.appendChild(halftimeGap);
  let frame=0;

  function addTick(label,timeline,className=''){
    const clock=window.PitchLabCanonicalTime;if(!clock)return;
    const max=clock.timing.fullTimeline||90*60;
    const tick=document.createElement('span');tick.className=`period-tick ${className}`.trim();
    tick.style.left=`${Math.min(100,Math.max(0,timeline/max*100))}%`;
    tick.innerHTML=`<span class="period-tick__main">${label}</span>`;ticks.appendChild(tick);
  }

  function timelineForClockSecond(clockSeconds){
    const clock=window.PitchLabCanonicalTime;if(!clock)return clockSeconds;
    if(clockSeconds<=45*60)return clockSeconds;
    return clock.timing.secondHalfStart+(clockSeconds-45*60);
  }

  function draw(){
    frame=0;
    const clock=window.PitchLabCanonicalTime;if(!clock)return;
    const {firstHalfEnd,secondHalfStart,fullTimeline}=clock.timing;
    ticks.innerHTML='';
    for(const m of [0,15,30,45,60,75,90]){
      const t=timelineForClockSecond(m*60);if(t<fullTimeline-1)addTick(String(m),t,m===0?'period-tick--start':'');
    }
    addTick('HT',firstHalfEnd,'period-tick--milestone');
    addTick('FT',fullTimeline,'period-tick--milestone period-tick--end');
    const pct=s=>Math.min(100,Math.max(0,s/fullTimeline*100));
    firstAdded.style.left=`${pct(45*60)}%`;firstAdded.style.width=`${Math.max(0,pct(firstHalfEnd)-pct(45*60))}%`;
    const secondAddedStart=timelineForClockSecond(90*60);secondAdded.style.left=`${pct(secondAddedStart)}%`;secondAdded.style.width=`${Math.max(0,100-pct(secondAddedStart))}%`;
    halftimeGap.style.left=`${pct(firstHalfEnd)}%`;
    halftimeGap.style.width=`${Math.max(.12,pct(secondHalfStart)-pct(firstHalfEnd))}%`;
    from.step=to.step=String(100/fullTimeline);
  }

  function refresh(){if(frame)return;frame=requestAnimationFrame(draw)}
  document.addEventListener('pitchlab:canonical-time-ready',refresh);
  document.addEventListener('pitchlab:match-loaded',refresh);
  window.addEventListener('resize',refresh,{passive:true});
  refresh();
})();
