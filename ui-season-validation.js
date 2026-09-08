(()=>{
  const SHOT_TYPES=new Set(['goal','missedshots','savedshot','shotonpost']);
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const type=e=>String(dn(e?.type)||'').toLowerCase().replace(/[\s_-]/g,'');
  const median=values=>{const a=[...values].sort((x,y)=>x-y);if(!a.length)return null;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2};

  function validate(){
    const api=window.PitchLabSeasonPerformance,state=api?.state;
    if(!state?.manifest)return {passed:false,reason:'Season Performance state unavailable'};
    const failures=[],subjectId=String(state.manifest.clubTeamId??'');
    const selected=state.selected||[];
    const expectedEvents=selected.reduce((sum,m)=>sum+((state.packs.get(m.matchId)?.events||[]).length),0);
    const actualEvents=typeof events!=='undefined'&&Array.isArray(events)?events.length:0;
    if(expectedEvents!==actualEvents)failures.push({reason:'aggregate event parity',expected:expectedEvents,actual:actualEvents});

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

    const carry=state.validation||null;
    if(carry&&carry.passed===false)failures.push({reason:'carry validation failed',details:carry});
    const result={version:'SEASON_VALIDATION_V1_2026-09-08',selectedMatches:selected.length,expectedEvents,actualEvents,eventParity:expectedEvents===actualEvents,subjectTeamId:Number(state.manifest.clubTeamId),orientation,carry,failures,passed:failures.length===0};
    window.PitchLabSeasonValidationResult=result;
    if(!result.passed)console.error('[PitchLab Season Validation] FAILED',result);else console.info('[PitchLab Season Validation] PASSED',result);
    return result;
  }

  const schedule=()=>setTimeout(()=>{try{validate()}catch(err){console.error('[PitchLab Season Validation]',err)}},0);
  document.addEventListener('change',schedule,true);
  document.addEventListener('input',schedule,true);
  window.addEventListener('pitchlab:timings-ready',schedule);
  window.PitchLabSeasonValidation=Object.freeze({version:'SEASON_VALIDATION_V1_2026-09-08',validate});
  schedule();
})();