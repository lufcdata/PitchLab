(()=>{
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const eventType=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const outcome=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const success=e=>outcome(e)!=='unsuccessful';
  const has=(e,...qs)=>typeof hasQ==='function'&&hasQ(e,...qs);
  const sec=e=>Number(e?.minute||0)*60+Number(e?.second||0);
  const HIGH_X=(65/105)*100;
  const SHOTS=new Set(['goal','missedshots','savedshot','shotonpost']);

  const restart=e=>has(e,'CornerTaken','ThrowIn','GoalKick','GoalKickTaken','FreekickTaken','FreeKickTaken','PenaltyTaken','KickOff')||['start','end','cornerawarded'].includes(eventType(e));
  const isAerialFoul=e=>eventType(e)==='foul'&&has(e,'AerialFoul');
  const isGroundDuelWon=e=>eventType(e)==='tackle'||(eventType(e)==='takeon'&&success(e))||(eventType(e)==='foul'&&success(e)&&!has(e,'AerialFoul'));
  const isAerialDuelWon=e=>(eventType(e)==='aerial'&&success(e))||(eventType(e)==='foul'&&success(e)&&has(e,'AerialFoul'));
  const isRecovery=e=>['ballrecovery','keeperpickup','claim'].includes(eventType(e));
  const isFoulCommitted=e=>eventType(e)==='foul'&&outcome(e)==='unsuccessful';
  const isFinalThirdEntry=e=>eventType(e)==='pass'&&Number(e?.x)<(200/3)&&Number(e?.endX)>=(200/3);

  if(typeof FILTERS!=='undefined'){
    FILTERS.recoveries=isRecovery;
    FILTERS.tackles_won=e=>eventType(e)==='tackle';
    FILTERS.ground_duels_won=isGroundDuelWon;
    FILTERS.aerial_duels_won=isAerialDuelWon;
    FILTERS.duels_won=e=>isGroundDuelWon(e)||isAerialDuelWon(e);
    FILTERS.into_final_third=isFinalThirdEntry;
    FILTERS.high_turnovers=()=>false;
  }

  function ordered(source){return [...(Array.isArray(source)?source:[])].sort((a,b)=>sec(a)-sec(b)||(Number(a?.eventId)||0)-(Number(b?.eventId)||0));}
  function sameSecondPairedDispossessed(arr,i,e){
    const tm=String(e?.teamId);
    for(let j=Math.max(0,i-2);j<Math.min(arr.length,i+3);j++){
      const q=arr[j];
      if(sec(q)===sec(e)&&String(q?.teamId)!==tm&&eventType(q)==='dispossessed')return true;
    }
    return false;
  }
  function followControl(arr,i,e,maxS=4){
    const tm=String(e?.teamId),t0=sec(e);
    for(let k=i+1;k<arr.length;k++){
      const q=arr[k],dt=sec(q)-t0;if(dt>maxS)break;
      if(restart(q))return false;
      if(String(q?.teamId)===tm&&['pass','ballrecovery','takeon'].includes(eventType(q)))return true;
      if(String(q?.teamId)!==tm&&success(q)&&['pass','ballrecovery','takeon'].includes(eventType(q)))return false;
    }
    return false;
  }
  function establishes(arr,i,e){
    if(restart(e))return false;
    const t=eventType(e);
    if(['pass','ballrecovery','keeperpickup','claim','takeon'].includes(t))return success(e);
    if(t==='tackle')return success(e)&&(sameSecondPairedDispossessed(arr,i,e)||followControl(arr,i,e));
    if(t==='interception')return success(e)&&followControl(arr,i,e);
    return false;
  }
  function highTurnoverStarts(source){
    const arr=ordered(source);let current=null,afterRestart=false;const starts=[];
    for(let i=0;i<arr.length;i++){
      const e=arr[i],tm=String(e?.teamId??'');
      if(restart(e)){
        current=(eventType(e)==='pass'&&success(e))?tm:null;afterRestart=true;continue;
      }
      if(eventType(e)==='tackle'&&success(e)&&sameSecondPairedDispossessed(arr,i,e)){
        if(followControl(arr,i,e)&&Number(e?.x)>=HIGH_X&&!afterRestart)starts.push({index:i,event:e});
        current=tm;afterRestart=false;continue;
      }
      if(establishes(arr,i,e)){
        if(current&&tm!==current&&!afterRestart&&Number(e?.x)>=HIGH_X)starts.push({index:i,event:e});
        current=tm;
      }
      if(current&&tm===current)afterRestart=false;
    }
    return {arr,starts};
  }
  function shotEnds(arr,start){
    const tm=String(start.event?.teamId);
    for(let k=start.index+1;k<arr.length;k++){
      const q=arr[k],qt=eventType(q);
      if(restart(q)||qt==='foul')return false;
      if(String(q?.teamId)===tm&&SHOTS.has(qt))return true;
      if(String(q?.teamId)!==tm&&success(q)&&['blockedpass','tackle','interception'].includes(qt))return false;
      if(String(q?.teamId)!==tm&&establishes(arr,k,q))return false;
    }
    return false;
  }
  function turnoverSummary(source,teamId){
    const {arr,starts}=highTurnoverStarts(source);
    const mine=starts.filter(s=>String(s.event?.teamId)===String(teamId));
    return {highTurnovers:mine.length,shotEndingHighTurnovers:mine.filter(s=>shotEnds(arr,s)).length,starts:mine.map(s=>s.event)};
  }

  window.PitchLabGoldenV2={
    version:'FOREST_LEEDS_GOLDEN_V2_2026-08-27',
    definitions:{
      ballRecoveries:'BallRecovery + KeeperPickup + Claim',
      tacklesWon:'All Tackle events',
      groundDuelsWon:'Tackle + successful TakeOn + successful Foul excluding AerialFoul',
      aerialDuelsWon:'successful Aerial + successful Foul with AerialFoul',
      foulsCommitted:'Unsuccessful Foul events',
      finalThirdEntries:'Pass events crossing x < 66.67 to endX >= 66.67',
      highTurnovers:'Open-play controlled possession switches beginning x >= 61.9048; possession-state based, not raw recovery count',
      shotEndingHighTurnovers:'High-turnover sequence reaches a shot before restart, foul, opponent controlled possession or successful defensive sequence-break action'
    },
    isRecovery,isGroundDuelWon,isAerialDuelWon,isFoulCommitted,isFinalThirdEntry,highTurnoverStarts,turnoverSummary,
    forestLeedsControls:{full:{recoveries:[47,43],groundDuelsWon:[31,41],aerialDuelsWon:[30,25],tacklesWon:[8,19],fouls:[15,14],finalThirdEntries:[60,63],highTurnovers:[4,8],shotEndingHighTurnovers:[1,1]},firstHalf:{recoveries:[23,24],finalThirdEntries:[24,37]}}
  };

  function teamNames(){if(typeof raw==='undefined'||!raw)return [];return [raw.home?.name,raw.away?.name];}
  function windowEvents(){
    if(typeof events==='undefined'||!Array.isArray(events))return [];
    const f=document.getElementById('fromRange'),t=document.getElementById('toRange');if(!f||!t)return events;
    const max=Math.max(90*60,...events.map(sec));let a=+f.value,b=+t.value;if(b<=a)b=Math.min(100,a+1);
    const lo=a/100*max,hi=b/100*max;return events.filter(e=>sec(e)>=lo&&sec(e)<=hi);
  }
  function metricCounts(list,team){
    const mine=e=>typeof teamName==='function'&&teamName(e)===team;
    return {
      'Ball Recoveries':list.filter(e=>mine(e)&&isRecovery(e)).length,
      'Tackles Won':list.filter(e=>mine(e)&&eventType(e)==='tackle').length,
      'Ground Duels Won':list.filter(e=>mine(e)&&isGroundDuelWon(e)).length,
      'Aerial Duels Won':list.filter(e=>mine(e)&&isAerialDuelWon(e)).length,
      'Duels Won':list.filter(e=>mine(e)&&(isGroundDuelWon(e)||isAerialDuelWon(e))).length,
      'Fouls':list.filter(e=>mine(e)&&isFoulCommitted(e)).length,
      'Final Third Entries':list.filter(e=>mine(e)&&isFinalThirdEntry(e)).length
    };
  }
  function rowHTML(label,h,a){
    const d=Math.max(Math.abs(h)+Math.abs(a),1),hp=Math.abs(h)/d*100,ap=Math.abs(a)/d*100;
    return `<div class="match-stats-row" data-golden-v2="${label}"><div class="match-stats-row__track match-stats-row__track--home"><div class="match-stats-row__bar" style="width:${hp}%"></div></div><div class="match-stats-row__value match-stats-row__value--home">${h}</div><div class="match-stats-row__label">${label}</div><div class="match-stats-row__value match-stats-row__value--away">${a}</div><div class="match-stats-row__track"><div class="match-stats-row__bar" style="width:${ap}%"></div></div></div>`;
  }
  let patching=false;
  function patchMatchStats(){
    if(patching)return;const body=document.getElementById('matchStatsBody');if(!body||!body.querySelector('.match-stats-row'))return;
    const [home,away]=teamNames();if(!home||!away)return;const list=windowEvents(),hc=metricCounts(list,home),ac=metricCounts(list,away);
    patching=true;
    try{
      [...body.querySelectorAll('.match-stats-row')].forEach(row=>{
        const label=row.querySelector('.match-stats-row__label')?.textContent?.trim();
        let target=label;if(label==='Passes Into Final Third'){target='Final Third Entries';row.querySelector('.match-stats-row__label').textContent=target;}
        if(hc[target]===undefined)return;
        const h=hc[target],a=ac[target],d=Math.max(h+a,1);
        const hv=row.querySelector('.match-stats-row__value--home'),av=row.querySelector('.match-stats-row__value--away');if(hv)hv.textContent=h;if(av)av.textContent=a;
        const bars=row.querySelectorAll('.match-stats-row__bar');if(bars[0])bars[0].style.width=`${h/d*100}%`;if(bars[1])bars[1].style.width=`${a/d*100}%`;
      });
      body.querySelectorAll('[data-golden-v2]').forEach(x=>x.remove());
      const homeEvent=list.find(e=>typeof teamName==='function'&&teamName(e)===home&&e.teamId!=null),awayEvent=list.find(e=>typeof teamName==='function'&&teamName(e)===away&&e.teamId!=null);
      if(homeEvent&&awayEvent){
        const h=turnoverSummary(list,homeEvent.teamId),a=turnoverSummary(list,awayEvent.teamId);
        const marker=[...body.querySelectorAll('.match-stats-row')].find(r=>r.querySelector('.match-stats-row__label')?.textContent?.trim()==='10+ Pass Sequences');
        const holder=document.createElement('div');holder.innerHTML=rowHTML('High Turnovers',h.highTurnovers,a.highTurnovers)+rowHTML('Shot-Ending High Turnovers',h.shotEndingHighTurnovers,a.shotEndingHighTurnovers);
        const nodes=[...holder.children];if(marker){let ref=marker;for(const n of nodes){ref.insertAdjacentElement('afterend',n);ref=n;}}else nodes.forEach(n=>body.appendChild(n));
      }
    }finally{patching=false;}
  }
  const obs=new MutationObserver(()=>queueMicrotask(patchMatchStats));
  obs.observe(document.documentElement,{childList:true,subtree:true});
  ['fromRange','toRange','periodPreset','team'].forEach(id=>document.getElementById(id)?.addEventListener('input',()=>queueMicrotask(patchMatchStats)));
  queueMicrotask(patchMatchStats);
})();