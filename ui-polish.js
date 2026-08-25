(()=>{
  const pitchPanel=document.querySelector('.pitch-panel');
  const controls=document.querySelector('.controls-panel');
  if(!controls)return;

  function homePlayerIds(){
    const ids=new Set();
    if(typeof raw==='undefined'||!raw)return ids;
    (raw.home?.players||[]).forEach(p=>{const id=p?.playerId??p?.id;if(id!=null)ids.add(String(id));});
    return ids;
  }

  function syncTeamColours(){
    const home=typeof raw!=='undefined'?(raw.home?.name||''):'';
    const homeIds=homePlayerIds();
    document.querySelectorAll('.metric-leader').forEach(row=>{
      const alt=row.querySelector('.metric-leader__crest')?.getAttribute('alt')||'';
      const team=alt.replace(/\s+crest$/i,'');
      const isAway=team&&home&&team!==home;
      row.style.setProperty('--leader-colour',isAway?'var(--away-team-colour)':'var(--home-team-colour)');
    });
    document.querySelectorAll('.pass-combo-row').forEach(row=>{
      const a=String(row.dataset.a||'');
      const isHome=homeIds.has(a);
      row.style.setProperty('--combo-colour',isHome?'var(--home-team-colour)':'var(--away-team-colour)');
    });
  }

  function reorderOwnGoals(){
    const body=document.getElementById('matchStatsBody');
    if(!body)return;
    const rows=[...body.querySelectorAll('.match-stats-row')];
    const own=rows.find(r=>r.querySelector('.match-stats-row__label')?.textContent.trim()==='Own Goals');
    const red=rows.find(r=>r.querySelector('.match-stats-row__label')?.textContent.trim()==='Red Cards');
    if(own&&red&&own.nextElementSibling!==red)body.insertBefore(own,red);
  }

  function syncViewButtons(){
    if(!pitchPanel)return;
    const stats=document.getElementById('pitchViewToggle');
    const positions=document.getElementById('positionsViewToggle');
    if(!stats||!positions)return;
    const positionsOn=pitchPanel.classList.contains('is-positions-view');
    const statsOn=pitchPanel.classList.contains('is-match-stats-view');
    stats.classList.toggle('pitch-view-toggle__button--secondary',positionsOn);
    positions.classList.toggle('pitch-view-toggle__button--secondary',!positionsOn);
    positions.classList.toggle('is-active',positionsOn);
    if(statsOn)stats.classList.remove('pitch-view-toggle__button--secondary');
  }

  function syncAll(){syncTeamColours();reorderOwnGoals();syncViewButtons();}
  const observer=new MutationObserver(()=>requestAnimationFrame(syncAll));
  observer.observe(controls,{childList:true,subtree:true});
  const statsBody=document.getElementById('matchStatsBody');
  if(statsBody)observer.observe(statsBody,{childList:true,subtree:true});
  if(pitchPanel)new MutationObserver(()=>requestAnimationFrame(syncViewButtons)).observe(pitchPanel,{attributes:true,attributeFilter:['class']});
  document.addEventListener('pitchlab:team-colours-changed',syncTeamColours);
  requestAnimationFrame(syncAll);
})();