(()=>{
  const $=id=>document.getElementById(id);
  const FOREST_SHIRTS={
    '78386':26,'443545':23,'445424':5,'319785':31,'315543':34,'386969':3,'425576':24,'328075':6,'398414':14,'332867':10,'397497':11,'262856':21,'384005':15,'394888':25,'73380':9,'334653':8,'318689':12,'454750':44,'350088':7,'443663':2,
    '404852':1,'360941':15,'439533':5,'302312':6,'354291':2,'301441':24,'401073':18,'322418':4,'371012':11,'333044':10,'141469':9,'376090':19,'342811':8,'307564':23,'347340':14,'423347':22,'243534':30,'302313':7,'622195':65,'622692':50
  };

  const logoPath=name=>{
    const n=String(name||'').trim();
    if(!n)return '';
    if(n==='Leeds')return 'assets/club-logos/leeds%20png.png';
    return `assets/club-logos/${encodeURIComponent(n)}.png`;
  };
  const teamOfPlayer=id=>{
    if(typeof events==='undefined'||!Array.isArray(events))return '';
    const e=events.find(x=>String(x?.playerId)===String(id));
    return e&&typeof teamName==='function'?teamName(e):'';
  };
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const eventType=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').toLowerCase().replace(/[\s_-]/g,'');
  const qnames=e=>(e?.qualifiers||[]).map(q=>String(dn(q?.type)||'')).filter(Boolean);
  const ownGoal=e=>eventType(e)==='owngoal'||qnames(e).some(q=>q.toLowerCase()==='owngoal');
  const scoreGoal=e=>eventType(e)==='goal'||eventType(e)==='owngoal'||ownGoal(e);
  const evtSec=e=>Number(e?.minute||0)*60+Number(e?.second||0);

  function patchForestShirts(){
    if(typeof raw==='undefined'||!raw)return;
    const all=[...(raw.home?.players||[]),...(raw.away?.players||[])];
    let changed=false;
    for(const p of all){
      const n=FOREST_SHIRTS[String(p?.playerId)];
      if(n!=null&&(p.shirtNo==null||p.shirtNo==='')){p.shirtNo=n;changed=true;}
    }
    if(changed)$('fromRange')?.dispatchEvent(new Event('input',{bubbles:true}));
  }

  function patchBrandAndSubtitle(){
    const brandSub=document.querySelector('.brand span');
    if(brandSub)brandSub.textContent='lufcdata lab analysis';
    const pageTitle=document.querySelector('.page-head h1');
    if(pageTitle)pageTitle.textContent='Match Analysis';
    const sub=document.querySelector('.page-head .sub');
    if(sub&&sub.textContent.includes('Locked Metric Bible definitions'))sub.remove();
  }

  function cleanupMatchFields(){
    const fields=[...document.querySelectorAll('.controls-panel .field')].filter(f=>String(f.querySelector('label')?.textContent||'').trim()==='Match');
    const keep=fields.find(f=>f.querySelector('#pitchlabMatch'));
    if(!keep)return;
    fields.forEach(f=>{if(f!==keep)f.remove();});
  }

  function patchLeaderLogos(){
    document.querySelectorAll('#leadersList .metric-leader').forEach(row=>{
      const id=row.getAttribute('data-player-id');
      const team=teamOfPlayer(id);
      if(!team)return;
      const src=logoPath(team);
      let img=row.querySelector('.metric-leader__crest');
      if(!img){
        const ph=row.querySelector('.metric-leader__crest-placeholder');
        img=document.createElement('img');
        img.className='metric-leader__crest';
        if(ph)ph.replaceWith(img);else row.prepend(img);
      }
      img.src=src;img.alt=`${team} crest`;
    });
  }

  function patchFixtureLogos(){
    if(typeof raw==='undefined'||!raw)return;
    const home=raw.home?.name||'',away=raw.away?.name||'';
    const hi=$('matchHomeCrest'),ai=$('matchAwayCrest');
    if(hi&&home){hi.src=logoPath(home);hi.alt=`${home} crest`;}
    if(ai&&away){ai.src=logoPath(away);ai.alt=`${away} crest`;}

    const stats=$('matchStatsScore');
    if(stats){
      const ensure=(selector,name,side)=>{
        const teamNode=stats.querySelector(selector);if(!teamNode||!name)return;
        let img=teamNode.querySelector('.match-stats-panel__crest');
        if(!img){img=document.createElement('img');img.className='match-stats-panel__crest';if(side==='home')teamNode.appendChild(img);else teamNode.insertBefore(img,teamNode.firstChild);}
        img.src=logoPath(name);img.alt=`${name} crest`;
      };
      ensure('.match-stats-panel__team--home',home,'home');
      ensure('.match-stats-panel__team--away',away,'away');
    }
  }

  function patchDynamicPitchScore(){
    if(typeof raw==='undefined'||!raw||typeof events==='undefined'||!Array.isArray(events)||!events.length)return;
    const from=$('fromRange'),to=$('toRange');if(!from||!to)return;
    const max=Math.max(90*60,...events.map(evtSec));
    let a=Number(from.value||0),b=Number(to.value||100);if(b<=a)b=Math.min(100,a+1);
    const lo=a/100*max,hi=b/100*max;
    const home=raw.home?.name||'Home',away=raw.away?.name||'Away';
    let hs=0,as=0;
    for(const e of events){
      const s=evtSec(e);if(s<lo||s>hi||!scoreGoal(e))continue;
      const eventTeam=typeof teamName==='function'?teamName(e):'';
      const credited=ownGoal(e)?(eventTeam===home?away:eventTeam===away?home:''):eventTeam;
      if(credited===home)hs++;else if(credited===away)as++;
    }
    const h=$('matchHomeScore'),aw=$('matchAwayScore');if(h)h.textContent=String(hs);if(aw)aw.textContent=String(as);
    $('matchScore')?.setAttribute('aria-label',`${hs}–${as}`);
    $('matchFixture')?.setAttribute('aria-label',`${home} ${hs}–${as} ${away}`);
    patchFixtureLogos();
  }

  function installViewButtons(){
    const toolbar=document.querySelector('.pitch-view-toggle');
    const panel=document.querySelector('.pitch-panel');
    const oldStats=$('pitchViewToggle'),oldPos=$('positionsViewToggle');
    if(!toolbar||!panel||!oldStats||!oldPos||$('pitchMapViewButton'))return false;
    oldStats.style.display='none';oldPos.style.display='none';

    const mk=(id,label)=>{const b=document.createElement('button');b.id=id;b.type='button';b.className='pitch-view-toggle__button pitch-view-toggle__button--secondary';b.textContent=label;b.setAttribute('aria-pressed','false');return b;};
    const pitch=mk('pitchMapViewButton','Pitch Map');
    const stats=mk('matchStatsViewButton','Match Stats');
    const pos=mk('positionsViewButton','Positions');
    toolbar.prepend(pitch,stats,pos);

    const sync=()=>{
      const isStats=panel.classList.contains('is-match-stats-view');
      const isPos=panel.classList.contains('is-positions-view');
      [[pitch,!isStats&&!isPos],[stats,isStats],[pos,isPos]].forEach(([b,on])=>{b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on));});
    };
    const after=()=>requestAnimationFrame(sync);
    pitch.addEventListener('click',()=>{if(panel.classList.contains('is-match-stats-view'))oldStats.click();if(panel.classList.contains('is-positions-view'))oldPos.click();after();});
    stats.addEventListener('click',()=>{if(panel.classList.contains('is-positions-view'))oldPos.click();if(!panel.classList.contains('is-match-stats-view'))oldStats.click();after();});
    pos.addEventListener('click',()=>{if(panel.classList.contains('is-match-stats-view'))oldStats.click();if(!panel.classList.contains('is-positions-view'))oldPos.click();after();});
    new MutationObserver(sync).observe(panel,{attributes:true,attributeFilter:['class']});
    sync();return true;
  }

  function refresh(){
    patchBrandAndSubtitle();cleanupMatchFields();patchForestShirts();patchLeaderLogos();patchFixtureLogos();patchDynamicPitchScore();installViewButtons();
  }

  function install(){
    refresh();
    const leaders=$('leadersList');if(leaders)new MutationObserver(()=>{patchLeaderLogos();}).observe(leaders,{childList:true,subtree:true});
    const stats=$('matchStatsScore');if(stats)new MutationObserver(()=>patchFixtureLogos()).observe(stats,{childList:true,subtree:true});
    const count=$('eventCount');if(count)new MutationObserver(()=>requestAnimationFrame(()=>{patchDynamicPitchScore();patchLeaderLogos();})).observe(count,{childList:true,subtree:true,characterData:true});
    [$('fromRange'),$('toRange')].forEach(el=>{if(el){el.addEventListener('input',()=>requestAnimationFrame(patchDynamicPitchScore));el.addEventListener('change',()=>requestAnimationFrame(patchDynamicPitchScore));}});
    document.addEventListener('pitchlab:match-loaded',()=>requestAnimationFrame(refresh));
    let tries=0;const timer=setInterval(()=>{tries++;refresh();if(tries>60)clearInterval(timer);},100);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();