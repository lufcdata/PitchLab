(()=>{
  if(typeof drawPoint!=='function'||typeof render!=='function')return;

  const START_DOT_RADIUS='0.48';
  const START_DOT_STROKE='#0d0e19';

  function appendStartDot(root,e,colour='#43ede1'){
    if(!root||!e||![e.x,e.y].every(v=>v!==null&&v!==undefined&&Number.isFinite(Number(v))))return;
    const p=toPoint(e);
    root.appendChild(svg('circle',{
      cx:p.x,cy:p.y,r:START_DOT_RADIUS,fill:colour,opacity:'0.96',
      stroke:START_DOT_STROKE,'stroke-width':'0.18','vector-effect':'non-scaling-stroke'
    }));
  }

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
    baseDrawShotArrow(root,e,colour,marker);
    appendStartDot(root,e,colour);
  };

  const baseLineMetric=lineMetric;
  lineMetric=key=>baseLineMetric(key)||key==='goal_kicks';

  requestAnimationFrame(()=>render());
})();
