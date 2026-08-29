(()=>{
  if(typeof drawPoint!=='function'||typeof render!=='function')return;
  const metric=document.getElementById('metric');
  const smaller=new Set(['total_actions','successful_actions','unsuccessful_actions','touches']);
  const SCALE=0.90;
  const baseDrawPoint=drawPoint;
  drawPoint=(root,e,colour)=>{
    const before=root?.childNodes?.length||0;
    const result=baseDrawPoint(root,e,colour);
    if(smaller.has(metric?.value)&&root){
      const node=root.childNodes[before];
      if(node?.tagName?.toLowerCase()==='circle'){
        const r=Number(node.getAttribute('r'));
        if(Number.isFinite(r))node.setAttribute('r',String(r*SCALE));
      }
    }
    return result;
  };
  requestAnimationFrame(()=>render());
})();
