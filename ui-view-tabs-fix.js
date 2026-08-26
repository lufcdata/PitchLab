(()=>{
  const panel=document.querySelector('.pitch-panel');
  if(!panel)return;
  const ids=['pitchMapViewButton','matchStatsViewButton','positionsViewButton','passingNetworkViewToggle'];
  const state={
    pitchMapViewButton:[],
    matchStatsViewButton:['is-match-stats-view'],
    positionsViewButton:['is-positions-view'],
    passingNetworkViewToggle:['is-passing-network-view']
  };
  const viewClasses=['is-match-stats-view','is-positions-view','is-passing-network-view'];

  function sync(activeId){
    ids.forEach(id=>{
      const b=document.getElementById(id);if(!b)return;
      const on=id===activeId;
      b.classList.toggle('is-active',on);
      b.setAttribute('aria-pressed',String(on));
    });
  }

  function normalise(activeId){
    if(!state[activeId])return;
    viewClasses.forEach(c=>panel.classList.remove(c));
    state[activeId].forEach(c=>panel.classList.add(c));
    sync(activeId);
  }

  function current(){
    if(panel.classList.contains('is-passing-network-view'))return 'passingNetworkViewToggle';
    if(panel.classList.contains('is-positions-view'))return 'positionsViewButton';
    if(panel.classList.contains('is-match-stats-view'))return 'matchStatsViewButton';
    return 'pitchMapViewButton';
  }

  ids.forEach(id=>{
    const b=document.getElementById(id);if(!b)return;
    b.addEventListener('click',()=>{
      /* Let the existing view module render first, then enforce one canonical state. */
      requestAnimationFrame(()=>normalise(id));
    });
  });

  let locking=false;
  new MutationObserver(()=>{
    if(locking)return;
    locking=true;
    requestAnimationFrame(()=>{sync(current());locking=false;});
  }).observe(panel,{attributes:true,attributeFilter:['class']});

  normalise(current());
})();
