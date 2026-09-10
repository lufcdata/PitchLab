(()=>{
  const $=id=>document.getElementById(id);
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const et=e=>String(dn(e?.type)||'').toLowerCase().replace(/[\s_-]/g,'');
  const oc=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const period=e=>String(dn(e?.period)||'').toLowerCase().replace(/[\s_-]/g,'');
  const qnames=e=>(Array.isArray(e?.qualifiers)?e.qualifiers:[]).map(q=>String(dn(q?.type)||'').toLowerCase().replace(/[\s_-]/g,''));
  const hq=(e,...names)=>{const qs=qnames(e);return names.some(name=>{const n=String(name).toLowerCase().replace(/[\s_-]/g,'');return qs.some(q=>q===n||q.includes(n));});};
  const ownGoal=e=>et(e)==='owngoal'||hq(e,'OwnGoal');
  const goal=e=>et(e)==='goal'||et(e)==='owngoal'||hq(e,'OwnGoal');
  const red=e=>et(e)==='card'&&hq(e,'Red','SecondYellow','SecondYellowRed');
  const sec=e=>{const t=window.PitchLabCanonicalTime?.timelineSecond?.(e);if(Number.isFinite(t))return t;const s=Number(e?.minute||0)*60+Number(e?.second||0);return ['firsthalf','secondhalf'].includes(period(e))?s:NaN;};
  const team=e=>typeof teamName==='function'?teamName(e):'';
  const opp=(t,h,a)=>t===h?a:t===a?h:'';
  const credited=(e,h,a)=>ownGoal(e)?opp(team(e),h,a):team(e);
  const colour=side=>getComputedStyle(document.documentElement).getPropertyValue(side==='home'?'--home-team-colour':'--away-team-colour').trim()||(side==='home'?'#4ef0ce':'#5d79d8');
  const test=(key,e)=>{const f=window.PitchLabMetricBible?.canonicalRegistry?.[key]?.test||(typeof FILTERS!=='undefined'?FILTERS[key]:null);return typeof f==='function'&&f(e);};
  const player=e=>{const id=String(e?.playerId??'');return raw?.playerIdNameDictionary?.[id]||(typeof players!=='undefined'&&(players instanceof Map?players.get(id)?.name||players.get(id):players?.[id]?.name||players?.[id]))||(id?`Player ${id}`:'Unknown player');};
  const minute=e=>{const m=Number(e?.minute);return Number.isFinite(m)?`${m}′`:`${Math.floor(sec(e)/60)}′`;};

  const FT=200/3;
  function turnoverSet(ordered){try{const starts=window.PitchLabGoldenV2?.highStarts?.(ordered)?.starts;return new Set(Array.isArray(starts)?starts.map(s=>s.event):[]);}catch(_){return new Set();}}
  // Trial V2 model: one event receives the highest-priority matching weight only, preventing category double-counting.
  function weight(e,turnovers){
    if(test('big_chances',e)||test('big_chances_created',e))return 12;
    if(test('shots_on',e))return 6;
    if(test('woodwork',e))return 5;
    if(test('touch_box',e))return 4;
    if(turnovers.has(e))return 4;
    if(test('box_passes',e))return 3.5;
    if(test('recoveries',e)&&Number(e?.x)>=FT)return 3;
    if(et(e)==='takeon'&&oc(e)!=='unsuccessful'&&Number(e?.x)>=FT)return 3;
    if(test('accurate_crosses',e))return 1.5;
    if(test('final_third_passes',e))return .5;
    return 0;
  }
  const smooth=x=>x.map((_,i)=>{let n=0,d=0;for(let k=-3;k<=3;k++){const j=i+k;if(j<0||j>=x.length)continue;const wt=[1,2,3,4,3,2,1][k+3];n+=x[j]*wt;d+=wt;}return d?n/d:0;});
  function curve(p){if(!p.length)return'';let d=`M ${p[0][0].toFixed(2)} ${p[0][1].toFixed(2)}`;for(let i=0;i<p.length-1;i++){const p0=p[Math.max(0,i-1)],p1=p[i],p2=p[i+1],p3=p[Math.min(p.length-1,i+2)],t=.16;d+=` C ${(p1[0]+(p2[0]-p0[0])*t).toFixed(2)} ${(p1[1]+(p2[1]-p0[1])*t).toFixed(2)}, ${(p2[0]-(p3[0]-p1[0])*t).toFixed(2)} ${(p2[1]-(p3[1]-p1[1])*t).toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;}return d;}
  const area=(p,mid)=>`${curve(p)} L ${p[p.length-1][0].toFixed(2)} ${mid} L ${p[0][0].toFixed(2)} ${mid} Z`;
  function scoreAfter(target,ordered,h,a){let hs=0,as=0;for(const e of ordered){if(goal(e)){const t=credited(e,h,a);if(t===h)hs++;else if(t===a)as++;}if(e===target)break;}return `${hs}–${as}`;}
  function tooltip(e,ordered,h,a){const isG=goal(e),t=isG?credited(e,h,a):team(e);let extra='';if(isG){if(hq(e,'Penalty'))extra+='<span>Penalty</span>';if(ownGoal(e))extra+='<span>Own goal</span>';extra+=`<strong>Score after goal: ${scoreAfter(e,ordered,h,a)}</strong>`;}else if(hq(e,'SecondYellow','SecondYellowRed'))extra+='<span>Second yellow card</span>';return `<b>${isG?'⚽ Goal':'🟥 Red card'} — ${esc(player(e))}</b><span>${esc(minute(e))} · ${esc(t||'Unknown team')}</span>${extra}`;}
  function bind(svg,marks,ordered,h,a){const chart=svg.closest('.match-momentum__chart');if(!chart)return;let tip=chart.querySelector('.match-momentum__tooltip');if(!tip){tip=document.createElement('div');tip.className='match-momentum__tooltip';tip.setAttribute('role','status');chart.appendChild(tip);}const hide=()=>tip.classList.remove('is-visible');svg.querySelectorAll('.match-momentum__marker').forEach((el,i)=>{const e=marks[i];if(!e)return;const show=()=>{tip.innerHTML=tooltip(e,ordered,h,a);const cr=chart.getBoundingClientRect(),mr=el.getBoundingClientRect(),x=mr.left-cr.left+mr.width/2,y=mr.top-cr.top;tip.style.left=`${Math.max(8,Math.min(Math.max(8,cr.width-238),x-105))}px`;tip.style.top=`${Math.max(8,y-78)}px`;tip.classList.add('is-visible');};el.addEventListener('mouseenter',show);el.addEventListener('mouseleave',hide);el.addEventListener('focus',show);el.addEventListener('blur',hide);});}
  function render(){
    const svg=$('matchMomentumSvg');if(!svg||typeof events==='undefined'||!Array.isArray(events)||!events.length||typeof raw==='undefined'||!raw)return;
    const h=raw.home?.name||'Home',a=raw.away?.name||'Away',ordered=[...events].filter(e=>Number.isFinite(sec(e))).sort((x,y)=>sec(x)-sec(y)||(Number(x.eventId)||0)-(Number(y.eventId)||0));if(!ordered.length)return;
    const turnovers=turnoverSet(ordered),max=Math.max(5400,...ordered.map(sec)),bins=Math.max(91,Math.ceil(max/60)+1),hv=Array(bins).fill(0),av=Array(bins).fill(0);
    for(const e of ordered){const w=weight(e,turnovers);if(!w)continue;const i=Math.max(0,Math.min(bins-1,Math.floor(sec(e)/60))),t=team(e);if(t===h)hv[i]+=w;else if(t===a)av[i]+=w;}
    const hs=smooth(hv),as=smooth(av),net=hs.map((v,i)=>v-as[i]),peak=Math.max(1,...net.map(Math.abs)),series=net.map(v=>v/peak);
    const W=1000,H=310,L=24,R=24,T=34,B=42,M=(T+H-B)/2,P=W-L-R,A=(H-B-T)/2-18,rawPts=series.map((v,i)=>[L+i/(series.length-1)*P,M-v*A]),hp=rawPts.map(([x,y])=>[x,Math.min(M,y)]),ap=rawPts.map(([x,y])=>[x,Math.max(M,y)]),hc=colour('home'),ac=colour('away'),half=window.PitchLabCanonicalTime?.timing?.firstHalfEnd??2700,hx=L+(half/max)*P;
    const marks=ordered.filter(e=>goal(e)||red(e)),markerY=T+14;
    const markers=marks.map(e=>{const t=goal(e)?credited(e,h,a):team(e),home=t===h,x=L+Math.min(1,sec(e)/max)*P,label=goal(e)?'Goal':'Red card';return `<g class="match-momentum__marker" tabindex="0" role="button" aria-label="${esc(label)}, ${esc(player(e))}, ${esc(minute(e))}, ${esc(t)}" transform="translate(${x.toFixed(1)} ${markerY})"><circle r="12" fill="#11151e" stroke="${home?hc:ac}" stroke-width="2"/><text text-anchor="middle" dominant-baseline="central" font-size="14" pointer-events="none">${goal(e)?'⚽':'🟥'}</text></g>`;}).join('');
    svg.innerHTML=`<defs><linearGradient id="mmHomeTiered" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hc}" stop-opacity=".95"/><stop offset="1" stop-color="${hc}" stop-opacity=".5"/></linearGradient><linearGradient id="mmAwayTiered" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ac}" stop-opacity=".5"/><stop offset="1" stop-color="${ac}" stop-opacity=".95"/></linearGradient></defs><line x1="${L}" x2="${W-R}" y1="${M}" y2="${M}" class="match-momentum__baseline"/><line x1="${hx}" x2="${hx}" y1="${T}" y2="${H-B}" class="match-momentum__half"/><path d="${area(hp,M)}" fill="url(#mmHomeTiered)"/><path d="${area(ap,M)}" fill="url(#mmAwayTiered)"/>${markers}<text x="${L}" y="${H-12}" class="match-momentum__time">0′</text><text x="${hx}" y="${H-12}" text-anchor="middle" class="match-momentum__time">HT</text><text x="${W-R}" y="${H-12}" text-anchor="end" class="match-momentum__time">FT</text>`;
    $('matchMomentumHome').textContent=h;$('matchMomentumAway').textContent=a;svg.dataset.momentumModel='tiered-v2';bind(svg,marks,ordered,h,a);
  }
  let timer=0;const schedule=()=>{clearTimeout(timer);timer=setTimeout(render,60);};
  ['pitchlab:match-loaded','pitchlab:playing-events-ready','pitchlab:canonical-time-ready','pitchlab:team-colours-changed','pitchlab:gold-metric-bible-team-ready'].forEach(n=>document.addEventListener(n,schedule));
  document.addEventListener('click',e=>{if(e.target.closest?.('#pitchViewToggle,[data-view="match-stats"],.match-stats-tab'))schedule();});
  setTimeout(schedule,200);setTimeout(schedule,800);
})();