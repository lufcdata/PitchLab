(()=>{
  const SEED=['Premier League','League Cup'];
  const norm=v=>String(v||'').trim();
  const label=v=>v==='all'?'All Competitions':v;
  const optionsFor=matches=>['all',...new Set([...SEED,...matches.map(m=>norm(m.competition)).filter(Boolean)])];
  const optionHtml=values=>values.map(v=>`<option value="${v.replace(/"/g,'&quot;')}">${label(v)}</option>`).join('');
  const byDate=(a,b)=>b.date.localeCompare(a.date)||Number(b.matchId)-Number(a.matchId);

  function installSeason(api){
    if(document.getElementById('seasonCompetition'))return;
    const state=api.state,allMatches=[...state.manifest.matches],originalCompetition=state.manifest.competition||'Premier League';
    const filters=document.querySelector('.filters');if(!filters)return;
    const field=document.createElement('div');field.className='field season-competition-filter';field.innerHTML=`<label>Competition</label><select id="seasonCompetition" class="selectlike">${optionHtml(optionsFor(allMatches))}</select>`;
    const dateTo=document.getElementById('dateTo')?.closest('.field');(dateTo||filters.lastElementChild)?.insertAdjacentElement('afterend',field);
    const select=field.querySelector('select'),status=document.getElementById('seasonStatus'),importBtn=document.getElementById('seasonImport'),input=document.getElementById('seasonImportFiles'),compLabel=document.getElementById('seasonCompetitionLabel');
    if(importBtn){importBtn.textContent='Load Match JSON…';importBtn.title='Validate and preview a WhoScored match JSON before protected library ingest.'}
    let selected='all';
    const mergeLocal=()=>{for(const m of state.manifest.matches){const i=allMatches.findIndex(x=>String(x.matchId)===String(m.matchId));if(i>=0)allMatches[i]=m;else allMatches.push(m)}};
    const apply=()=>{
      selected=select.value;
      state.manifest.competition=selected==='all'?'All Competitions':selected;
      state.manifest.matches=selected==='all'?[...allMatches]:allMatches.filter(m=>norm(m.competition||originalCompetition)===selected);
      if(compLabel)compLabel.textContent=`${label(selected)} · ${state.manifest.season||'2026/27'}`;
      api.reload();
    };
    select.addEventListener('change',apply);
    importBtn?.addEventListener('click',e=>{if(selected==='all'){e.preventDefault();e.stopImmediatePropagation();alert('Choose a competition before loading a match JSON so PitchLab can tag the fixture correctly.');}},true);
    if(status){new MutationObserver(()=>{if(/imported/i.test(status.textContent||'')){mergeLocal();const current=select.value;select.innerHTML=optionHtml(optionsFor(allMatches));select.value=current;}}).observe(status,{childList:true,subtree:true,characterData:true})}
    if(input)input.title='Choose a Competition first. Loaded JSON is validated for local preview; permanent storage still uses the protected Season Performance Cloud Ingest workflow.';
    if(compLabel)compLabel.textContent=`All Competitions · ${state.manifest.season||'2026/27'}`;
    window.PitchLabSeasonCompetition=Object.freeze({version:'SEASON_COMPETITION_FILTER_V1_2_2026-09-10',allMatches,apply});
  }

  function installCompared(api){
    if(document.getElementById('matchesComparedCompetition'))return;
    const state=api.state,allMatches=[...state.manifest.matches],controls=document.querySelector('.matches-compared__controls');if(!controls)return;
    const wrap=document.createElement('div');wrap.className='matches-compared__control matches-compared__control--competition';wrap.innerHTML=`<label for="matchesComparedCompetition">Competition</label><select id="matchesComparedCompetition" class="matches-compared__select">${optionHtml(optionsFor(allMatches))}</select>`;
    controls.prepend(wrap);const select=wrap.querySelector('select'),matchSelect=document.getElementById('matchesComparedSelect');
    const matchText=m=>{const d=new Date(`${m.date}T12:00:00`).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});return `${d} · ${m.home} ${m.score||'–'} ${m.away}`};
    const apply=()=>{
      const competition=select.value,old=String(state.selectedId||'');
      state.manifest.matches=competition==='all'?[...allMatches]:allMatches.filter(m=>norm(m.competition||state.manifest.competition)===competition);
      matchSelect.innerHTML='';
      for(const m of [...state.manifest.matches].sort(byDate)){if(!state.packs.has(m.matchId))continue;const o=document.createElement('option');o.value=m.matchId;o.textContent=matchText(m);matchSelect.appendChild(o)}
      if([...matchSelect.options].some(o=>o.value===old))matchSelect.value=old;
      state.selectedId=matchSelect.value||state.manifest.matches.at(-1)?.matchId||null;
      if(state.selectedId!==null){matchSelect.value=state.selectedId;matchSelect.dispatchEvent(new Event('change',{bubbles:true}));return}
      const context=document.getElementById('matchesComparedContext'),chart=document.getElementById('matchesComparedChart');
      if(context)context.textContent=`No ${label(competition)} matches are in the library yet.`;
      if(chart)chart.innerHTML='<div class="matches-compared__loading">No matches available for this competition.</div>';
    };
    select.addEventListener('change',apply);
    window.PitchLabMatchesCompetition=Object.freeze({version:'MATCHES_COMPETITION_FILTER_V1_2_2026-09-10',allMatches,apply});
  }

  let tries=0;const timer=setInterval(()=>{
    tries++;
    if(window.PitchLabSeasonPerformance){clearInterval(timer);installSeason(window.PitchLabSeasonPerformance);return}
    if(window.PitchLabMatchesCompared){clearInterval(timer);installCompared(window.PitchLabMatchesCompared);return}
    if(tries>200)clearInterval(timer);
  },50);
})();
