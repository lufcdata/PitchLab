(()=>{
  const metric=document.getElementById('metric');
  const legend=document.getElementById('plotLegend');
  const from=document.getElementById('fromRange');
  const to=document.getElementById('toRange');
  const outcomeLabels={
    total_actions:['Successful Action','Unsuccessful Action'],
    tackles:['Tackle Won','Tackle Lost'],
    takeons:['Successful Take-On','Unsuccessful Take-On'],
    total_duels:['Duel Won','Duel Lost'],
    ground_duels:['Ground Duel Won','Ground Duel Lost'],
    aerial_duels:['Aerial Duel Won','Aerial Duel Lost'],
    att_aerial_duels:['Attacking Aerial Duel Won','Attacking Aerial Duel Lost'],
    def_aerial_duels:['Defensive Aerial Duel Won','Defensive Aerial Duel Lost']
  };

  function syncOutcomeLegend(){
    if(!metric||!legend)return;const labels=outcomeLabels[metric.value];if(!labels)return;
    legend.innerHTML=`<span class="legend-item"><i class="legend-circle metric" style="--metric-colour:#43FAD5"></i>${labels[0]}</span><span class="legend-item"><i class="legend-circle metric" style="--metric-colour:#ED1362"></i>${labels[1]}</span>`;
  }

  function ensureFullTimeEvent(){
    const list=document.getElementById('matchEventsList');
    if(!list||list.querySelector('.match-event-row--full'))return;
    const clock=window.PitchLabCanonicalTime;
    if(!clock||!to||Number(to.value)<99.999)return;
    const timing=clock.timing;if(!timing||!Number.isFinite(timing.fullTimeline))return;
    const text=clock.formatClock(timing.fullTimeline);
    const row=document.createElement('div');row.className='match-event-row match-event-row--full';row.dataset.syntheticFullTime='1';
    row.innerHTML=`<div class="match-event__club-cell"><span class="match-event__club-neutral"></span></div><div class="match-event__event">Full-Time</div><time class="match-event__time">${text}</time><div class="match-event__player">—</div>`;
    list.appendChild(row);
    const count=document.getElementById('matchEventsCount');if(count){const n=list.querySelectorAll('.match-event-row').length;count.textContent=`${n} event${n===1?'':'s'}`}
  }

  function refresh(){requestAnimationFrame(()=>{syncOutcomeLegend();ensureFullTimeEvent()})}
  metric?.addEventListener('change',refresh);metric?.addEventListener('input',refresh);
  from?.addEventListener('input',refresh);to?.addEventListener('input',refresh);
  document.addEventListener('pitchlab:canonical-time-ready',refresh);
  document.addEventListener('pitchlab:match-loaded',refresh);
  const eventCount=document.getElementById('eventCount');if(eventCount)new MutationObserver(refresh).observe(eventCount,{childList:true,subtree:true,characterData:true});
  setTimeout(refresh,100);
})();
