(()=>{
  const HALF=45*60;
  const REGULATION=90*60;
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const norm=v=>String(dn(v)||'').toLowerCase().replace(/[\s_-]/g,'');
  const hasSecond=e=>e?.second!==undefined&&e?.second!==null&&e?.second!=='';
  const eventSeconds=e=>Number(e?.minute||0)*60+(hasSecond(e)?Number(e.second):0);
  const periodKey=e=>{const p=norm(e?.period);return p.includes('first')||p==='1'?1:p.includes('second')||p==='2'?2:9};
  const typeName=e=>norm(e?.type);
  const qualifiers=e=>new Set((e?.qualifiers||[]).map(q=>Number(q?.type?.value??q?.type)));
  const isAdmin=e=>['card','substitutionoff','substitutionon','formationchange','formationset','start','end'].includes(typeName(e));
  const restartType=e=>{const q=qualifiers(e);if(q.has(107))return'throw';if(q.has(5))return'free';if(q.has(124))return'goalKick';if(q.has(6))return'corner';return null};
  const fmt=seconds=>{if(!Number.isFinite(seconds))return'—';const s=Math.max(0,Math.round(seconds));return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`};
  const pct=(part,total)=>Number.isFinite(part)&&total>0?`${(part/total*100).toFixed(1)}%`:'—';
  const displayNumber=value=>Number.isFinite(value)?String(value):'—';

  function sortedPlayable(source){
    return [...(Array.isArray(source)?source:[])]
      .filter(e=>periodKey(e)<9&&hasSecond(e))
      .sort((a,b)=>periodKey(a)-periodKey(b)||eventSeconds(a)-eventSeconds(b)||(Number(a?.eventId)||0)-(Number(b?.eventId)||0));
  }

  function periodEnd(source,key,floor){
    const period=(Array.isArray(source)?source:[]).filter(e=>periodKey(e)===key&&hasSecond(e));
    const ends=period.filter(e=>typeName(e)==='end');
    const candidates=(ends.length?ends:period).map(eventSeconds).filter(Number.isFinite);
    return candidates.length?Math.max(floor,...candidates):floor;
  }

  function hasRestartDetail(source){
    return (Array.isArray(source)?source:[]).some(e=>{const q=qualifiers(e);return q.has(107)||q.has(5)||q.has(124)||q.has(6)});
  }

  function deadBallEstimate(source){
    const ordered=sortedPlayable(source);
    const restarts=ordered.filter(restartType);
    let restartDead=0;
    for(const restart of restarts){
      const i=ordered.indexOf(restart);
      let previous=null;
      for(let j=i-1;j>=0;j--){
        const e=ordered[j];
        if(periodKey(e)!==periodKey(restart))break;
        if(!isAdmin(e)){previous=e;break}
      }
      if(previous)restartDead+=Math.max(0,eventSeconds(restart)-eventSeconds(previous));
    }

    const goals=ordered.filter(e=>typeName(e)==='goal');
    let postGoal=0;
    for(const goal of goals){
      const i=ordered.indexOf(goal);
      for(let j=i+1;j<ordered.length;j++){
        const e=ordered[j];
        if(periodKey(e)!==periodKey(goal))break;
        if(isAdmin(e))continue;
        postGoal+=Math.max(0,eventSeconds(e)-eventSeconds(goal));
        break;
      }
    }
    return{restartDead,postGoal,total:restartDead+postGoal};
  }

  function derive(source){
    const list=Array.isArray(source)?source:[];
    if(!list.length)return null;
    const firstHalfEnd=periodEnd(list,1,HALF);
    const fullTime=periodEnd(list,2,REGULATION);
    const firstHalfDuration=firstHalfEnd;
    const secondHalfDuration=Math.max(HALF,fullTime-HALF);
    const firstHalfAdded=Math.max(0,firstHalfDuration-HALF);
    const secondHalfAdded=Math.max(0,secondHalfDuration-HALF);
    const matchDuration=firstHalfDuration+secondHalfDuration;
    const addedTime=firstHalfAdded+secondHalfAdded;
    const restartDetailAvailable=hasRestartDetail(list);

    let throws=0,freeKicks=0,goalKicks=0,corners=0,goals=0,offsides=0;
    for(const e of list){
      const q=qualifiers(e),t=typeName(e);
      if(q.has(107))throws++;
      if(q.has(5))freeKicks++;
      if(q.has(124))goalKicks++;
      if(q.has(6))corners++;
      if(t==='goal')goals++;
      if(t==='offsidegiven')offsides++;
    }
    const dead=deadBallEstimate(list);
    const gameStops=restartDetailAvailable?throws+freeKicks+goalKicks+corners+goals+offsides:null;
    const ballOut=restartDetailAvailable?Math.min(matchDuration,Math.max(0,dead.total)):null;
    const ballIn=Number.isFinite(ballOut)?Math.max(0,matchDuration-ballOut):null;

    return{
      version:'MATCH_TIMINGS_DYNAMIC_V1_2026-09-06',
      firstHalfEnd,fullTime,firstHalfDuration,secondHalfDuration,firstHalfAdded,secondHalfAdded,
      matchDuration,allocatedTime:fullTime,addedTime,
      ballIn,ballOut,ballInPct:Number.isFinite(ballIn)&&matchDuration?ballIn/matchDuration*100:null,ballOutPct:Number.isFinite(ballOut)&&matchDuration?ballOut/matchDuration*100:null,
      gameStops,
      throws:restartDetailAvailable?throws:null,
      freeKicks:restartDetailAvailable?freeKicks:null,
      goalKicks:restartDetailAvailable?goalKicks:null,
      corners:restartDetailAvailable?corners:null,
      goals:restartDetailAvailable?goals:null,
      offsides:restartDetailAvailable?offsides:null,
      postGoalTime:goals?dead.postGoal:null,
      restartDetailAvailable,
      ballStatusMethod:restartDetailAvailable?'event-restart-estimate':'unavailable'
    };
  }

  function rows(t){return{
    primary:[
      ['Match Duration',fmt(t?.matchDuration)],
      ['Allocated Time',fmt(t?.allocatedTime)],
      ['Added Time',fmt(t?.addedTime)]
    ],
    details:[
      ['HALVES','1st Half Duration',fmt(t?.firstHalfDuration)],
      ['HALVES','1st Half Added Time',fmt(t?.firstHalfAdded)],
      ['HALVES','2nd Half Duration',fmt(t?.secondHalfDuration)],
      ['HALVES','2nd Half Added Time',fmt(t?.secondHalfAdded)],
      ['BALL STATUS','Ball In Play (est.)',fmt(t?.ballIn)],
      ['BALL STATUS','Ball In Play % (est.)',t?pct(t.ballIn,t.matchDuration):'—'],
      ['BALL STATUS','Ball Out of Play (est.)',fmt(t?.ballOut)],
      ['BALL STATUS','Ball Out of Play % (est.)',t?pct(t.ballOut,t.matchDuration):'—'],
      ['STOPPAGES','Game Stops',displayNumber(t?.gameStops)],
      ['STOPPAGES','Throw-in Stops',displayNumber(t?.throws)],
      ['STOPPAGES','Free-kick Restarts',displayNumber(t?.freeKicks)],
      ['STOPPAGES','Goal-kick Stops',displayNumber(t?.goalKicks)],
      ['STOPPAGES','Corner Stops',displayNumber(t?.corners)],
      ['STOPPAGES','Goal Stops',displayNumber(t?.goals)],
      ['STOPPAGES','Offside Stops',displayNumber(t?.offsides)],
      ['STOPPAGES','Post-goal Time',fmt(t?.postGoalTime)]
    ]
  }}

  function render(t){
    const summary=document.querySelector('.summary-card');
    if(!summary)return;
    const wasExpanded=summary.classList.contains('is-expanded')||summary.querySelector('.match-timings-summary__toggle')?.getAttribute('aria-expanded')==='true';
    summary.dataset.matchTimingsInstalled='1';
    summary.classList.add('match-timings-summary');
    const oldPanel=document.getElementById('matchTimings');if(oldPanel)oldPanel.remove();
    const data=rows(t);let current='';
    const detailRows=data.details.map(([section,name,value])=>{
      const heading=section!==current?`<div class="match-timings__section">${section}</div>`:'';current=section;
      return`${heading}<div class="match-timing-detail"><span class="match-timing-detail__name">${name}</span><span class="match-timing-detail__value">${value}</span></div>`;
    }).join('');
    summary.innerHTML=`
      <div class="match-timings-summary__head">Match Timings</div>
      <div class="match-timings-summary__grid">
        ${data.primary.map(([label,value])=>`<div class="match-timings-summary__item"><span>${label}</span><b>${value}</b></div>`).join('')}
      </div>
      <button class="match-timings-summary__toggle" type="button" aria-expanded="${wasExpanded?'true':'false'}" aria-controls="matchTimingsDetails">
        <span>${wasExpanded?'Hide Details':'Expand Details'}</span><span class="match-timings-summary__chevron" aria-hidden="true">⌄</span>
      </button>
      <div id="matchTimingsDetails" class="match-timings-summary__details" ${wasExpanded?'':'hidden'}>${detailRows}</div>
      <div hidden aria-hidden="true"><span id="sumFrom"></span><span id="sumTo"></span><span id="sumTeam"></span><span id="sumMetric"></span></div>`;
    summary.classList.toggle('is-expanded',wasExpanded);
    const toggle=summary.querySelector('.match-timings-summary__toggle'),detailsEl=summary.querySelector('#matchTimingsDetails');
    toggle?.addEventListener('click',()=>{
      const expanded=toggle.getAttribute('aria-expanded')==='true';
      toggle.setAttribute('aria-expanded',String(!expanded));detailsEl.hidden=expanded;
      toggle.querySelector('span:first-child').textContent=expanded?'Expand Details':'Hide Details';
      summary.classList.toggle('is-expanded',!expanded);
    });
  }

  function publish(source){
    const timing=derive(source);
    window.PitchLabTiming=timing;
    try{window.dispatchEvent(new CustomEvent('pitchlab:timings-ready',{detail:timing}))}catch(_){}
    render(timing);
  }
  function currentEvents(){try{return typeof events!=='undefined'&&Array.isArray(events)?events:[]}catch(_){return[]}}
  function install(){publish(currentEvents())}
  document.addEventListener('pitchlab:match-loaded',e=>publish(e?.detail?.events||currentEvents()));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();