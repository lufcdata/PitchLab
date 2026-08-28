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
  const isOpenPlayPass=e=>isStatPass(e)&&!hasAnyQ(e,'CornerTaken','FreeKickTaken','FreekickTaken','GoalKick','GoalKickTaken','PenaltyTaken');
  const goalDistance=(x,y)=>Math.hypot(100-Number(x),50-Number(y));
  const isProgressivePass=e=>{
    if(!isOpenPlayPass(e)||!isSuccess(e))return false;
    const x=Number(e?.x),y=Number(e?.y),endX=Number(e?.endX),endY=Number(e?.endY);
    if(![x,y,endX,endY].every(Number.isFinite)||x<100/3)return false;
    const startDistance=goalDistance(x,y);
    return startDistance>0&&goalDistance(endX,endY)<=0.75*startDistance;
  };

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

  // PROGRESSIVE PASSES — GOLD LOCKED 2026-08-28.
  // Public label remains "Progressive Passes". Open play is qualification logic, not the label.
  // Opta definition: completed open-play pass in the attacking two-thirds that moves the ball
  // at least 25% closer to the opposition goal. WhoScored coordinates are 0-100 x 0-100, so
  // opposition goal centre is (100,50). Direct restart pass families are excluded explicitly.
  // Forensic controls: Forest 23 - 6 Leeds (1983552); Bournemouth 38 - 10 Leeds (1903384).
  FILTERS.progressive_passes=isProgressivePass;

  window.PitchLabPassingGolden={
    version:'PASS_FAMILY_GOLDEN_V2_2026-08-28',
    isStatPass,
    isOpenPlayPass,
    progressivePass:isProgressivePass,
    finalThirdPass:e=>isStatPass(e)&&endInFinalThird(e),
    benchmarks:{
      1983552:{
        home:{team:'Nottingham Forest',totalPasses:411,successfulPasses:321,passAccuracy:78.1,finalThirdPasses:110,successfulFinalThirdPasses:72,progressivePasses:23},
        away:{team:'Leeds',totalPasses:326,successfulPasses:232,passAccuracy:71.2,finalThirdPasses:92,successfulFinalThirdPasses:38,progressivePasses:6}
      },
      1903384:{
        home:{team:'Bournemouth',progressivePasses:38},
        away:{team:'Leeds',progressivePasses:10}
      }
    }
  };

  const bible=window.PitchLabMetricBible;
  if(bible){
    const def=Object.freeze({label:'Progressive Passes',kind:'event',surfaces:Object.freeze(['pitch','leaders','matchStats']),status:'GOLD_LOCKED',version:'PROGRESSIVE_PASSES_GOLD_V1_2026-08-28',golden:Object.freeze([23,6]),test:isProgressivePass});
    bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,progressive_passes:def});
    bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),'progressive_passes'])]);
  }
})();
