(()=>{
  const $=id=>document.getElementById(id);
  const pitchPanel=document.querySelector('.pitch-panel');
  const from=$('fromRange'),to=$('toRange'),eventCount=$('eventCount');
  if(!pitchPanel||!from||!to||!eventCount||$('matchEventsPanel'))return;

  const panel=document.createElement('section');
  panel.id='matchEventsPanel';
  panel.className='match-events-panel';
  panel.innerHTML=`
    <div class="match-events-panel__head">
      <div>
        <div class="match-events-panel__kicker">Match Events</div>
        <div id="matchEventsScope" class="match-events-panel__scope">—</div>
      </div>
      <div id="matchEventsCount" class="match-events-panel__count"></div>
    </div>
    <div class="match-events-panel__columns" aria-hidden="true">
      <span>Club</span><span>Event</span><span>Time</span><span>Player</span>
    </div>
    <div id="matchEventsList" class="match-events-panel__list"><div class="match-events-panel__empty">Loading match events…</div></div>`;

  const error=$('error');
  if(error)error.insertAdjacentElement('beforebegin',panel);else pitchPanel.appendChild(panel);

  const list=$('matchEventsList'),scope=$('matchEventsScope'),count=$('matchEventsCount');
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const typeOf=e=>String(typeof type==='function'?type(e):dn(e?.type)||'');
  const periodOf=e=>String(dn(e?.period)||'');
  const teamNameOf=e=>typeof teamName==='function'?teamName(e):(typeof teamIds!=='undefined'?teamIds[e?.teamId]||'':'');
  const evtSec=e=>Number(e?.minute||0)*60+Number(e?.second||0);
  const esc=s=>String(s??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
  const qNames=e=>(e?.qualifiers||[]).map(q=>String(dn(q?.type)||'')).filter(Boolean);
  const qHas=(e,needle)=>qNames(e).some(q=>q.toLowerCase().includes(String(needle).toLowerCase()));

  function playerName(id){
    if(id==null||id==='')return '';
    const key=String(id);
    if(typeof players!=='undefined'&&players?.[key]?.name)return players[key].name;
    if(typeof raw!=='undefined'&&raw?.playerIdNameDictionary?.[key])return raw.playerIdNameDictionary[key];
    const all=[...(raw?.home?.players||[]),...(raw?.away?.players||[])];
    const p=all.find(x=>String(x?.playerId??x?.id)===key);
    return p?.name||p?.displayName||'';
  }

  function logoPath(name){
    const n=String(name||'').trim();
    if(!n)return '';
    if(n==='Leeds')return 'assets/club-logos/leeds%20png.png';
    return `assets/club-logos/${encodeURIComponent(n)}.png`;
  }

  function timeLabel(e){
    const m=Math.max(0,Number(e?.minute)||0),s=Math.max(0,Number(e?.second)||0);
    return `${m}:${String(Math.floor(s)).padStart(2,'0')}`;
  }

  function timeWindow(){
    if(typeof events==='undefined'||!Array.isArray(events)||!events.length)return {lo:0,hi:Infinity,max:90*60};
    const max=Math.max(90*60,...events.map(evtSec));
    let a=Number(from.value||0),b=Number(to.value||100);if(b<=a)b=Math.min(100,a+1);
    return {lo:a/100*max,hi:b/100*max,max};
  }

  function isGoal(e){return typeOf(e)==='Goal'||typeOf(e)==='OwnGoal'||qHas(e,'OwnGoal');}
  function isRed(e){
    const t=typeOf(e).toLowerCase();
    if(t==='redcard'||t==='secondyellow')return true;
    const card=String(dn(e?.cardType)||'').toLowerCase();
    if(card.includes('red')||card.includes('second yellow'))return true;
    return qNames(e).some(q=>/redcard|secondyellow|second yellow/i.test(q));
  }
  function isSubOff(e){return typeOf(e)==='SubstitutionOff';}
  function isSubOn(e){return typeOf(e)==='SubstitutionOn';}
  function isEnd(e){return typeOf(e)==='End';}

  function assistFor(goal,idx,all){
    const related=goal?.relatedPlayerId;
    if(related&&String(related)!==String(goal?.playerId)){
      const n=playerName(related);if(n)return n;
    }
    for(let i=idx-1;i>=0&&i>=idx-12;i--){
      const e=all[i];
      if(periodOf(e)!==periodOf(goal)||goal.teamId!==e.teamId)continue;
      if(evtSec(goal)-evtSec(e)>20)break;
      if(qHas(e,'IntentionalGoalAssist')||qHas(e,'GoalAssist')||qHas(e,'Assist')){
        const n=playerName(e.playerId);if(n)return n;
      }
    }
    return '';
  }

  function buildRows(){
    if(typeof events==='undefined'||!Array.isArray(events))return [];
    const all=events;
    const rows=[{kind:'kickoff',team:'',time:0,timeText:'0:00',event:'Kick-Off',player:'—'}];
    all.forEach((e,idx)=>{
      const sec=evtSec(e),team=teamNameOf(e);
      if(isGoal(e)){
        const scorer=playerName(e.playerId)||'Unknown player';
        const assist=assistFor(e,idx,all);
        rows.push({kind:'goal',team,time:sec,timeText:timeLabel(e),event:'Goal',player:assist?`${scorer} · assisted by: ${assist}`:scorer});
        return;
      }
      if(isRed(e)){
        rows.push({kind:'red',team,time:sec,timeText:timeLabel(e),event:'🟥 Red Card',player:playerName(e.playerId)||'Unknown player'});return;
      }
      if(isSubOff(e)){
        rows.push({kind:'sub-off',team,time:sec,timeText:timeLabel(e),event:'← Substitution (OFF)',player:playerName(e.playerId)||'Unknown player'});return;
      }
      if(isSubOn(e)){
        rows.push({kind:'sub-on',team,time:sec,timeText:timeLabel(e),event:'Substitution (ON) →',player:playerName(e.playerId)||'Unknown player'});return;
      }
      if(isEnd(e)){
        const p=periodOf(e).toLowerCase();
        if(p.includes('first'))rows.push({kind:'half',team:'',time:sec,timeText:timeLabel(e),event:'Half-Time',player:'—'});
        else if(p.includes('second'))rows.push({kind:'full',team:'',time:sec,timeText:timeLabel(e),event:'Full-Time',player:'—'});
      }
    });
    const dedupe=new Map();
    for(const r of rows){const k=`${r.kind}|${r.team}|${r.time}|${r.player}`;if(!dedupe.has(k))dedupe.set(k,r);}
    const order={kickoff:0,half:1,goal:2,red:3,'sub-off':4,'sub-on':5,full:6};
    return [...dedupe.values()].sort((a,b)=>a.time-b.time||(order[a.kind]-order[b.kind]));
  }

  function clubIcon(team){
    if(!team)return '<span class="match-event__club-neutral"></span>';
    return `<img class="match-event__club" src="${logoPath(team)}" alt="${esc(team)} crest" onerror="this.style.visibility='hidden'">`;
  }

  function render(){
    if(typeof raw==='undefined'||!raw||typeof events==='undefined'||!Array.isArray(events)||!events.length){list.innerHTML='<div class="match-events-panel__empty">Loading match events…</div>';return;}
    const {lo,hi,max}=timeWindow();
    const rows=buildRows().filter(r=>r.time>=lo&&r.time<=hi);
    const home=raw.home?.name||'Home',away=raw.away?.name||'Away';
    scope.textContent=`${home} vs ${away} · ${Math.floor(lo/60)}:${String(Math.floor(lo%60)).padStart(2,'0')}–${hi>=max-.5?'FT':`${Math.floor(hi/60)}:${String(Math.floor(hi%60)).padStart(2,'0')}`}`;
    count.textContent=`${rows.length} event${rows.length===1?'':'s'}`;
    list.innerHTML=rows.length?rows.map(r=>`<div class="match-event-row match-event-row--${r.kind}">
      <div class="match-event__club-cell">${clubIcon(r.team)}</div>
      <div class="match-event__event">${esc(r.event)}</div>
      <time class="match-event__time">${esc(r.timeText)}</time>
      <div class="match-event__player">${esc(r.player)}</div>
    </div>`).join(''):'<div class="match-events-panel__empty">No key match events in this period.</div>';
  }

  [from,to].forEach(el=>{el.addEventListener('input',render);el.addEventListener('change',render)});
  document.addEventListener('pitchlab:match-loaded',()=>requestAnimationFrame(render));
  new MutationObserver(()=>requestAnimationFrame(render)).observe(eventCount,{childList:true,subtree:true,characterData:true});
  let tries=0;const timer=setInterval(()=>{tries++;render();if((typeof events!=='undefined'&&Array.isArray(events)&&events.length)||tries>50)clearInterval(timer);},100);
  render();
})();
