(()=>{
  const $=id=>document.getElementById(id);
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const eventType=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').toLowerCase().replace(/[\s_-]/g,'');
  const outcome=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const evtSec=e=>Number(e?.minute||0)*60+Number(e?.second||0);
  const teamNameOf=e=>typeof teamName==='function'?teamName(e):'';

  // GOLDEN v1 — validated against WS_1983552: Nottingham Forest 6 / Leeds 7.
  // Key rules:
  // 1) Count team pass attempts inside a continuous sequence; 10+ qualifies.
  // 2) An incomplete administrative OffsideGiven record (no second) is not a hard boundary.
  // 3) An unsuccessful pass may remain inside the same sequence only when the same team
  //    resumes with the next pass within 5 seconds and the intervening event is defensive
  //    noise rather than established opposition control.
  // 4) Genuine stoppages, opposition controlled possession and period boundaries close it.
  const HARD_END=new Set(['foul','cornerawarded','savedshot','missedshots','shotonpost','goal','tackle','interception','end','start']);
  const DEFENSIVE_NOISE=new Set(['clearance','blockedpass','challenge','aerial']);
  const OPP_CONTROL=new Set(['ballrecovery','balltouch','takeon','keeperpickup','smother','interception','tackle']);

  function canContinueAfterUnsuccessful(ordered,i,activeTeam){
    const start=evtSec(ordered[i]);
    for(let j=i+1;j<ordered.length&&j<i+12;j++){
      const n=ordered[j],t=eventType(n),tm=teamNameOf(n),dt=evtSec(n)-start;
      if(dt>5)return false;
      if(t==='offsidegiven'&&(n.second==null||n.second===''))continue;
      if(t==='pass')return tm===activeTeam;
      if(DEFENSIVE_NOISE.has(t))continue;
      if(HARD_END.has(t))return false;
      if(tm&&tm!==activeTeam&&OPP_CONTROL.has(t)&&outcome(n)!=='unsuccessful')return false;
    }
    return false;
  }

  function tenPassSequences(list,team){
    const ordered=[...(list||[])].sort((a,b)=>evtSec(a)-evtSec(b)||(Number(a.eventId)||0)-(Number(b.eventId)||0));
    let activeTeam='',passes=0,count=0;
    const close=()=>{if(activeTeam===team&&passes>=10)count++;activeTeam='';passes=0;};
    for(let i=0;i<ordered.length;i++){
      const e=ordered[i],t=eventType(e),tm=teamNameOf(e);
      if(t==='offsidegiven'){
        if(e.second==null||e.second==='')continue;
        close();continue;
      }
      if(HARD_END.has(t)){close();continue;}
      if(t!=='pass')continue;
      if(tm!==activeTeam){close();activeTeam=tm;passes=0;}
      passes++;
      if(outcome(e)==='unsuccessful'&&!canContinueAfterUnsuccessful(ordered,i,activeTeam))close();
    }
    close();
    return count;
  }

  function windowEvents(){
    if(typeof events==='undefined'||!Array.isArray(events)||!events.length)return [];
    const from=$('fromRange'),to=$('toRange');
    if(!from||!to)return events;
    const max=Math.max(90*60,...events.map(evtSec));
    let a=Number(from.value||0),b=Number(to.value||100);if(b<=a)b=Math.min(100,a+1);
    const lo=a/100*max,hi=b/100*max;
    return events.filter(e=>evtSec(e)>=lo&&evtSec(e)<=hi);
  }

  function patchMatchStats(){
    if(typeof raw==='undefined'||!raw)return;
    const body=$('matchStatsBody');if(!body)return;
    const row=[...body.querySelectorAll('.match-stats-row')].find(r=>r.querySelector('.match-stats-row__label')?.textContent.trim()==='10+ Pass Sequences');
    if(!row)return;
    const list=windowEvents(),home=raw.home?.name||'Home',away=raw.away?.name||'Away';
    const h=tenPassSequences(list,home),a=tenPassSequences(list,away);
    const hv=row.querySelector('.match-stats-row__value--home'),av=row.querySelector('.match-stats-row__value--away');
    if(hv)hv.textContent=String(h);if(av)av.textContent=String(a);
    const denom=Math.max(h+a,1),tracks=row.querySelectorAll('.match-stats-row__bar');
    if(tracks[0])tracks[0].style.width=`${h/denom*100}%`;
    if(tracks[1])tracks[1].style.width=`${a/denom*100}%`;
  }

  window.PitchLabSequences={version:'10-pass-golden-v1',tenPassSequences};
  const body=$('matchStatsBody');if(body)new MutationObserver(()=>requestAnimationFrame(patchMatchStats)).observe(body,{childList:true,subtree:true});
  [$('fromRange'),$('toRange')].filter(Boolean).forEach(el=>{el.addEventListener('input',()=>requestAnimationFrame(patchMatchStats));el.addEventListener('change',()=>requestAnimationFrame(patchMatchStats));});
  document.addEventListener('pitchlab:match-loaded',()=>requestAnimationFrame(patchMatchStats));
  let tries=0;const timer=setInterval(()=>{tries++;patchMatchStats();if(tries>60)clearInterval(timer);},100);
})();
