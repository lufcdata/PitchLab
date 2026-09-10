(()=>{
  const $=id=>document.getElementById(id);
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const eventType=e=>String(dn(e?.type)||'').toLowerCase().replace(/[\s_-]/g,'');
  const outcome=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const periodName=e=>String(dn(e?.period)||'').toLowerCase().replace(/[\s_-]/g,'');
  const qualifierNames=e=>(Array.isArray(e?.qualifiers)?e.qualifiers:[]).map(q=>String(dn(q?.type)||'').toLowerCase().replace(/[\s_-]/g,''));
  const hasQualifier=(e,...names)=>{const qs=qualifierNames(e);return names.some(name=>{const n=String(name).toLowerCase().replace(/[\s_-]/g,'');return qs.some(q=>q===n||q.includes(n));});};
  const isOwnGoal=e=>eventType(e)==='owngoal'||hasQualifier(e,'OwnGoal');
  const isGoal=e=>eventType(e)==='goal'||eventType(e)==='owngoal'||hasQualifier(e,'OwnGoal');
  const isRed=e=>eventType(e)==='card'&&hasQualifier(e,'Red','SecondYellow','SecondYellowRed');
  const evtSec=e=>{
    const t=window.PitchLabCanonicalTime?.timelineSecond?.(e);
    if(Number.isFinite(t))return t;
    const p=periodName(e),local=Number(e?.minute||0)*60+Number(e?.second||0);
    return (p==='firsthalf'||p==='secondhalf')?local:NaN;
  };
  const teamOf=e=>typeof teamName==='function'?teamName(e):'';
  const opposite=(team,home,away)=>team===home?away:team===away?home:'';
  const goalTeam=(e,home,away)=>isOwnGoal(e)?opposite(teamOf(e),home,away):teamOf(e);
  const colour=side=>getComputedStyle(document.documentElement).getPropertyValue(side==='home'?'--home-team-colour':'--away-team-colour').trim()||(side==='home'?'#4ef0ce':'#5d79d8');
  const playerName=e=>{
    const id=String(e?.playerId??'');
    if(typeof raw!=='undefined'&&raw?.playerIdNameDictionary?.[id])return raw.playerIdNameDictionary[id];
    if(typeof players!=='undefined'&&players){
      if(players instanceof Map&&players.get(id))return players.get(id)?.name||players.get(id);
      if(players[id])return players[id]?.name||players[id];
    }
    return id?`Player ${id}`:'Unknown player';
  };
  const minuteLabel=e=>{
    const m=Number(e?.minute);
    if(Number.isFinite(m))return `${m}′`;
    const t=evtSec(e);return Number.isFinite(t)?`${Math.floor(t/60)}′`:'';
  };
  const weight=e=>{
    const t=eventType(e),ok=outcome(e)!=='unsuccessful',x=Number(e?.x||0),endX=Number(e?.endX??x);
    if(isGoal(e))return 6;
    if(['savedshot','shotonpost'].includes(t))return 4.5;
    if(['missedshots','shot'].includes(t))return 3.2;
    if(t==='takeon'&&ok)return 1.5;
    if(t==='pass'&&ok){let w=endX>=83?1.35:(endX>=67?0.7:0);if(hasQualifier(e,'KeyPass','Assist','IntentionalGoalAssist'))w+=2.2;return w;}
    if(t==='ballrecovery'&&x>=60)return .65;
    if(['tackle','interception'].includes(t)&&x>=60)return .55;
    return 0;
  };
  const smooth=x=>x.map((_,i)=>{let n=0,d=0;for(let k=-3;k<=3;k++){const j=i+k;if(j<0||j>=x.length)continue;const wt=[1,2,3,4,3,2,1][k+3];n+=x[j]*wt;d+=wt;}return d?n/d:0;});
  function curve(points){
    if(!points.length)return'';
    let d=`M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
    for(let i=0;i<points.length-1;i++){
      const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)],t=.16;
      const c1x=p1[0]+(p2[0]-p0[0])*t,c1y=p1[1]+(p2[1]-p0[1])*t;
      const c2x=p2[0]-(p3[0]-p1[0])*t,c2y=p2[1]-(p3[1]-p1[1])*t;
      d+=` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
    }
    return d;
  }
  const area=(points,mid)=>`${curve(points)} L ${points[points.length-1][0].toFixed(2)} ${mid.toFixed(2)} L ${points[0][0].toFixed(2)} ${mid.toFixed(2)} Z`;
  function scoreAfter(target,ordered,home,away){
    let h=0,a=0;
    for(const e of ordered){if(isGoal(e)){const tm=goalTeam(e,home,away);if(tm===home)h++;else if(tm===away)a++;}if(e===target)break;}
    return `${h}–${a}`;
  }
  function tooltipHtml(e,ordered,home,away){
    const goal=isGoal(e),credited=goal?goalTeam(e,home,away):teamOf(e),name=playerName(e),minute=minuteLabel(e);
    const penalty=goal&&hasQualifier(e,'Penalty'),own=goal&&isOwnGoal(e),secondYellow=!goal&&hasQualifier(e,'SecondYellow','SecondYellowRed');
    let extra='';
    if(goal){if(penalty)extra+='<span>Penalty</span>';if(own)extra+='<span>Own goal</span>';extra+=`<strong>Score after goal: ${scoreAfter(e,ordered,home,away)}</strong>`;}
    else if(secondYellow)extra+='<span>Second yellow card</span>';
    return `<b>${goal?'⚽ Goal':'🟥 Red card'} — ${esc(name)}</b><span>${esc(minute)}${minute?' · ':''}${esc(credited||'Unknown team')}</span>${extra}`;
  }
  function ensureTooltip(chart){let tip=chart.querySelector('.match-momentum__tooltip');if(!tip){tip=document.createElement('div');tip.className='match-momentum__tooltip';tip.setAttribute('role','status');chart.appendChild(tip);}return tip;}
  function bindMarkers(svg,eventMarkers,ordered,home,away){
    const chart=svg.closest('.match-momentum__chart');if(!chart)return;
    const tip=ensureTooltip(chart),hide=()=>tip.classList.remove('is-visible');
    const show=(el,e)=>{
      tip.innerHTML=tooltipHtml(e,ordered,home,away);
      const cr=chart.getBoundingClientRect(),mr=el.getBoundingClientRect(),x=mr.left-cr.left+mr.width/2,y=mr.top-cr.top;
      tip.style.left=`${Math.max(8,Math.min(Math.max(8,cr.width-238),x-105))}px`;
      tip.style.top=`${Math.max(8,y-78)}px`;
      tip.classList.add('is-visible');
    };
    svg.querySelectorAll('.match-momentum__marker').forEach((el,i)=>{const e=eventMarkers[i];if(!e)return;el.addEventListener('mouseenter',()=>show(el,e));el.addEventListener('mouseleave',hide);el.addEventListener('focus',()=>show(el,e));el.addEventListener('blur',hide);});
  }
  function render(){
    const svg=$('matchMomentumSvg');
    if(!svg||typeof events==='undefined'||!Array.isArray(events)||!events.length||typeof raw==='undefined'||!raw)return;
    const home=raw.home?.name||'Home',away=raw.away?.name||'Away';
    const ordered=[...events].filter(e=>Number.isFinite(evtSec(e))).sort((a,b)=>evtSec(a)-evtSec(b)||(Number(a.eventId)||0)-(Number(b.eventId)||0));
    if(!ordered.length)return;
    const maxSec=Math.max(90*60,...ordered.map(evtSec)),bins=Math.max(91,Math.ceil(maxSec/60)+1),h=Array(bins).fill(0),a=Array(bins).fill(0);
    for(const e of ordered){const w=weight(e);if(!w)continue;const i=Math.max(0,Math.min(bins-1,Math.floor(evtSec(e)/60))),tm=teamOf(e);if(tm===home)h[i]+=w;else if(tm===away)a[i]+=w;}
    const hs=smooth(h),as=smooth(a),net=hs.map((v,i)=>v-as[i]),peak=Math.max(1,...net.map(Math.abs)),series=net.map(v=>v/peak);
    const W=1000,H=310,left=24,right=24,top=34,bottom=42,mid=(top+H-bottom)/2,plotW=W-left-right,amp=(H-bottom-top)/2-18;
    const rawPts=series.map((v,i)=>[left+i/(series.length-1)*plotW,mid-v*amp]);
    const homePts=rawPts.map(([x,y])=>[x,Math.min(mid,y)]),awayPts=rawPts.map(([x,y])=>[x,Math.max(mid,y)]);
    const hc=colour('home'),ac=colour('away'),half=window.PitchLabCanonicalTime?.timing?.firstHalfEnd??45*60,halfX=left+(half/maxSec)*plotW;
    const eventMarkers=ordered.filter(e=>isGoal(e)||isRed(e));
    const markers=eventMarkers.map((e,idx)=>{const tm=isGoal(e)?goalTeam(e,home,away):teamOf(e),homeSide=tm===home,x=left+Math.min(1,evtSec(e)/maxSec)*plotW,y=homeSide?top+14+(idx%2)*22:H-bottom-16-(idx%2)*22,label=isGoal(e)?'Goal':'Red card';return `<g class="match-momentum__marker" tabindex="0" role="button" aria-label="${esc(label)}, ${esc(playerName(e))}, ${esc(minuteLabel(e))}, ${esc(tm)}" transform="translate(${x.toFixed(1)} ${y})"><circle r="12" fill="#11151e" stroke="${homeSide?hc:ac}" stroke-width="2"/><text text-anchor="middle" dominant-baseline="central" font-size="14" pointer-events="none">${isGoal(e)?'⚽':'🟥'}</text></g>`;}).join('');
    svg.innerHTML=`<defs><linearGradient id="mmHomeSmooth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hc}" stop-opacity=".95"/><stop offset="1" stop-color="${hc}" stop-opacity=".5"/></linearGradient><linearGradient id="mmAwaySmooth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ac}" stop-opacity=".5"/><stop offset="1" stop-color="${ac}" stop-opacity=".95"/></linearGradient></defs><line x1="${left}" x2="${W-right}" y1="${mid}" y2="${mid}" class="match-momentum__baseline"/><line x1="${halfX}" x2="${halfX}" y1="${top}" y2="${H-bottom}" class="match-momentum__half"/><path d="${area(homePts,mid)}" fill="url(#mmHomeSmooth)"/><path d="${area(awayPts,mid)}" fill="url(#mmAwaySmooth)"/>${markers}<text x="${left}" y="${H-12}" class="match-momentum__time">0′</text><text x="${halfX}" y="${H-12}" text-anchor="middle" class="match-momentum__time">HT</text><text x="${W-right}" y="${H-12}" text-anchor="end" class="match-momentum__time">FT</text>`;
    const hLabel=$('matchMomentumHome'),aLabel=$('matchMomentumAway');if(hLabel)hLabel.textContent=home;if(aLabel)aLabel.textContent=away;
    bindMarkers(svg,eventMarkers,ordered,home,away);svg.dataset.momentumEnhanced='1';
  }
  let timer=0;const schedule=()=>{clearTimeout(timer);timer=setTimeout(render,40);};
  ['pitchlab:match-loaded','pitchlab:playing-events-ready','pitchlab:canonical-time-ready','pitchlab:team-colours-changed'].forEach(name=>document.addEventListener(name,schedule));
  document.addEventListener('click',e=>{if(e.target.closest?.('#pitchViewToggle,[data-view="match-stats"],.match-stats-tab'))schedule();});
  setInterval(()=>{const svg=$('matchMomentumSvg');if(svg&&!svg.querySelector('.match-momentum__marker')&&typeof events!=='undefined'&&events.length)schedule();},500);
  schedule();
})();