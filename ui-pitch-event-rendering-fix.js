(()=>{
  if(typeof drawPoint!=='function'||typeof render!=='function')return;

  // 25% smaller than the previous 0.48 start marker.
  const START_DOT_RADIUS='0.36';
  const START_DOT_STROKE='#0d0e19';
  const LOST_COLOUR='#ED1362';
  const GOAL_COLOUR='#BDA060';
  const lostMetricKeys=new Set(['tackles_lost','fouls','fouls_committed','errors','dispossessed']);
  const isGoalEvent=e=>(typeof type==='function'&&type(e)==='Goal')||(typeof hasQ==='function'&&hasQ(e,'OwnGoal'));

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
  drawPoint=(root,e,colour)=>baseDrawPoint(root,e,lostMetricKeys.has(document.getElementById('metric')?.value)?LOST_COLOUR:colour);

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
    'through_balls','throughballs','through_balls_success','throughballs_success','through_balls_unsuccess','throughballs_unsuccess'
  ]);
  lineMetric=key=>baseLineMetric(key)||extraLineMetrics.has(key);

  requestAnimationFrame(()=>render());
})();
