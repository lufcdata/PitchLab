(()=>{
  const $=id=>document.getElementById(id);
  const pitchPanel=document.querySelector('.pitch-panel');
  const from=$('fromRange'),to=$('toRange'),eventCount=$('eventCount');
  if(!pitchPanel||!from||!to||!eventCount||document.getElementById('matchStatsPanel'))return;

  const crestFor=name=>name==='Leeds'?'assets/club-logos/leeds%20png.png':name==='Bournemouth'?'assets/club-logos/Bournemouth.png':'';
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const evtSec=e=>Number(e?.minute||0)*60+Number(e?.second||0);
  const fmtSec=s=>{const t=Math.max(0,Math.round(s));return `${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`};
  const hasAny=(e,...qs)=>typeof hasQ==='function'&&hasQ(e,...qs);
  const safeFilter=(key,e)=>typeof FILTERS!=='undefined'&&typeof FILTERS[key]==='function'&&FILTERS[key](e);
  const isGoal=e=>typeof isShot==='function'&&isShot(e)&&(type(e)==='Goal'||hasAny(e,'Goal','OwnGoal'));
  const isBigChance=e=>typeof isShot==='function'&&isShot(e)&&hasAny(e,'BigChance');
  const isSetPieceChance=e=>safeFilter('chances_created',e)&&hasAny(e,'FromCorner','SetPiece','DirectFreekick','ThrowinSetPiece','CornerTaken','FreeKickTaken');
  const isInsideBox=e=>typeof isShot==='function'&&isShot(e)&&Number(e.x)>=((105-16.5)/105*100);
  const isOutsideBox=e=>typeof isShot==='function'&&isShot(e)&&!isInsideBox(e);
  const isFoul=e=>String(type(e)||'').toLowerCase()==='foul';
  const isRed=e=>String(type(e)||'').toLowerCase()==='card'&&hasAny(e,'Red','SecondYellow','SecondYellowRed');
  const isSavedShot=e=>['savedshot','save'].includes(String(type(e)||'').toLowerCase());

  const metricDefs=[
    ['Goals','goals'],['Possession','possession','pct'],['Touches','touches'],['Penalty Box Touches','touch_box'],
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
  pitchPanel.insertBefore(toolbar,pitchPanel.firstChild);

  const panel=document.createElement('section');
  panel.id='matchStatsPanel';panel.className='match-stats-panel';
  panel.innerHTML=`<div class="match-stats-panel__head"><div class="match-stats-panel__kicker">Match Stats</div><div id="matchStatsScore" class="match-stats-panel__score"></div><div id="matchStatsScope" class="match-stats-panel__scope"></div></div><div id="matchStatsBody" class="match-stats-panel__body"><div class="match-stats-panel__empty">Loading match stats…</div></div>`;
  pitchPanel.appendChild(panel);

  const toggle=$('pitchViewToggle');
  let statsView=false;

  function teams(){
    if(typeof raw==='undefined'||!raw)return ['Home','Away'];
    return [raw.home?.name||'Home',raw.away?.name||'Away'];
  }
  function windowEvents(){
    if(typeof events==='undefined'||!Array.isArray(events)||!events.length)return {list:[],lo:0,hi:0,max:90*60};
    const max=Math.max(90*60,...events.map(evtSec));
    let a=+from.value,b=+to.value;if(b<=a)b=Math.min(100,a+1);
    const lo=a/100*max,hi=b/100*max;
    return {list:events.filter(e=>evtSec(e)>=lo&&evtSec(e)<=hi),lo,hi,max};
  }
  function countByTeam(list,team,key){
    if(key==='shots_outside_custom')return list.filter(e=>teamName(e)===team&&isOutsideBox(e)).length;
    if(key==='shots_inside_custom')return list.filter(e=>teamName(e)===team&&isInsideBox(e)).length;
    if(key==='big_chances_custom')return list.filter(e=>teamName(e)===team&&isBigChance(e)).length;
    if(key==='big_chances_missed_custom')return list.filter(e=>teamName(e)===team&&isBigChance(e)&&!isGoal(e)).length;
    if(key==='set_piece_chances_custom')return list.filter(e=>teamName(e)===team&&isSetPieceChance(e)).length;
    if(key==='fouls_custom')return list.filter(e=>teamName(e)===team&&isFoul(e)).length;
    if(key==='red_cards_custom')return list.filter(e=>teamName(e)===team&&isRed(e)).length;
    return list.filter(e=>teamName(e)===team&&safeFilter(key,e)).length;
  }
  function valuePair(def,list,home,away){
    const [,key,kind]=def;
    if(key==='possession'){
      const hp=countByTeam(list,home,'allpasses'),ap=countByTeam(list,away,'allpasses'),total=hp+ap;
      return total?[hp/total*100,ap/total*100]:[0,0];
    }
    if(key==='pass_accuracy'){
      const ht=countByTeam(list,home,'allpasses'),at=countByTeam(list,away,'allpasses');
      const hs=countByTeam(list,home,'successful'),as=countByTeam(list,away,'successful');
      return [ht?hs/ht*100:0,at?as/at*100:0];
    }
    if(key==='fouled_custom')return [countByTeam(list,away,'fouls_custom'),countByTeam(list,home,'fouls_custom')];
    if(key==='saves_custom')return [list.filter(e=>teamName(e)===away&&isSavedShot(e)).length,list.filter(e=>teamName(e)===home&&isSavedShot(e)).length];
    return [countByTeam(list,home,key),countByTeam(list,away,key)];
  }
  function render(){
    if(!statsView)return;
    if(typeof raw==='undefined'||!raw||typeof events==='undefined'||!events.length){$('matchStatsBody').innerHTML='<div class="match-stats-panel__empty">Loading match stats…</div>';return}
    const [home,away]=teams();const {list,lo,hi,max}=windowEvents();
    const hg=countByTeam(list,home,'goals'),ag=countByTeam(list,away,'goals');
    const hc=crestFor(home),ac=crestFor(away);
    $('matchStatsScore').innerHTML=`<span class="match-stats-panel__team match-stats-panel__team--home">${home}${hc?`<img class="match-stats-panel__crest" src="${hc}" alt="${home} crest">`:''}</span><span class="match-stats-panel__scoreline"><b>${hg}</b><span class="match-stats-panel__dash">–</span><b>${ag}</b></span><span class="match-stats-panel__team match-stats-panel__team--away">${ac?`<img class="match-stats-panel__crest" src="${ac}" alt="${away} crest">`:''}${away}</span>`;
    $('matchStatsScope').innerHTML=`Both <i>|</i> <b>${lo<.5?'0:00':fmtSec(lo)} – ${hi>=max-.5?'FT':fmtSec(hi)}</b>`;
    $('matchStatsBody').innerHTML=metricDefs.map(def=>{
      const [label,,kind]=def;let [h,a]=valuePair(def,list,home,away);
      const denom=Math.max(h+a,1);const hp=kind==='pct'?Math.max(0,Math.min(100,h)):h/denom*100;const ap=kind==='pct'?Math.max(0,Math.min(100,a)):a/denom*100;
      const hv=kind==='pct'?Math.round(h):h,av=kind==='pct'?Math.round(a):a;
      return `<div class="match-stats-row${kind==='pct'?' is-percentage':''}"><div class="match-stats-row__track match-stats-row__track--home"><div class="match-stats-row__bar" style="width:${hp}%"></div></div><div class="match-stats-row__value match-stats-row__value--home">${hv}</div><div class="match-stats-row__label">${label}</div><div class="match-stats-row__value match-stats-row__value--away">${av}</div><div class="match-stats-row__track"><div class="match-stats-row__bar" style="width:${ap}%"></div></div></div>`;
    }).join('');
  }
  function setView(on){statsView=on;pitchPanel.classList.toggle('is-match-stats-view',on);toggle.textContent=on?'Pitch Map':'Match Stats';toggle.setAttribute('aria-pressed',String(on));if(on)render()}
  toggle.addEventListener('click',()=>setView(!statsView));
  const observer=new MutationObserver(()=>render());observer.observe(eventCount,{childList:true,characterData:true,subtree:true});
  [from,to].forEach(el=>{el.addEventListener('input',render);el.addEventListener('change',render)});
})();
