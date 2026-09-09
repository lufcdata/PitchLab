(()=>{
  const TEMPLATE='assets/export/Full Canvas.png';
  const WIDTH=1080,HEIGHT=1350,BRANDING_TOP=1230;
  const PITCH={x:191,y:130,w:694,h:1074};
  const $=id=>document.getElementById(id);
  const fmtDate=s=>{const d=new Date(`${s}T12:00:00`);return Number.isNaN(d.getTime())?s:d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})};
  const safeName=s=>String(s||'season-performance').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const playerName=()=>{const p=$('player');return p?.value==='all'?'Leeds':(p?.options[p.selectedIndex]?.text||'Leeds')};
  const isTeam=()=>$('player')?.value==='all';
  const metricName=()=>window.PitchLabSeasonMultiMetrics?.label?.()||(()=>{const m=$('metric');return m?.options[m.selectedIndex]?.text||'Metric'})();
  const loadImage=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error(`Could not load ${src}`));img.src=src});
  const font=(weight,size,family='Urbanist')=>`${weight} ${size}px ${family}, Arial, sans-serif`;
  function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
  function fitText(ctx,text,maxWidth,startSize,minSize,weight=800,family='Space Grotesk'){let size=startSize;do{ctx.font=font(weight,size,family);if(ctx.measureText(text).width<=maxWidth)return size;size-=1}while(size>minSize);return size}
  async function drawImageContain(ctx,src,x,y,w,h,circle=false){try{const img=await loadImage(src),r=Math.min(w/img.width,h/img.height),iw=img.width*r,ih=img.height*r;if(circle){ctx.save();ctx.beginPath();ctx.arc(x+w/2,y+h/2,Math.min(w,h)/2,0,Math.PI*2);ctx.clip()}ctx.drawImage(img,x+(w-iw)/2,y+(h-ih)/2,iw,ih);if(circle)ctx.restore();return true}catch(_){return false}}
  function playerImageSrc(){const p=$('player'),opt=p?.options[p.selectedIndex];return opt?.dataset?.image||opt?.dataset?.photo||opt?.dataset?.portrait||''}
  async function drawIdentityIcon(ctx){const x=271,y=29,s=66;if(isTeam()){await drawImageContain(ctx,'assets/club-logos/leeds png.png',x,y,s,s,false);return}const src=playerImageSrc();if(src&&await drawImageContain(ctx,src,x,y,s,s,true)){ctx.strokeStyle='#eef1f5';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2,0,Math.PI*2);ctx.stroke();return}await drawImageContain(ctx,'assets/club-logos/leeds png.png',x,y,s,s,false)}
  function contextLine(state,matches){const period=($('plotWindow')?.textContent||'0:00 - FT').replace(/FULL MATCH/i,'0:00 - FT');const competition=state.manifest?.competition||matches[0]?.competition||'Premier League';return `${competition}   |   Leeds   |   ${period}`}
  function rangeLine(matches){return `Whole ${matches.length} match${matches.length===1?'':'es'}`}
  async function drawSvgOverlay(ctx,x,y,w,h){const svg=$('eventSvg');if(!svg)return;const clone=svg.cloneNode(true);clone.setAttribute('xmlns','http://www.w3.org/2000/svg');clone.setAttribute('width',String(w));clone.setAttribute('height',String(h));const blob=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob);try{const img=await loadImage(url);ctx.drawImage(img,x,y,w,h)}finally{URL.revokeObjectURL(url)}}
  async function drawFoundation(ctx){const template=await loadImage(TEMPLATE);if(template.width!==WIDTH||template.height!==HEIGHT)throw new Error(`Export template must be exactly ${WIDTH}×${HEIGHT}`);ctx.drawImage(template,0,0,WIDTH,HEIGHT)}
  function drawHeader(ctx,state,matches){const title=playerName();ctx.textAlign='center';ctx.fillStyle='#f5f6fa';fitText(ctx,title,430,25,18,800);ctx.fillText(title,540,49);ctx.fillStyle='#aab0c1';ctx.font=font(700,15);ctx.fillText(contextLine(state,matches),540,82);ctx.fillStyle='#8990a0';ctx.font=font(700,12);ctx.fillText(rangeLine(matches),540,105);ctx.textAlign='right';ctx.fillStyle='#f5f6fa';ctx.font=font(800,22,'Space Grotesk');ctx.fillText($('eventCount')?.textContent||'0',829,124);ctx.fillStyle='#7e8494';ctx.font=font(800,10);ctx.fillText('EVENTS',882,124);ctx.textAlign='left'}
  function legendItems(){const root=$('plotLegend');if(!root)return[];const items=[];for(const node of root.children){const text=(node.textContent||'').trim();if(text&&!items.includes(text))items.push(text)}return items.slice(0,12)}
  function drawLegends(ctx){const items=legendItems();if(!items.length)return;const y0=1218,rowH=17,colW=180,startX=196;ctx.font=font(700,8);items.forEach((text,i)=>{const col=i%4,row=Math.floor(i/4),x=startX+col*colW,y=y0+row*rowH;ctx.strokeStyle=i%2?'#9ba3b3':'#4ef0ce';ctx.fillStyle=i%2?'#9ba3b3':'#4ef0ce';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+25,y);ctx.stroke();ctx.beginPath();ctx.arc(x+30,y,3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8d94a4';ctx.fillText(text,x+38,y+3)})}
  async function exportPng(){
    const api=window.PitchLabSeasonPerformance,state=api?.state;if(!state)return;const btn=$('seasonExport'),old=btn?.textContent;if(btn){btn.textContent='Rendering…';btn.disabled=true}
    try{const c=document.createElement('canvas');c.width=WIDTH;c.height=HEIGHT;const ctx=c.getContext('2d');await drawFoundation(ctx);const matches=state.selected||[];drawHeader(ctx,state,matches);await drawIdentityIcon(ctx);
      const pitch=await loadImage('Pitch%20AI%20App%20Ready%20Official%20Aug%2024%202026%20V2.png');ctx.drawImage(pitch,PITCH.x,PITCH.y,PITCH.w,PITCH.h);const multi=(window.PitchLabSeasonMultiMetrics?.selected?.().length||1)>1;const heatActive=!multi&&!!document.querySelector('.pitch-stage.is-heatmap')&&!window.PitchLabCarry?.isCarryMetric?.($('metric')?.value);if(heatActive){const heat=document.querySelector('.pitch-heatmap-canvas');if(heat)ctx.drawImage(heat,PITCH.x,PITCH.y,PITCH.w,PITCH.h)}else await drawSvgOverlay(ctx,PITCH.x,PITCH.y,PITCH.w,PITCH.h);drawLegends(ctx);
      const a=$('dateFrom')?.value||'',b=$('dateTo')?.value||'',link=document.createElement('a');link.download=`${safeName(metricName())}-${safeName(playerName())}-${a}-${b}.png`;link.href=c.toDataURL('image/png');link.click()
    }catch(err){console.error(err);alert(`Export failed: ${err.message}`)}finally{if(btn){btn.textContent=old;btn.disabled=false}}
  }
  document.addEventListener('click',e=>{const btn=e.target?.closest?.('#seasonExport');if(!btn)return;e.preventDefault();e.stopImmediatePropagation();exportPng()},true);
  window.PitchLabSeasonExportCanvas=Object.freeze({version:'SEASON_EXPORT_REFERENCE_LAYOUT_V2_2026-09-09',template:TEMPLATE,width:WIDTH,height:HEIGHT,brandingTop:BRANDING_TOP,pitch:PITCH,exportPng});
})();