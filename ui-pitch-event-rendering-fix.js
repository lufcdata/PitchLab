(()=>{
  if(typeof drawPoint!=='function'||typeof render!=='function')return;

  // 25% smaller than the previous 0.48 start marker.
  const START_DOT_RADIUS='0.36';
  const START_DOT_STROKE='#0d0e19';
  const WON_COLOUR='#43FAD5';
  const LOST_COLOUR='#ED1362';
  const GOAL_COLOUR='#BDA060';
  const lostMetricKeys=new Set(['tackles_lost','fouls','fouls_committed','errors','dispossessed']);
  const outcomeMetricKeys=new Set(['tackles','takeons','total_duels','ground_duels','aerial_duels','att_aerial_duels','def_aerial_duels']);
  const outcomePairs={
    tackles:['tackles_won','tackles_lost'],
    takeons:['takeons_success','takeons_unsuccess'],
    total_duels:['duels_won','duels_lost'],
    ground_duels:['ground_duels_won','ground_duels_lost'],
    aerial_duels:['aerial_duels_won','aerial_duels_lost'],
    att_aerial_duels:['att_aerial_duels_won','att_aerial_duels_lost'],
    def_aerial_duels:['def_aerial_duels_won','def_aerial_duels_lost']
  };
  const isGoalEvent=e=>(typeof type==='function'&&type(e)==='Goal')||(typeof hasQ==='function'&&hasQ(e,'OwnGoal'));
  const metricTest=(key,e)=>{
    const def=window.PitchLabMetricBible?.canonicalRegistry?.[key];
    if(def&&typeof def.test==='function')return !!def.test(e);
    return typeof FILTERS!=='undefined'&&typeof FILTERS[key]==='function'&&!!FILTERS[key](e);
  };
  const outcomeColour=e=>{
    const key=document.getElementById('metric')?.value,pair=outcomePairs[key];
    if(!pair)return null;
    if(metricTest(pair[0],e))return WON_COLOUR;
    if(metricTest(pair[1],e))return LOST_COLOUR;
    return null;
  };

  function appendStartDot(root,e,colour='#43ede1'){
    if(!root||!e||![e.x,e.y].every(v=>v!==null&&v!==undefined&&Number.isFinite(Number(v))))return;
    const p=toPoint(e);
    root.appendChild(svg('circle',{
      cx:p.x,cy:p.y,r:START_DOT_RADIUS,fill:colour,opacity:'0.96',
      stroke:START_DOT_STROKE,'stroke-width':'0.18','vector-effect':'non-scaling-stroke'
    }));
  }
  function ensureGoalMarker(root){
    if(!root||root.querySelector('#goalGoldArrow'))return;
    const defs=root.querySelector('defs');if(!defs)return;
    const marker=svg('marker',{id:'goalGoldArrow',markerWidth:'1.08',markerHeight:'0.78',refX:'1.0',refY:'0.39',orient:'auto',markerUnits:'userSpaceOnUse'});
    marker.appendChild(svg('path',{d:'M0,0 L1.04,0.39 L0,0.78 Z',fill:GOAL_COLOUR}));defs.appendChild(marker);
  }

  const baseDrawPoint=drawPoint;
  drawPoint=(root,e,colour)=>{
    const key=document.getElementById('metric')?.value;
    const split=outcomeMetricKeys.has(key)?outcomeColour(e):null;
    return baseDrawPoint(root,e,split||(lostMetricKeys.has(key)?LOST_COLOUR:colour));
  };

  const baseDrawPass=drawPass;
  drawPass=(root,e)=>{
    baseDrawPass(root,e);
    appendStartDot(root,e,success(e)?'#43ece0':'#8e96a3');
  };

  const baseDrawAttackArrow=drawAttackArrow;
  drawAttackArrow=(root,e,colour='#43ede1',marker='url(#eventArrow)')=>{
    baseDrawAttackArrow(root,e,colour,marker);
    appendStartDot(root,e,colour);
  };

  const baseDrawShotArrow=drawShotArrow;
  drawShotArrow=(root,e,colour='#43ede1',marker='url(#eventArrow)')=>{
    const goal=isGoalEvent(e);if(goal){ensureGoalMarker(root);colour=GOAL_COLOUR;marker='url(#goalGoldArrow)'}
    baseDrawShotArrow(root,e,colour,marker);
    appendStartDot(root,e,colour);
  };

  // These are pass events and must retain their trajectories on Pitch Events.
  const baseLineMetric=lineMetric;
  const extraLineMetrics=new Set([
    'goal_kicks','final_third_entries',
    'through_balls','throughballs','through_balls_success','throughballs_success','through_balls_unsuccess','throughballs_unsuccess',
    'set_play_crosses_success','set_play_crosses_unsuccess'
  ]);
  lineMetric=key=>baseLineMetric(key)||extraLineMetrics.has(key);

  requestAnimationFrame(()=>render());
})();
