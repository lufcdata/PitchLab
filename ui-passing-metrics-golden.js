(()=>{
  if(typeof FILTERS==='undefined')return;
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const typeOf=e=>String(typeof type==='function'?type(e):dn(e?.type)||'');
  const outcome=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const qnames=e=>(e?.qualifiers||[]).map(q=>String(dn(q?.type)||'')).filter(Boolean);
  const hasAnyQ=(e,...names)=>{const q=qnames(e);return names.some(n=>q.includes(n));};
  const isStatPass=e=>typeOf(e)==='Pass'&&!hasAnyQ(e,'Cross','ThrowIn','KeeperThrow');
  const isSuccess=e=>outcome(e)==='successful';
  const endInFinalThird=e=>Number(e?.endX)>=200/3;

  // GOLDEN PASS FAMILY — validated against WS_1983552 embedded Opta player totals:
  // Nottingham Forest: 411 total / 321 successful / 110 final-third / 72 successful final-third
  // Leeds:              326 total / 232 successful /  92 final-third / 38 successful final-third
  // WhoScored Pass events include Cross, ThrowIn and KeeperThrow actions that are NOT part of
  // the headline Opta statistical-pass totals. Excluding those three families reproduces the
  // embedded player-stat totals exactly for both teams.
  FILTERS.allpasses=isStatPass;
  FILTERS.successful=e=>isStatPass(e)&&isSuccess(e);
  FILTERS.unsuccessful=e=>isStatPass(e)&&!isSuccess(e);
  FILTERS.final_third_passes=e=>isStatPass(e)&&endInFinalThird(e);
  FILTERS.final_third_passes_success=e=>isStatPass(e)&&endInFinalThird(e)&&isSuccess(e);

  window.PitchLabPassingGolden={
    version:'PASS_FAMILY_GOLDEN_V1',
    isStatPass,
    finalThirdPass:e=>isStatPass(e)&&endInFinalThird(e),
    benchmarks:{
      1983552:{
        home:{team:'Nottingham Forest',totalPasses:411,successfulPasses:321,passAccuracy:78.1,finalThirdPasses:110,successfulFinalThirdPasses:72},
        away:{team:'Leeds',totalPasses:326,successfulPasses:232,passAccuracy:71.2,finalThirdPasses:92,successfulFinalThirdPasses:38}
      }
    }
  };
})();
