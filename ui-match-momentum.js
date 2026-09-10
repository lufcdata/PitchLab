(()=>{
  if(document.getElementById('matchMomentumPanel'))return;
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const eventType=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').toLowerCase().replace(/[\s_-]/g,'');
  const outcome=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const teamName=e=>window.PitchLabMetricBible?.teamOf?.(e)||dn(e?.team)||e?.teamName||'';
  const playerName=e=>dn(e?.player)||e?.playerName||e?.name||'Unknown player';
  const hasAny=(e,...qs)=>typeof hasQ==='function'&&hasQ(e,...qs);
  const sec=e=>window.PitchLabCanonicalTime?.timelineSecond?.(e)??(Number(e?.minute||0)*60+Number(e?.second||0));
  const isGoal=e=>['goal','owngoal'].includes(eventType(e))||hasAny(e,'OwnGoal');
  const isOwnGoal=e=>eventType(e)==='owngoal'||hasAny(e,'OwnGoal');
  const isRed=e=>eventType(e)==='card'&&hasAny(e,'Red','SecondYellow','SecondYellowRed');
  const fmtMinute=e=>{const m=Number(e?.minute||0),sm=Number(e?.expandedMinute||m);if(sm>m&&m>=45)return `${m}+${sm-m}’`;return `${m}’`};
  const cssColour=team=>{const root=getComputedStyle(document.documentElement);const home=typeof raw!=='undefined'?(raw.home?.name||''):'';return root.getPropertyValue(team===home?'--home-team-colour':'--away-team-colour').trim()||(team===home?'#4ef0ce':'#5d79d8')};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function eventWeight(e){
    const t=eventType(e),ok=outcome(e)!=='unsuccessful',x=Number(e?.x||0),endX=Number(e?.endX||x);
    if(isGoal(e))return 6;
    if(['savedshot','shotonpost'].includes(t))return 4.5;
    if(['missedshots','shot'].includes(t))return 3.2;
    if(t==='takeon'&&ok)return 1.5;
    if(t==='pass'&&ok){let w=0;if(endX>=83)w+=1.35;else if(endX>=67)w+=.7;if(hasAny(e,'KeyPass','Assist'))w+=2.2;return w;}
    if(t==='ballrecovery'&&x>=60)return .65;
    if(['tackle','interception'].includes(t)&&x>=60)return .55;
    return 0;
  }
  function buildSeries(list,home,away,maxSec){
    const bins=Math.max(90,Math.ceil(maxSec/60)+1),homeRaw=Array(bins).fill(0),awayRaw=Array(bins).fill(0);
    for(const e of list){const w=eventWeight(e);if(!w)continue;const i=Math.max(0,Math.min(bins-1,Math.floor(sec(e)/60))),tm=teamName(e);if(tm===home)homeRaw[i]+=w;else if(tm===away)awayRaw[i]+=w;}
    const smooth=a=>a.map((_,i)=>{let n=0,d=0;for(let k=-2;k<=2;k++){const j=i+k;if(j<0||j>=a.length)continue;const wt=k===0?3:Math.abs(k)===1?2:1;n+=a[j]*wt;d+=wt}return d?n/d:0});
    const h=smooth(homeRaw),a=smooth(awayRaw),net=h.map((v,i)=>v-a[i]),peak=Math.max(1,...net.map(Math.abs));return net.map(v=>v/peak);
  }
  function scoreAfter(events,target,home,away){let h=0,a=0;for(const e of events){if(sec(e)>sec(target))break;if(!isGoal(e))continue;let tm=teamName(e);if(isOwnGoal(e))tm=tm===home?away:home;if(tm===home)h++;else if(tm===away)a++;}return `${h}-${a}`}
  function tooltipHtml(e,all,home,away){const tm=teamName(e),minute=fmtMinute(e);if(isGoal(e)){const credited=isOwnGoal(e)?(tm===home?away:home):tm;const penalty=hasAny(e,'Penalty')?' · Penalty':'';const ownGoal=isOwnGoal(e)?' · Own goal':'';return `<b>⚽ ${esc(playerName(e))} ${esc(minute)}</b><span>${esc(credited)} · Goal${penalty}${ownGoal}</span><strong>Score: ${esc(scoreAfter(all,e,home,away))}</strong>`}return `<b>🟥 ${esc(playerName(e))} ${esc(minute)}</b><span>${esc(tm)} · Red card${hasAny(e,'SecondYellow','SecondYellowRed')?' (second yellow)':''}</span>`}
  function render(){
    if(typeof raw==='undefined'||!raw||typeof events==='undefined'||!Array.isArray(events)||!events.length)return;
    const panel=document.getElementById('matchMomentumPanel'),svg=document.getElementById('matchMomentumSvg');if(!panel||!svg)return;
    const home=raw.home?.name||'Home',away=raw.away?.name||'Away',ordered=[...events].sort((a,b)=>sec(a)-sec(b)),maxSec=Math.max(90*60,...ordered.map(sec)),series=buildSeries(ordered,home,away,maxSec),W=1000,H=310,left=24,right=24,top=34,bottom=42,mid=(top+H-bottom)/2,plotW=W-left-right,amp=(H-bottom-top)/2-18;
    const pts=series.map((v,i)=>[left+i/(series.length-1)*plotW,mid-v*amp]);
    const pathFor=sign=>{let d=`M ${left} ${mid}`;for(const [x,y] of pts){const yy=sign>0?Math.min(mid,y):Math.max(mid,y);d+=` L ${x.toFixed(2)} ${yy.toFixed(2)}`}d+=` L ${left+plotW} ${mid} Z`;return d};
    const hc=cssColour(home),ac=cssColour(away),halfX=left+(45*60/maxSec)*plotW;
    const markers=ordered.filter(e=>isGoal(e)||isRed(e)).map((e,idx)=>{let tm=teamName(e);if(isGoal(e)&&isOwnGoal(e))tm=tm===home?away:home;const positive=tm===home,x=left+Math.min(1,sec(e)/maxSec)*plotW,y=positive?top+12+(idx%2)*22:H-bottom-16-(idx%2)*22,kind=isGoal(e)?'goal':'red';return `<g class="match-momentum__marker" tabindex="0" data-tip="${encodeURIComponent(tooltipHtml(e,ordered,home,away))}" transform="translate(${x.toFixed(1)} ${y})"><circle r="12" fill="#11151e" stroke="${positive?hc:ac}" stroke-width="2"/><text text-anchor="middle" dominant-baseline="central" font-size="14">${kind==='goal'?'⚽':'🟥'}</text></g>`}).join('');
    svg.innerHTML=`<defs><linearGradient id="mmHome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hc}" stop-opacity=".95"/><stop offset="1" stop-color="${hc}" stop-opacity=".55"/></linearGradient><linearGradient id="mmAway" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ac}" stop-opacity=".55"/><stop offset="1" stop-color="${ac}" stop-opacity=".95"/></linearGradient></defs><line x1="${left}" x2="${W-right}" y1="${mid}" y2="${mid}" class="match-momentum__baseline"/><line x1="${halfX}" x2="${halfX}" y1="${top}" y2="${H-bottom}" class="match-momentum__half"/><path d="${pathFor(1)}" fill="url(#mmHome)"/><path d="${pathFor(-1)}" fill="url(#mmAway)"/>${markers}<text x="${left}" y="${H-12}" class="match-momentum__time">0′</text><text x="${halfX}" y="${H-12}" text-anchor="middle" class="match-momentum__time">HT</text><text x="${W-right}" y="${H-12}" text-anchor="end" class="match-momentum__time">FT</text>`;
    panel.querySelector('.match-momentum__home').textContent=home;panel.querySelector('.match-momentum__away').textContent=away;panel.style.setProperty('--momentum-home',hc);panel.style.setProperty('--momentum-away',ac);bindTips();
  }
  function bindTips(){const tip=document.getElementById('matchMomentumTooltip');document.querySelectorAll('.match-momentum__marker').forEach(m=>{const show=()=>{tip.innerHTML=decodeURIComponent(m.dataset.tip||'');const r=m.getBoundingClientRect(),pr=document.getElementById('matchMomentumPanel').getBoundingClientRect();tip.style.left=`${Math.max(8,Math.min(pr.width-230,r.left-pr.left-105))}px`;tip.style.top=`${Math.max(8,r.top-pr.top-78)}px`;tip.classList.add('is-visible')};const hide=()=>tip.classList.remove('is-visible');m.addEventListener('mouseenter',show);m.addEventListener('mouseleave',hide);m.addEventListener('focus',show);m.addEventListener('blur',hide)})}
  function install(){const stats=document.getElementById('matchStatsPanel');if(!stats)return false;const section=document.createElement('section');section.id='matchMomentumPanel';section.className='match-momentum';section.innerHTML=`<div class="match-momentum__head"><div><div class="match-momentum__kicker">Match Momentum</div><h3>Match Momentum</h3></div><div class="match-momentum__legend"><span><i class="match-momentum__swatch match-momentum__swatch--home"></i><b class="match-momentum__home">Home</b></span><span><i class="match-momentum__swatch match-momentum__swatch--away"></i><b class="match-momentum__away">Away</b></span></div></div><div class="match-momentum__chart"><svg id="matchMomentumSvg" viewBox="0 0 1000 310" role="img" aria-label="Full match attacking momentum with goals and red cards"></svg><div id="matchMomentumTooltip" class="match-momentum__tooltip" role="tooltip"></div></div><div class="match-momentum__note">Momentum is an event-based attacking-pressure index smoothed across the match. Home is plotted above the baseline and away below. Goal and red-card markers show exact event details on hover or keyboard focus.</div>`;stats.insertBefore(section,stats.firstChild);render();return true}
  let tries=0;const timer=setInterval(()=>{if(install()||++tries>60)clearInterval(timer)},100);
  document.addEventListener('pitchlab:team-colours-changed',render);
  ['change','input'].forEach(type=>document.addEventListener(type,e=>{if(e.target?.id==='matchSelect'||e.target?.id==='matchSwitcher')setTimeout(render,80)}));
  const obs=new MutationObserver(()=>{if(document.getElementById('matchMomentumPanel')&&typeof events!=='undefined'&&events.length)render()});obs.observe(document.body,{childList:true,subtree:true});
})();
