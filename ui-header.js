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
      <div class="match-fixture" aria-label="Bournemouth 2–2 Leeds">
        <div class="match-team match-team--home">
          <span class="match-team-name">Bournemouth</span>
          <img class="match-crest" src="assets/club-logos/Bournemouth.png" alt="Bournemouth crest">
        </div>
        <div class="match-score" aria-label="2–2">
          <span>2</span><span class="match-score-sep">–</span><span>2</span>
        </div>
        <div class="match-team match-team--away">
          <img class="match-crest" src="assets/club-logos/leeds%20png.png" alt="Leeds crest">
          <span class="match-team-name">Leeds</span>
        </div>
      </div>
      <div class="match-context">
        <span id="matchTeamLabel"></span>
        <span class="match-context-sep">|</span>
        <span id="matchWindowLabel"></span>
      </div>`;

    heading.appendChild(identity);

    const sync=()=>{
      document.getElementById('matchMetricLabel').textContent=oldTitle.textContent.trim();
      document.getElementById('matchTeamLabel').textContent=oldTeam.textContent.trim();
      document.getElementById('matchWindowLabel').textContent=oldWindow.textContent.trim();
    };

    sync();
    [oldTitle,oldTeam,oldWindow].forEach(node=>new MutationObserver(sync).observe(node,{subtree:true,childList:true,characterData:true}));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})();
