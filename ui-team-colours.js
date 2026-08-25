(()=>{
  const controls=document.querySelector('.controls-panel');
  const title=controls?.querySelector('.controls-title');
  if(!controls||!title||document.getElementById('teamColourControls'))return;
  const root=document.documentElement;
  const savedHome=localStorage.getItem('pitchlab-home-colour')||'#4ef0ce';
  const savedAway=localStorage.getItem('pitchlab-away-colour')||'#5d79d8';
  root.style.setProperty('--home-team-colour',savedHome);
  root.style.setProperty('--away-team-colour',savedAway);
  const wrap=document.createElement('div');
  wrap.id='teamColourControls';
  wrap.className='team-colour-controls';
  wrap.innerHTML=`<div class="team-colour-controls__label">Team Colours</div><div class="team-colour-controls__swatches"><label class="team-colour-control"><span>Home</span><input id="homeTeamColour" type="color" value="${savedHome}" aria-label="Home team colour"></label><label class="team-colour-control"><span>Away</span><input id="awayTeamColour" type="color" value="${savedAway}" aria-label="Away team colour"></label></div>`;
  title.insertAdjacentElement('afterend',wrap);
  const bind=(id,cssVar,key)=>{
    const input=document.getElementById(id);if(!input)return;
    input.addEventListener('input',()=>{root.style.setProperty(cssVar,input.value);localStorage.setItem(key,input.value);document.dispatchEvent(new CustomEvent('pitchlab:team-colours-changed'))});
  };
  bind('homeTeamColour','--home-team-colour','pitchlab-home-colour');
  bind('awayTeamColour','--away-team-colour','pitchlab-away-colour');
})();
