(()=>{
  const TEMPLATE='assets/export/Full Canvas.png';
  const WIDTH=1080,HEIGHT=1350,EXPORT_SCALE=2,EXPORT_LINE_STROKE_MULTIPLIER=1.20,BRANDING_TOP=1230;
  const PITCH={x:191,y:130,w:694,h:1074};
  const $=id=>document.getElementById(id);
  const safeName=s=>String(s||'season-performance').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const playerName=()=>{const p=$('player');return p?.value==='all'?'Leeds':(p?.options[p.selectedIndex]?.text||'Leeds')};
  const isTeam=()=>$('player')?.value==='all';
  const metricName=()=>window.PitchLabSeasonMultiMetrics?.label?.()||(()=>{const m=$('metric');return m?.options[m.selectedIndex]?.text||'Metric'})();
  const loadImage=(src,crossOrigin=false)=>new Promise((resolve,reject)=>{const img=new Image();if(crossOrigin)img.crossOrigin='anonymous';img.onload=()=>resolve(img);img.onerror=()=>reject(new Error(`Could not load ${src}`));img.src=src});
  const font=(weight,size,family='Urbanist')=>`${weight} ${size}px ${family}, Arial, sans-serif`;
  function fitText(ctx,text,maxWidth,startSize,minSize,weight=800,family='Space Grotesk'){let size=startSize;do{ctx.font=font(weight,size,family);if(ctx.measureText(text).width<=maxWidth)return size;size-=1}while(size>minSize);return size}
  async function drawImageContain(ctx,src,x,y,w,h,circle=false,crossOrigin=false){try{const img=await loadImage(src,crossOrigin),r=Math.min(w/img.width,h/img.height),iw=img.width*r,ih=img.height*r;if(circle){ctx.save();ctx.beginPath();ctx.arc(x+w/2,y+h/2,Math.min(w,h)/2,0,Math.PI*2);ctx.clip()}ctx.drawImage(img,x+(w-iw)/2,y+(h-ih)/2,iw,ih);if(circle)ctx.restore();return true}catch(_){return false}}
  function playerImageCandidates(){const p=$('player'),opt=p?.options[p.selectedIndex],id=opt?.value||'',slug=safeName(opt?.text||'');const out=[opt?.dataset?.image,opt?.dataset?.photo,opt?.dataset?.portrait,slug?`assets/player-images/${slug}.png`:'',id?`assets/player-images/${id}.png`:'',id?`https://d2zywfiolv4f83.cloudfront.net/img/players/155x155/${id}.png`:''];return out.filter(Boolean)}
  function drawPlayerFallback(ctx,x,y,s){ctx.save();ctx.fillStyle='#222637';ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#eef1f5';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#f5f6fa';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=font(800,22,'Space Grotesk');const initials=playerName().split(/\s+/).filter(Boolean).slice(0,2).map(n=>n[0]).join('').toUpperCase();ctx.fillText(initials,x+s/2,y+s/2+1);ctx.restore()}
  async function drawIdentityIcon(ctx){const x=255,y=25,s=82;if(isTeam()){await drawImageContain(ctx,'assets/club-logos/leeds png.png',x,y,s,s,false);return}for(const src of playerImageCandidates()){const remote=/^https?:/i.test(src);if(await drawImageContain(ctx,src,x,y,s,s,true,remote)){ctx.strokeStyle='#eef1f5';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2,0,Math.PI*2);ctx.stroke();return}}drawPlayerFallback(ctx,x,y,s)}
  function contextLine(state,matches){const period=($('plotWindow')?.textContent||'0:00 - FT').replace(/FULL MATCH/i,'0:00 - FT');const competition=state.manifest?.competition||matches[0]?.competition||'Premier League';return `${competition}   |   Leeds   |   ${period}`}
  function rangeLine(matches){return `Whole ${matches.length} match${matches.length===1?'':'es'}`}
  async function drawSvgOverlay(ctx,x,y,w,h){
    const svg=$('eventSvg');if(!svg)return;
    const clone=svg.cloneNode(true);
    clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
    clone.setAttribute('width',String(w*EXPORT_SCALE));
    clone.setAttribute('height',String(h*EXPORT_SCALE));
    const liveLines=[...svg.querySelectorAll('line')],exportLines=[...clone.querySelectorAll('line')];
    exportLines.forEach((line,i)=>{
      const source=liveLines[i];
      const liveStroke=parseFloat(source?getComputedStyle(source).strokeWidth:'');
      const fallback=parseFloat(line.getAttribute('stroke-width')||'1.5');
      const stroke=Number.isFinite(liveStroke)&&liveStroke>0?liveStroke:fallback;
      if(Number.isFinite(stroke))line.setAttribute('stroke-width',String(stroke*EXPORT_SCALE*EXPORT_LINE_STROKE_MULTIPLIER));
    });
    const blob=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob);
    try{const img=await loadImage(url);ctx.drawImage(img,x,y,w,h)}finally{URL.revokeObjectURL(url)}
  }
  async function drawFoundation(ctx){const template=await loadImage(TEMPLATE);if(template.width!==WIDTH||template.height!==HEIGHT)throw new Error(`Export template must be exactly ${WIDTH}×${HEIGHT}`);ctx.drawImage(template,0,0,WIDTH,HEIGHT)}
  function drawHeader(ctx,state,matches){const title=playerName();ctx.textAlign='center';ctx.fillStyle='#f5f6fa';fitText(ctx,title,430,25,18,800);ctx.fillText(title,540,48);ctx.fillStyle='#aab0c1';ctx.font=font(700,15);ctx.fillText(contextLine(state,matches),540,73);ctx.fillStyle='#8990a0';ctx.font=font(700,12);ctx.fillText(rangeLine(matches),540,99);ctx.textAlign='right';ctx.fillStyle='#f5f6fa';ctx.font=font(800,22,'Space Grotesk');ctx.fillText($('eventCount')?.textContent||'0',829,124);ctx.fillStyle='#7e8494';ctx.font=font(800,10);ctx.fillText('EVENTS',882,124);ctx.textAlign='left'}
  function drawAttackingDirection(ctx){ctx.save();ctx.translate(PITCH.x-14,PITCH.y+PITCH.h/2);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#f5f6fa';ctx.font=font(800,14);ctx.fillText('Attacking Direction',0,0);ctx.strokeStyle='#52eecf';ctx.fillStyle='#52eecf';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(86,0);ctx.lineTo(110,0);ctx.stroke();ctx.beginPath();ctx.moveTo(110,0);ctx.lineTo(102,-5);ctx.lineTo(102,5);ctx.closePath();ctx.fill();ctx.restore()}
  function legendNoun(label){return String(label||'').replace(/^(?:Total|Successful|Unsuccessful)\s+/i,'').trim()}
  function legendItems(){const root=$('plotLegend');if(!root)return[];const items=[];let metric='';for(const node of root.children){const text=(node.textContent||'').trim();if(!text)continue;if(node.classList?.contains('season-metric-legend-label')){metric=text;continue}let label=text,noun=legendNoun(metric);if(/^Successful$/i.test(text)&&noun)label=`Successful ${noun}`;else if(/^Unsuccessful$/i.test(text)&&noun)label=`Unsuccessful ${noun}`;if(label&&!items.includes(label))items.push(label)}return items.slice(0,12)}
  function drawLegends(ctx){const items=legendItems();if(!items.length)return;ctx.font=font(700,11);const markerW=34,gap=14,itemPad=24,maxRowW=690,rows=[];let row=[],rowW=0;for(const text of items){const itemW=markerW+gap+ctx.measureText(text).width+itemPad;if(row.length&&rowW+itemW>maxRowW){rows.push({items:row,width:rowW});row=[];rowW=0}row.push({text,width:itemW});rowW+=itemW}if(row.length)rows.push({items:row,width:rowW});const rowH=18,totalH=rows.length*rowH,startY=1208+Math.max(0,(42-totalH)/2);rows.forEach((r,ri)=>{let x=540-r.width/2;const y=startY+ri*rowH;r.items.forEach((item,ii)=>{ctx.strokeStyle=ii%2?'#aeb5c4':'#4ef0ce';ctx.fillStyle=ii%2?'#aeb5c4':'#4ef0ce';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+26,y);ctx.stroke();ctx.beginPath();ctx.arc(x+31,y,3.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#aeb5c4';ctx.fillText(item.text,x+markerW+gap,y+4);x+=item.width})})}
  async function exportPng(){
    const api=window.PitchLabSeasonPerformance,state=api?.state;if(!state)return;const btn=$('seasonExport'),old=btn?.textContent;if(btn){btn.textContent='Rendering…';btn.disabled=true}
    try{const c=document.createElement('canvas');c.width=WIDTH*EXPORT_SCALE;c.height=HEIGHT*EXPORT_SCALE;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(EXPORT_SCALE,EXPORT_SCALE);await drawFoundation(ctx);const matches=state.selected||[];drawHeader(ctx,state,matches);await drawIdentityIcon(ctx);
      const pitch=await loadImage('Pitch%20AI%20App%20Ready%20Official%20Aug%2024%202026%20V2.png');ctx.drawImage(pitch,PITCH.x,PITCH.y,PITCH.w,PITCH.h);drawAttackingDirection(ctx);const multi=(window.PitchLabSeasonMultiMetrics?.selected?.().length||1)>1;const heatActive=!multi&&!!document.querySelector('.pitch-stage.is-heatmap')&&!window.PitchLabCarry?.isCarryMetric?.($('metric')?.value);if(heatActive){const heat=document.querySelector('.pitch-heatmap-canvas');if(heat)ctx.drawImage(heat,PITCH.x,PITCH.y,PITCH.w,PITCH.h)}else await drawSvgOverlay(ctx,PITCH.x,PITCH.y,PITCH.w,PITCH.h);drawLegends(ctx);
      const a=$('dateFrom')?.value||'',b=$('dateTo')?.value||'',link=document.createElement('a');link.download=`${safeName(metricName())}-${safeName(playerName())}-${a}-${b}.png`;link.href=c.toDataURL('image/png');link.click()
    }catch(err){console.error(err);alert(`Export failed: ${err.message}`)}finally{if(btn){btn.textContent=old;btn.disabled=false}}
  }
  document.addEventListener('click',e=>{const btn=e.target?.closest?.('#seasonExport');if(!btn)return;e.preventDefault();e.stopImmediatePropagation();exportPng()},true);
  window.PitchLabSeasonExportCanvas=Object.freeze({version:'SEASON_EXPORT_STROKE_WEIGHT_V3_2026-09-09',template:TEMPLATE,width:WIDTH,height:HEIGHT,exportScale:EXPORT_SCALE,exportWidth:WIDTH*EXPORT_SCALE,exportHeight:HEIGHT*EXPORT_SCALE,brandingTop:BRANDING_TOP,pitch:PITCH,exportPng});
})();