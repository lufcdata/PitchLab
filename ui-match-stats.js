(()=>{
  const $=id=>document.getElementById(id);
  const pitchPanel=document.querySelector('.pitch-panel');
  const pageHead=document.querySelector('.page-head');
  const from=$('fromRange'),to=$('toRange'),eventCount=$('eventCount');
  if(!pitchPanel||!from||!to||!eventCount||document.getElementById('matchStatsPanel'))return;

  const crestFor=name=>name==='Leeds'?'assets/club-logos/leeds%20png.png':name==='Bournemouth'?'assets/club-logos/Bournemouth.png':'';
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const localEvtSec=e=>Number(e?.minute||0)*60+Number(e?.second||0);
  const evtSec=e=>window.PitchLabCanonicalTime?.timelineSecond?.(e)??localEvtSec(e);
  const fmtSec=s=>{const t=Math.max(0,Math.round(s));return `${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`};
  const hasAny=(e,...qs)=>typeof hasQ==='function'&&hasQ(e,...qs);
  const safeFilter=(key,e)=>typeof FILTERS!=='undefined'&&typeof FILTERS[key]==='function'&&FILTERS[key](e);
  const eventType=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').toLowerCase().replace(/[\s_-]/g,'');
  const outcome=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const isOwnGoal=e=>hasAny(e,'OwnGoal')||eventType(e)==='owngoal';
  const isScoreGoal=e=>eventType(e)==='goal'||eventType(e)==='owngoal'||hasAny(e,'OwnGoal');
  const isGoal=e=>isScoreGoal(e);
  const isBigChance=e=>typeof isShot==='function'&&isShot(e)&&hasAny(e,'BigChance');
  const isSetPieceChance=e=>safeFilter('chances_created',e)&&hasAny(e,'FromCorner','SetPiece','DirectFreekick','ThrowinSetPiece','CornerTaken','FreeKickTaken');
  const isInsideBox=e=>typeof isShot==='function'&&isShot(e)&&Number(e.x)>=((105-16.5)/105*100);
  const isOutsideBox=e=>typeof isShot==='function'&&isShot(e)&&!isInsideBox(e);
  const isFoul=e=>eventType(e)==='foul';
  const isRed=e=>eventType(e)==='card'&&hasAny(e,'Red','SecondYellow','SecondYellowRed');
  const isSavedShot=e=>['savedshot','save'].includes(eventType(e));

  const metricDefs=[
    ['Goals','goals_adjusted'],['Own Goals','own_goals_custom'],['Possession','possession','pct'],['PPDA','ppda_custom','decimal'],['10+ Pass Sequences','ten_pass_sequences_custom'],['Pressed Sequences','pressed_sequences_custom'],
    ['Carries','carries_custom'],['Carrying Distance (m)','carrying_distance_custom','decimal'],['Avg Carrying Distance (m)','avg_carrying_distance_custom','decimal'],['Progressive Carries','progressive_carries_custom'],['Progressive Carrying Distance (m)','progressive_carrying_distance_custom','decimal'],['Avg Progressive Carrying Distance (m)','avg_progressive_carrying_distance_custom','decimal'],
    ['Touches','touches'],['Penalty Box Touches','touch_box'],
    ['Shots','shots'],['Shots On-Target','shots_on'],['Shots Outside Box','shots_outside_custom'],['Shots Inside The Box','shots_inside_custom'],
    ['Big Chances','big_chances_custom'],['Big Chances Created','bigchances'],['Big Chances Missed','big_chances_missed_custom'],['Chances Created','chances_created'],
    ['Successful Passes','successful'],['Total Passes','allpasses'],['Open Play Progressive Passes','progressive'],['Successful Final Third Passes','final_third_passes_success'],
    ['Passes Into Final Third','into_final_third'],['Forward Passes','forward'],['Backward Passes','backward'],['Pass Accuracy','pass_accuracy','pct'],
    ['Accurate Long Passes','accurate_long_passes'],['Chance Created From Set-Pieces','set_piece_chances_custom'],['Free-Kicks','free_kicks'],
    ['Accurate Crosses','accurate_crosses'],['Accurate Open Play Crosses','accurate_open_play_crosses'],['Duels Won','duels_won'],['Ground Duels Won','ground_duels_won'],
    ['Aerial Duels Won','aerial_duels_won'],['Ball Recoveries','recoveries'],['Successful Take-Ons','takeons_success'],['Tackles Won','tackles_won'],
    ['Interceptions','interceptions'],['Clearances','clearances'],['Headed Clearances','headed_clearances'],['Fouls','fouls_custom'],['Fouled','fouled_custom'],
    ['Corners','corners'],['Saves','saves_custom'],['Red Cards','red_cards_custom']
  ];

  const toolbar=document.createElement('div');
  toolbar.className='pitch-view-toggle';
  toolbar.innerHTML='<button id="pitchViewToggle" class="pitch-view-toggle__button" type="button" aria-pressed="false">Match Stats</button>';
  const headingLeft=pageHead?.firstElementChild;
  const sub=headingLeft?.querySelector('.sub');
  if(headingLeft&&sub){const row=document.createElement('div');row.className='pitch-view-heading-row';sub.parentNode.insertBefore(row,sub);row.appendChild(sub);row.appendChild(toolbar)}else pitchPanel.parentNode.insertBefore(toolbar,pitchPanel);

  const panel=document.createElement('section');
  panel.id='matchStatsPanel';panel.className='match-stats-panel';
  panel.innerHTML=`<div class="match-stats-panel__head"><div class="match-stats-panel__kicker">Match Stats</div><div id="matchStatsScore" class="match-stats-panel__score"></div><div id="matchStatsScope" class="match-stats-panel__scope"></div></div><div id="matchStatsBody" class="match-stats-panel__body"><div class="match-stats-panel__empty">Loading match stats…</div></div>`;
  pitchPanel.appendChild(panel);
  const toggle=$('pitchViewToggle');let statsView=false;

  function teams(){if(typeof raw==='undefined'||!raw)return ['Home','Away'];return [raw.home?.name||'Home',raw.away?.name||'Away']}
  function windowEvents(){
    const canonical=window.PitchLabCanonicalTime;
    if(canonical?.windowEvents&&canonical?.bounds){const b=canonical.bounds();return {list:canonical.windowEvents(events),...b}}
    if(typeof events==='undefined'||!Array.isArray(events)||!events.length)return {list:[],lo:0,hi:0,max:90*60};
    const max=Math.max(90*60,...events.map(localEvtSec));let a=+from.value,b=+to.value;if(b<=a)b=Math.min(100,a+1);const lo=a/100*max,hi=b/100*max;return {list:events.filter(e=>localEvtSec(e)>=lo&&localEvtSec(e)<=hi),lo,hi,max}
  }
  function opposition(team,home,away){return team===home?away:team===away?home:''}
  function creditedGoalTeam(e,home,away){const eventTeam=teamName(e);return isOwnGoal(e)?opposition(eventTeam,home,away):eventTeam}
  function adjustedGoals(list,team,home,away){return list.filter(e=>isScoreGoal(e)&&creditedGoalTeam(e,home,away)===team).length}
  function ownGoalsCommitted(list,team){return list.filter(e=>teamName(e)===team&&isOwnGoal(e)).length}

  // LOCKED GOLDEN: WS_1983552 => Nottingham Forest 12.9 / Leeds 8.8.
  function ppda(list,team,home,away){
    const opp=opposition(team,home,away);
    const passes=list.filter(e=>teamName(e)===opp&&eventType(e)==='pass'&&Number(e.x)<=60).length;
    const actions=list.filter(e=>{if(teamName(e)!==team||Number(e.x)<40)return false;const t=eventType(e);if(t==='tackle'||t==='challenge'||t==='interception'||t==='blockedpass')return true;return t==='foul'&&outcome(e)==='unsuccessful';}).length;
    return actions?passes/actions:0;
  }

  // LOCKED GOLDEN: WS_1983552 => Nottingham Forest 6 / Leeds 7.
  function tenPassSequences(ordered,team){
    const hardEnd=new Set(['foul','offsidegiven','cornerawarded','savedshot','missedshots','shotonpost','goal','tackle','interception','end','start']);let activeTeam='',passes=0,count=0;
    const close=()=>{if(activeTeam===team&&passes>=10)count++;activeTeam='';passes=0};
    for(const e of ordered){const t=eventType(e),etm=teamName(e);if(hardEnd.has(t)){close();continue}if(t!=='pass')continue;if(etm!==activeTeam){close();activeTeam=etm;passes=0}passes++;if(outcome(e)==='unsuccessful')close();}close();return count;
  }

  // LOCKED GOLDEN: WS_1983552 => Nottingham Forest 2 / Leeds 16.
  function pressedSequences(ordered,pressingTeam,home,away){
    const attackingTeam=opposition(pressingTeam,home,away);
    const startTypes=new Set(['pass','ballrecovery','balltouch','takeon']);const stopTypes=new Set(['foul','offsidegiven','cornerawarded','savedshot','missedshots','shotonpost','goal','tackle','interception','end','start']);
    const restartQ=e=>hasAny(e,'CornerTaken','FreeKickTaken','ThrowIn','ThrowinSetPiece','GoalKick','SetPiece','DirectFreekick');const controlled=e=>teamName(e)===attackingTeam&&startTypes.has(eventType(e))&&outcome(e)!=='unsuccessful';
    const contestedTouch=(idx,e)=>{if(eventType(e)!=='balltouch')return false;const s=evtSec(e);for(let j=Math.max(0,idx-3);j<Math.min(ordered.length,idx+4);j++){if(j===idx)continue;const o=ordered[j];if(evtSec(o)===s&&eventType(o)==='balltouch'&&teamName(o)&&teamName(o)!==attackingTeam)return true;}return false;};
    const END_X=40/105*100;let count=0,i=0;
    while(i<ordered.length){const e=ordered[i];if(!controlled(e)||Number(e.x)>33.333333||restartQ(e)||contestedTouch(i,e)){i++;continue}let passes=0,lastX=Number(e.x),qualifies=true,j=i;for(;j<ordered.length;j++){const q=ordered[j],qt=eventType(q),qTeam=teamName(q);if(j>i&&restartQ(q)){qualifies=false;break}if(qTeam===attackingTeam&&Number.isFinite(Number(q.x)))lastX=Number(q.x);if(qTeam===attackingTeam&&qt==='pass'){passes++;if(passes>3){qualifies=false;break}if(outcome(q)==='unsuccessful'){if(Number.isFinite(Number(q.endX)))lastX=Number(q.endX);break}}if(j>i&&stopTypes.has(qt))break;if(j>i&&qTeam&&qTeam!==attackingTeam&&startTypes.has(qt)&&outcome(q)!=='unsuccessful')break;}if(qualifies&&passes<=3&&Number.isFinite(lastX)&&lastX<=END_X)count++;i=Math.max(i+1,j+1);}return count;
  }

  // LOCKED GOLDEN CARRY FAMILY: see docs/CARRY_FAMILY_GOLDEN.md.
  function carrySummary(list,team){const empty={carries:0,carryingDistanceM:0,avgCarryingDistanceM:0,progressiveCarries:0,progressiveCarryingDistanceM:0,avgProgressiveCarryingDistanceM:0};if(!window.PitchLabCarry)return empty;const teamEvent=list.find(e=>teamName(e)===team&&e.teamId!=null);if(!teamEvent)return empty;return window.PitchLabCarry.teamSummary(list,teamEvent.teamId);}

  let renderTeamEventsCache=null,renderMetricCountCache=null;
  function teamEvents(list,team){return renderTeamEventsCache?.get(team)??list.filter(e=>teamName(e)===team)}
  function countByTeam(list,team,key,home,away){
    const cacheKey=`${team}\u0000${key}`;
    if(renderMetricCountCache?.has(cacheKey))return renderMetricCountCache.get(cacheKey);
    const teamList=teamEvents(list,team);let value;
    if(key==='goals_adjusted')value=adjustedGoals(list,team,home,away);else if(key==='own_goals_custom')value=teamList.filter(e=>isOwnGoal(e)).length;else if(key==='shots_outside_custom')value=teamList.filter(isOutsideBox).length;else if(key==='shots_inside_custom')value=teamList.filter(isInsideBox).length;else if(key==='big_chances_custom')value=teamList.filter(isBigChance).length;else if(key==='big_chances_missed_custom')value=teamList.filter(e=>isBigChance(e)&&!isGoal(e)).length;else if(key==='set_piece_chances_custom')value=teamList.filter(isSetPieceChance).length;else if(key==='fouls_custom')value=teamList.filter(isFoul).length;else if(key==='red_cards_custom')value=teamList.filter(isRed).length;else value=teamList.filter(e=>safeFilter(key,e)).length;
    renderMetricCountCache?.set(cacheKey,value);return value;
  }
  let renderCarryCache=null,renderOrderedCache=null;
  function valuePair(def,list,home,away){
    const [,key]=def;if(key==='ppda_custom')return [ppda(list,home,home,away),ppda(list,away,home,away)];if(key==='ten_pass_sequences_custom')return [tenPassSequences(renderOrderedCache,home),tenPassSequences(renderOrderedCache,away)];if(key==='pressed_sequences_custom')return [pressedSequences(renderOrderedCache,home,home,away),pressedSequences(renderOrderedCache,away,home,away)];
    const carryMetric=key.startsWith('carries_custom')||key.includes('carrying_distance_custom')||key.includes('progressive_carries_custom');
    const hc=carryMetric?(renderCarryCache?.home??carrySummary(list,home)):null,ac=carryMetric?(renderCarryCache?.away??carrySummary(list,away)):null;
    if(key==='carries_custom')return [hc.carries,ac.carries];if(key==='carrying_distance_custom')return [hc.carryingDistanceM,ac.carryingDistanceM];if(key==='avg_carrying_distance_custom')return [hc.avgCarryingDistanceM,ac.avgCarryingDistanceM];if(key==='progressive_carries_custom')return [hc.progressiveCarries,ac.progressiveCarries];if(key==='progressive_carrying_distance_custom')return [hc.progressiveCarryingDistanceM,ac.progressiveCarryingDistanceM];if(key==='avg_progressive_carrying_distance_custom')return [hc.avgProgressiveCarryingDistanceM,ac.avgProgressiveCarryingDistanceM];
    if(key==='possession'){const hp=countByTeam(list,home,'allpasses',home,away),ap=countByTeam(list,away,'allpasses',home,away),total=hp+ap;return total?[hp/total*100,ap/total*100]:[0,0]}if(key==='pass_accuracy'){const ht=countByTeam(list,home,'allpasses',home,away),at=countByTeam(list,away,'allpasses',home,away);const hs=countByTeam(list,home,'successful',home,away),as=countByTeam(list,away,'successful',home,away);return [ht?hs/ht*100:0,at?as/at*100:0]}if(key==='fouled_custom')return [countByTeam(list,away,'fouls_custom',home,away),countByTeam(list,home,'fouls_custom',home,away)];if(key==='saves_custom')return [teamEvents(list,away).filter(isSavedShot).length,teamEvents(list,home).filter(isSavedShot).length];return [countByTeam(list,home,key,home,away),countByTeam(list,away,key,home,away)];
  }
  function render(){
    if(!statsView)return;if(typeof raw==='undefined'||!raw||typeof events==='undefined'||!events.length){$('matchStatsBody').innerHTML='<div class="match-stats-panel__empty">Loading match stats…</div>';return}
    const [home,away]=teams();const {list,lo,hi,max}=windowEvents();const hg=adjustedGoals(list,home,home,away),ag=adjustedGoals(list,away,home,away);const hc=crestFor(home),ac=crestFor(away);const canonical=window.PitchLabCanonicalTime;const loLabel=lo<.5?'0:00':(canonical?.formatClock?canonical.formatClock(lo):fmtSec(lo));const hiLabel=hi>=max-.5?'FT':(canonical?.formatClock?canonical.formatClock(hi):fmtSec(hi));
    renderTeamEventsCache=new Map([[home,[]],[away,[]]]);for(const e of list){const bucket=renderTeamEventsCache.get(teamName(e));if(bucket)bucket.push(e);}
    renderMetricCountCache=new Map();
    renderCarryCache={home:carrySummary(list,home),away:carrySummary(list,away)};
    renderOrderedCache=[...list].sort((a,b)=>evtSec(a)-evtSec(b)||(Number(a.eventId)||0)-(Number(b.eventId)||0));
    $('matchStatsScore').innerHTML=`<span class="match-stats-panel__team match-stats-panel__team--home">${home}${hc?`<img class="match-stats-panel__crest" src="${hc}" alt="${home} crest">`:''}</span><span class="match-stats-panel__scoreline"><b>${hg}</b><span class="match-stats-panel__dash">–</span><b>${ag}</b></span><span class="match-stats-panel__team match-stats-panel__team--away">${ac?`<img class="match-stats-panel__crest" src="${ac}" alt="${away} crest">`:''}${away}</span>`;
    $('matchStatsScope').innerHTML=`Both <i>|</i> <b>${loLabel} – ${hiLabel}</b>`;
    $('matchStatsBody').innerHTML=metricDefs.map(def=>{const [label,,kind]=def;let [h,a]=valuePair(def,list,home,away);const denom=Math.max(Math.abs(h)+Math.abs(a),1);const hp=kind==='pct'?Math.max(0,Math.min(100,h)):Math.abs(h)/denom*100;const ap=kind==='pct'?Math.max(0,Math.min(100,a)):Math.abs(a)/denom*100;const hv=kind==='pct'?Math.round(h):kind==='decimal'?h.toFixed(1):h,av=kind==='pct'?Math.round(a):kind==='decimal'?a.toFixed(1):a;return `<div class="match-stats-row${kind==='pct'?' is-percentage':''}"><div class="match-stats-row__track match-stats-row__track--home"><div class="match-stats-row__bar" style="width:${hp}%"></div></div><div class="match-stats-row__value match-stats-row__value--home">${hv}</div><div class="match-stats-row__label">${label}</div><div class="match-stats-row__value match-stats-row__value--away">${av}</div><div class="match-stats-row__track"><div class="match-stats-row__bar" style="width:${ap}%"></div></div></div>`;}).join('');
    renderTeamEventsCache=null;renderMetricCountCache=null;renderCarryCache=null;renderOrderedCache=null;
  }
  let renderFrame=0;
  function scheduleRender(){if(renderFrame)return;renderFrame=requestAnimationFrame(()=>{renderFrame=0;render();});}
  function setView(on){statsView=on;pitchPanel.classList.toggle('is-match-stats-view',on);toggle.textContent=on?'Pitch Map':'Match Stats';toggle.setAttribute('aria-pressed',String(on));if(on)scheduleRender()}
  toggle.addEventListener('click',()=>setView(!statsView));const observer=new MutationObserver(scheduleRender);observer.observe(eventCount,{childList:true,characterData:true,subtree:true});[from,to].forEach(el=>{el.addEventListener('input',scheduleRender);el.addEventListener('change',scheduleRender)});document.addEventListener('pitchlab:canonical-time-ready',scheduleRender);document.addEventListener('pitchlab:match-loaded',scheduleRender);
})();