(()=>{
  const SHOT_TYPES=new Set(['goal','missedshots','savedshot','shotonpost']);
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const type=e=>String(dn(e?.type)||'').toLowerCase().replace(/[\s_-]/g,'');
  const median=values=>{const a=[...values].sort((x,y)=>x-y);if(!a.length)return null;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2};
  const sorted=a=>[...a].map(String).sort((x,y)=>x.localeCompare(y,undefined,{numeric:true}));

  function validatePlayerPopulation(selected,state,subjectId,failures){
    const expected=new Set();
    const expectedByMatch={};
    for(const m of selected){
      const pack=state.packs.get(m.matchId),ids=new Set();
      for(const e of pack?.events||[]){
        if(String(e.teamId)!==subjectId||e.playerId===null||e.playerId===undefined)continue;
        ids.add(String(e.playerId));expected.add(String(e.playerId));
      }
      expectedByMatch[String(m.matchId)]=sorted(ids);
    }
    const select=document.getElementById('player');
    const actual=new Set(select?[...select.options].map(o=>String(o.value)).filter(v=>v!=='all'):[]);
    const missing=sorted([...expected].filter(id=>!actual.has(id))),unexpected=sorted([...actual].filter(id=>!expected.has(id)));
    if(missing.length||unexpected.length)failures.push({reason:'player population parity',missing,unexpected});
    const chosen=select?.value&&select.value!=='all'?String(select.value):null;
    if(chosen&&!expected.has(chosen))failures.push({reason:'selected player outside Leeds season population',playerId:chosen});
    return {expectedCount:expected.size,actualCount:actual.size,missing,unexpected,expectedByMatch,passed:missing.length===0&&unexpected.length===0};
  }

  function validateFixtureBoundaries(selected,state,failures){
    const manifestIds=new Set(),packPaths=new Set(),duplicateMatchIds=[],duplicatePackPaths=[],tagFailures=[];
    for(const m of state.manifest.matches||[]){
      const id=String(m.matchId??'');
      if(manifestIds.has(id))duplicateMatchIds.push(id);else manifestIds.add(id);
      if(m.pack){if(packPaths.has(m.pack))duplicatePackPaths.push(m.pack);else packPaths.add(m.pack)}
    }
    if(duplicateMatchIds.length)failures.push({reason:'duplicate manifest matchId',matchIds:sorted(new Set(duplicateMatchIds))});
    if(duplicatePackPaths.length)failures.push({reason:'duplicate manifest pack path',packPaths:sorted(new Set(duplicatePackPaths))});
    for(const m of selected){
      const pack=state.packs.get(m.matchId);if(!pack)continue;
      if(String(pack.matchId)!==String(m.matchId))tagFailures.push({matchId:m.matchId,reason:'pack matchId mismatch',packMatchId:pack.matchId});
      for(const e of pack.events||[]){
        if(String(e.__matchId)!==String(m.matchId)){tagFailures.push({matchId:m.matchId,reason:'event match tag mismatch',eventId:e.eventId,tag:e.__matchId});break}
        if(String(e.__matchDate)!==String(m.date)){tagFailures.push({matchId:m.matchId,reason:'event date tag mismatch',eventId:e.eventId,tag:e.__matchDate,expected:m.date});break}
      }
    }
    failures.push(...tagFailures);
    return {duplicateMatchIds:sorted(new Set(duplicateMatchIds)),duplicatePackPaths:sorted(new Set(duplicatePackPaths)),tagFailures,passed:duplicateMatchIds.length===0&&duplicatePackPaths.length===0&&tagFailures.length===0};
  }

  function validate(){
    const api=window.PitchLabSeasonPerformance,state=api?.state;
    if(!state?.manifest)return {passed:false,reason:'Season Performance state unavailable'};
    const failures=[],subjectId=String(state.manifest.clubTeamId??'');
    const selected=state.selected||[];
    const expectedEvents=selected.reduce((sum,m)=>sum+((state.packs.get(m.matchId)?.events||[]).length),0);
    const actualEvents=typeof events!=='undefined'&&Array.isArray(events)?events.length:0;
    if(expectedEvents!==actualEvents)failures.push({reason:'aggregate event parity',expected:expectedEvents,actual:actualEvents});

    const fixtureBoundaries=validateFixtureBoundaries(selected,state,failures);
    const orientation=[];
    for(const m of selected){
      const pack=state.packs.get(m.matchId);if(!pack)continue;
      const homeId=String(pack.home?.teamId??''),awayId=String(pack.away?.teamId??'');
      const resolvedSide=homeId===subjectId?'home':awayId===subjectId?'away':null;
      if(!resolvedSide)failures.push({matchId:m.matchId,reason:'subject team id missing from pack',subjectId,homeId,awayId});
      if(m.clubSide&&resolvedSide&&m.clubSide!==resolvedSide)failures.push({matchId:m.matchId,reason:'manifest side mismatch',manifest:m.clubSide,resolved:resolvedSide});
      if(String(m.clubTeamId??subjectId)!==subjectId)failures.push({matchId:m.matchId,reason:'manifest subject team id mismatch',manifest:m.clubTeamId,subjectId});

      const shots=(pack.events||[]).filter(e=>String(e.teamId)===subjectId&&SHOT_TYPES.has(type(e))&&Number.isFinite(Number(e.x))).map(e=>Number(e.x));
      const med=median(shots),evaluable=shots.length>=3;
      const consistent=!evaluable||med>50;
      orientation.push({matchId:m.matchId,side:resolvedSide,shotCount:shots.length,medianShotX:med,evaluable,consistent});
      if(evaluable&&!consistent)failures.push({matchId:m.matchId,reason:'subject spatial orientation inconsistent',medianShotX:med,shotCount:shots.length});
    }

    const playerPopulation=validatePlayerPopulation(selected,state,subjectId,failures);
    const carry=state.validation||null;
    if(carry&&carry.passed===false)failures.push({reason:'carry validation failed',details:carry});
    const result={version:'SEASON_VALIDATION_V1_3_2026-09-08',selectedMatches:selected.length,expectedEvents,actualEvents,eventParity:expectedEvents===actualEvents,subjectTeamId:Number(state.manifest.clubTeamId),fixtureBoundaries,playerPopulation,orientation,carry,failures,passed:failures.length===0};
    window.PitchLabSeasonValidationResult=result;
    if(!result.passed)console.error('[PitchLab Season Validation] FAILED',result);else console.info('[PitchLab Season Validation] PASSED',result);
    return result;
  }

  const schedule=()=>setTimeout(()=>{try{validate()}catch(err){console.error('[PitchLab Season Validation]',err)}},0);
  document.addEventListener('change',schedule,true);
  document.addEventListener('input',schedule,true);
  window.addEventListener('pitchlab:timings-ready',schedule);
  let attempts=0;
  const waitForSeason=()=>{
    attempts++;
    const state=window.PitchLabSeasonPerformance?.state;
    if(state?.manifest){schedule();return}
    if(attempts<20)setTimeout(waitForSeason,250);
  };
  window.PitchLabSeasonValidation=Object.freeze({version:'SEASON_VALIDATION_V1_3_2026-09-08',validate});
  waitForSeason();
})();