(()=>{
  function install(){
    const heading=document.querySelector('.plot-heading');
    if(!heading||heading.dataset.matchIdentity==='1')return;

    const oldTitle=document.getElementById('plotTitle');
    const oldTeam=document.getElementById('plotTeam');
    const oldWindow=document.getElementById('plotWindow');
    if(!oldTitle||!oldTeam||!oldWindow)return;

    heading.dataset.matchIdentity='1';
    heading.classList.add('match-heading');

    const identity=document.createElement('div');
    identity.className='match-identity';
    identity.innerHTML=`
      <div class="match-kicker" id="matchMetricLabel"></div>
      <div class="match-fixture" id="matchFixture">
        <div class="match-team match-team--home">
          <span class="match-team-name" id="matchHomeName">Bournemouth</span>
          <img class="match-crest" id="matchHomeCrest" src="assets/club-logos/Bournemouth.png" alt="Bournemouth crest">
        </div>
        <div class="match-score" id="matchScore" aria-label="2–2">
          <span id="matchHomeScore">2</span><span class="match-score-sep">–</span><span id="matchAwayScore">2</span>
        </div>
        <div class="match-team match-team--away">
          <img class="match-crest" id="matchAwayCrest" src="assets/club-logos/leeds%20png.png" alt="Leeds crest">
          <span class="match-team-name" id="matchAwayName">Leeds</span>
        </div>
      </div>
      <div class="match-context">
        <span id="matchTeamLabel"></span>
        <span class="match-context-sep">|</span>
        <span id="matchWindowLabel"></span>
      </div>`;

    heading.appendChild(identity);

    const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
    const eventType=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').toLowerCase().replace(/[\s_-]/g,'');
    const hasAny=(e,...qs)=>typeof hasQ==='function'&&hasQ(e,...qs);
    const isOwnGoal=e=>hasAny(e,'OwnGoal')||eventType(e)==='owngoal';
    const isScoreGoal=e=>eventType(e)==='goal'||eventType(e)==='owngoal'||hasAny(e,'OwnGoal');
    const crestFor=name=>name==='Leeds'?'assets/club-logos/leeds%20png.png':name==='Bournemouth'?'assets/club-logos/Bournemouth.png':name==='Brighton'?'assets/club-logos/Brighton.png':name==='Brighton & Hove Albion'?'assets/club-logos/Brighton.png':'';

    const syncScore=()=>{
      try{
        if(typeof raw==='undefined'||!raw||typeof events==='undefined'||!Array.isArray(events)||!events.length)return;
        const home=raw.home?.name||'Home',away=raw.away?.name||'Away';
        let hs=0,as=0;
        for(const e of events){
          if(!isScoreGoal(e))continue;
          const eventTeam=typeof teamName==='function'?teamName(e):'';
          const credited=isOwnGoal(e)?(eventTeam===home?away:eventTeam===away?home:''):eventTeam;
          if(credited===home)hs+=1;else if(credited===away)as+=1;
        }
        document.getElementById('matchHomeName').textContent=home;
        document.getElementById('matchAwayName').textContent=away;
        document.getElementById('matchHomeScore').textContent=hs;
        document.getElementById('matchAwayScore').textContent=as;
        const hc=crestFor(home),ac=crestFor(away);
        const hi=document.getElementById('matchHomeCrest'),ai=document.getElementById('matchAwayCrest');
        if(hc){hi.src=hc;hi.alt=`${home} crest`}if(ac){ai.src=ac;ai.alt=`${away} crest`}
        document.getElementById('matchFixture').setAttribute('aria-label',`${home} ${hs}–${as} ${away}`);
        document.getElementById('matchScore').setAttribute('aria-label',`${hs}–${as}`);
      }catch(_){/* retain safe fixture display */}
    };

    const sync=()=>{
      document.getElementById('matchMetricLabel').textContent=oldTitle.textContent.trim();
      document.getElementById('matchTeamLabel').textContent=oldTeam.textContent.trim();
      document.getElementById('matchWindowLabel').textContent=oldWindow.textContent.trim();
      syncScore();
    };

    sync();
    [oldTitle,oldTeam,oldWindow].forEach(node=>new MutationObserver(sync).observe(node,{subtree:true,childList:true,characterData:true}));
    const count=document.getElementById('eventCount');
    if(count)new MutationObserver(syncScore).observe(count,{subtree:true,childList:true,characterData:true});
    let tries=0;const timer=setInterval(()=>{tries+=1;syncScore();if((typeof events!=='undefined'&&Array.isArray(events)&&events.length)||tries>40)clearInterval(timer)},100);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})();
