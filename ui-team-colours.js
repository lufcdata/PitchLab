(()=>{
  const controls=document.querySelector('.controls-panel');
  const title=controls?.querySelector('.controls-title');
  if(!controls||!title||document.getElementById('teamColourControls'))return;
  const root=document.documentElement;
  const savedHome=localStorage.getItem('pitchlab-home-colour')||'#4ef0ce';
  const savedAway=localStorage.getItem('pitchlab-away-colour')||'#5d79d8';
  const savedHomeNumber=localStorage.getItem('pitchlab-home-number-colour')||'#212226';
  const savedAwayNumber=localStorage.getItem('pitchlab-away-number-colour')||'#FFFFFF';
  root.style.setProperty('--home-team-colour',savedHome);
  root.style.setProperty('--away-team-colour',savedAway);
  root.style.setProperty('--home-number-colour',savedHomeNumber);
  root.style.setProperty('--away-number-colour',savedAwayNumber);
  const wrap=document.createElement('div');
  wrap.id='teamColourControls';
  wrap.className='team-colour-controls';
  wrap.innerHTML=`<div class="team-colour-controls__label">Team Colours</div><div class="team-colour-controls__swatches"><label class="team-colour-control"><span>Home</span><input id="homeTeamColour" type="color" value="${savedHome}" aria-label="Home team colour"><span class="team-number-contrast" aria-label="Home shirt number text"><button type="button" class="team-number-contrast__dot" data-team="home" data-tone="dark" data-colour="#212226" aria-label="Dark home shirt numbers"></button><button type="button" class="team-number-contrast__dot" data-team="home" data-tone="light" data-colour="#FFFFFF" aria-label="Light home shirt numbers"></button></span></label><label class="team-colour-control"><span>Away</span><input id="awayTeamColour" type="color" value="${savedAway}" aria-label="Away team colour"><span class="team-number-contrast" aria-label="Away shirt number text"><button type="button" class="team-number-contrast__dot" data-team="away" data-tone="dark" data-colour="#212226" aria-label="Dark away shirt numbers"></button><button type="button" class="team-number-contrast__dot" data-team="away" data-tone="light" data-colour="#FFFFFF" aria-label="Light away shirt numbers"></button></span></label></div>`;
  title.insertAdjacentElement('afterend',wrap);

  function syncLeaderColours(){
    const home=typeof raw!=='undefined'?(raw.home?.name||''):'';
    document.querySelectorAll('.metric-leader').forEach(row=>{
      const alt=row.querySelector('.metric-leader__crest')?.getAttribute('alt')||'';
      const team=alt.replace(/\s+crest$/i,'');
      row.style.setProperty('--leader-colour',team&&home&&team!==home?'var(--away-team-colour)':'var(--home-team-colour)');
    });
  }
  const leaders=document.getElementById('metricLeaders');
  if(leaders)new MutationObserver(syncLeaderColours).observe(leaders,{childList:true,subtree:true});

  const bind=(id,cssVar,key)=>{
    const input=document.getElementById(id);if(!input)return;
    input.addEventListener('input',()=>{
      root.style.setProperty(cssVar,input.value);
      localStorage.setItem(key,input.value);
      syncLeaderColours();
      document.dispatchEvent(new CustomEvent('pitchlab:team-colours-changed'));
    });
  };
  bind('homeTeamColour','--home-team-colour','pitchlab-home-colour');
  bind('awayTeamColour','--away-team-colour','pitchlab-away-colour');

  const setNumberColour=(team,colour)=>{
    const cssVar=`--${team}-number-colour`;
    root.style.setProperty(cssVar,colour);
    localStorage.setItem(`pitchlab-${team}-number-colour`,colour);
    document.querySelectorAll(`.team-number-contrast__dot[data-team="${team}"]`).forEach(btn=>btn.classList.toggle('is-active',btn.dataset.colour.toUpperCase()===colour.toUpperCase()));
    document.dispatchEvent(new CustomEvent('pitchlab:team-colours-changed'));
  };
  document.querySelectorAll('.team-number-contrast__dot').forEach(btn=>btn.addEventListener('click',()=>setNumberColour(btn.dataset.team,btn.dataset.colour)));
  setNumberColour('home',savedHomeNumber);
  setNumberColour('away',savedAwayNumber);
  requestAnimationFrame(syncLeaderColours);
})();
