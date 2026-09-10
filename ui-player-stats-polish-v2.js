(()=>{
  const CANVAS_ID='playerStatsCanvas';
  const HI_RES_CREST='assets/Leeds Icon.png';
  const hiResCrest=new Image();
  hiResCrest.src=HI_RES_CREST;

  const proto=CanvasRenderingContext2D.prototype;
  if(proto.__pitchlabPlayerStatsPolishV2)return;
  proto.__pitchlabPlayerStatsPolishV2=true;

  const nativeDrawImage=proto.drawImage;
  proto.drawImage=function(...args){
    if(this.canvas?.id===CANVAS_ID&&args[0] instanceof HTMLImageElement){
      const src=String(args[0].currentSrc||args[0].src||'');
      const isHeaderCrest=/assets\/leeds(?:%20| )png\.png/i.test(src);
      const isHeaderSize=args.length>=5&&Number(args[3])===48&&Number(args[4])===48;
      if(isHeaderCrest&&isHeaderSize&&hiResCrest.complete&&hiResCrest.naturalWidth>0)args[0]=hiResCrest;
    }
    return nativeDrawImage.apply(this,args);
  };

  const nativeFillText=proto.fillText;
  proto.fillText=function(text,x,y,maxWidth){
    if(this.canvas?.id===CANVAS_ID&&y>=304&&y<=1225){
      const oldFont=this.font;
      let nx=x;
      if(Math.abs(x-146)<1){
        this.font='600 18px "Noto Sans Mono", "SFMono-Regular", Menlo, Consolas, monospace';
        nx=x+16;
      }else if(Math.abs(x-563)<1){
        this.font='700 19px "Noto Sans Mono", "SFMono-Regular", Menlo, Consolas, monospace';
      }else if(Math.abs(x-117)<1){
        this.font='700 13px "Noto Sans Mono", "SFMono-Regular", Menlo, Consolas, monospace';
      }
      const result=maxWidth===undefined?nativeFillText.call(this,text,nx,y):nativeFillText.call(this,text,nx,y,maxWidth);
      this.font=oldFont;
      return result;
    }
    return maxWidth===undefined?nativeFillText.call(this,text,x,y):nativeFillText.call(this,text,x,y,maxWidth);
  };

  const redraw=()=>{
    const metric=document.getElementById('psMetric');
    if(metric)metric.dispatchEvent(new Event('change',{bubbles:true}));
  };
  hiResCrest.addEventListener('load',redraw,{once:true});
  if(document.fonts?.load)document.fonts.load('600 18px "Noto Sans Mono"').then(redraw).catch(()=>{});
})();
