(()=>{
  const stage=document.querySelector('.pitch-stage');
  const panel=document.querySelector('.pitch-panel');
  const metric=document.getElementById('metric');
  const team=document.getElementById('team');
  const player=document.getElementById('player');
  const from=document.getElementById('fromRange');
  const to=document.getElementById('toRange');
  if(!stage||!panel||!metric||!team||!player)return;

  const mode=document.createElement('div');
  mode.className='pitch-map-mode';
  mode.innerHTML='<div class="pitch-map-mode__rail" role="group" aria-label="Pitch visualisation mode"><button class="pitch-map-mode__button is-active" type="button" id="eventMapMode" aria-pressed="true">Event Map</button><button class="pitch-map-mode__button" type="button" id="heatMapMode" aria-pressed="false">Heat Map</button></div>';
  stage.before(mode);

  const canvas=document.createElement('canvas');
  canvas.className='pitch-heatmap-canvas';
  canvas.setAttribute('aria-hidden','true');
  stage.appendChild(canvas);

  const lines=document.createElementNS('http://www.w3.org/2000/svg','svg');
  lines.setAttribute('class','pitch-heatmap-lines');
  lines.setAttribute('viewBox','0 0 68 105');
  lines.setAttribute('preserveAspectRatio','none');
  lines.setAttribute('aria-hidden','true');
  lines.innerHTML=`
    <g fill="none" stroke="rgba(255,255,255,.68)" stroke-width=".22" vector-effect="non-scaling-stroke">
      <rect x=".12" y=".12" width="67.76" height="104.76"/>
      <line x1=".12" y1="52.5" x2="67.88" y2="52.5"/>
      <circle cx="34" cy="52.5" r="9.15"/>
      <rect x="13.85" y=".12" width="40.3" height="16.5"/>
      <rect x="24.84" y=".12" width="18.32" height="5.5"/>
      <rect x="13.85" y="88.38" width="40.3" height="16.5"/>
      <rect x="24.84" y="99.38" width="18.32" height="5.5"/>
      <path d="M25.7 16.62 A9.15 9.15 0 0 0 42.3 16.62"/>
      <path d="M25.7 88.38 A9.15 9.15 0 0 1 42.3 88.38"/>
    </g>
    <g fill="rgba(255,255,255,.78)">
      <circle cx="34" cy="52.5" r=".28"/><circle cx="34" cy="11" r=".28"/><circle cx="34" cy="94" r=".28"/>
    </g>`;
  stage.appendChild(lines);

  const key=document.createElement('div');
  key.className='pitch-heatmap-key';
  key.innerHTML='<span>Low density</span><i class="pitch-heatmap-key__ramp"></i><span>High density</span>';
  stage.after(key);

  const eventButton=document.getElementById('eventMapMode');
  const heatButton=document.getElementById('heatMapMode');
  let active=false;
  let raf=0;

  const stops=[
    [0.00,[42,0,7]],
    [0.16,[92,0,9]],
    [0.34,[170,8,0]],
    [0.54,[244,32,0]],
    [0.73,[255,108,0]],
    [0.88,[255,186,31]],
    [1.00,[255,247,154]]
  ];

  function mix(a,b,t){return Math.round(a+(b-a)*t)}
  function colourAt(t){
    const v=Math.max(0,Math.min(1,t));
    for(let i=1;i<stops.length;i++){
      if(v<=stops[i][0]){
        const [p0,c0]=stops[i-1],[p1,c1]=stops[i],u=(v-p0)/(p1-p0||1);
        return[mix(c0[0],c1[0],u),mix(c0[1],c1[1],u),mix(c0[2],c1[2],u)];
      }
    }
    return stops[stops.length-1][1];
  }

  function sourceEvents(){
    if(typeof events==='undefined'||!Array.isArray(events))return[];
    const key=metric.value;
    if(window.PitchLabCarry?.isCarryMetric?.(key))return[];
    const bible=window.PitchLabMetricBible;
    let list;
    if(bible?.metricEvents){
      list=bible.metricEvents(key,events,team.value);
    }else{
      const fn=(typeof FILTERS!=='undefined'&&FILTERS[key])||(()=>false);
      const scoped=window.PitchLabCanonicalTime?.windowEvents?window.PitchLabCanonicalTime.windowEvents(events):events;
      list=scoped.filter(fn);
      if(team.value!=='Both'&&typeof teamName==='function')list=list.filter(e=>teamName(e)===team.value);
    }
    if(player.value!=='all')list=list.filter(e=>String(e?.playerId)===String(player.value));
    return list.filter(e=>Number.isFinite(Number(e?.x))&&Number.isFinite(Number(e?.y)));
  }

  function resize(){
    const ratio=Math.max(1,Math.min(2,window.devicePixelRatio||1));
    const rect=stage.getBoundingClientRect();
    const w=Math.max(220,Math.round(rect.width*ratio));
    const h=Math.max(340,Math.round(rect.height*ratio));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
    return{w,h,ratio};
  }

  function densityProfile(count,size){
    if(count<15)return{radius:size*.125,alpha:.42,threshold:.024,gamma:.61};
    if(count<40)return{radius:size*.108,alpha:.29,threshold:.032,gamma:.62};
    if(count<100)return{radius:size*.092,alpha:.20,threshold:.041,gamma:.63};
    if(count<220)return{radius:size*.080,alpha:.155,threshold:.050,gamma:.64};
    return{radius:size*.072,alpha:.125,threshold:.058,gamma:.65};
  }

  function renderHeat(){
    if(!active)return;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if(!ctx)return;
    const {w,h}=resize();
    ctx.clearRect(0,0,w,h);
    const list=sourceEvents();
    if(!list.length)return;

    const density=document.createElement('canvas');
    density.width=w;density.height=h;
    const d=density.getContext('2d',{willReadFrequently:true});
    d.clearRect(0,0,w,h);
    d.globalCompositeOperation='lighter';

    const profile=densityProfile(list.length,Math.min(w,h));
    const radius=Math.max(22,profile.radius);
    for(const e of list){
      const px=(1-Number(e.y)/100)*w;
      const py=(1-Number(e.x)/100)*h;
      const a=profile.alpha;
      const g=d.createRadialGradient(px,py,0,px,py,radius);
      g.addColorStop(0,`rgba(255,255,255,${a})`);
      g.addColorStop(.16,`rgba(255,255,255,${a*.96})`);
      g.addColorStop(.36,`rgba(255,255,255,${a*.72})`);
      g.addColorStop(.60,`rgba(255,255,255,${a*.40})`);
      g.addColorStop(.82,`rgba(255,255,255,${a*.13})`);
      g.addColorStop(1,'rgba(255,255,255,0)');
      d.fillStyle=g;
      d.fillRect(px-radius,py-radius,radius*2,radius*2);
    }

    const src=d.getImageData(0,0,w,h),out=ctx.createImageData(w,h);
    let max=0;
    for(let i=3;i<src.data.length;i+=4)if(src.data[i]>max)max=src.data[i];
    if(!max)return;
    for(let i=0;i<src.data.length;i+=4){
      let t=src.data[i+3]/max;
      if(t<=profile.threshold)continue;
      t=(t-profile.threshold)/(1-profile.threshold);
      t=Math.pow(Math.max(0,Math.min(1,t)),profile.gamma);
      const c=colourAt(t);
      out.data[i]=c[0];
      out.data[i+1]=c[1];
      out.data[i+2]=c[2];
      out.data[i+3]=Math.round(255*Math.min(.96,.12+t*.86));
    }
    ctx.putImageData(out,0,0);
  }

  function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(renderHeat)}
  function setMode(heat){
    active=!!heat;
    stage.classList.toggle('is-heatmap',active);
    panel.classList.toggle('has-heatmap-active',active);
    eventButton.classList.toggle('is-active',!active);
    heatButton.classList.toggle('is-active',active);
    eventButton.setAttribute('aria-pressed',String(!active));
    heatButton.setAttribute('aria-pressed',String(active));
    if(active)schedule();
  }

  eventButton.addEventListener('click',()=>setMode(false));
  heatButton.addEventListener('click',()=>setMode(true));
  [metric,team,player,from,to].forEach(el=>{el?.addEventListener('input',schedule);el?.addEventListener('change',schedule)});
  document.addEventListener('pitchlab:canonical-time-ready',schedule);
  document.addEventListener('pitchlab:match-loaded',schedule);
  const count=document.getElementById('eventCount');
  if(count)new MutationObserver(schedule).observe(count,{subtree:true,childList:true,characterData:true});
  window.addEventListener('resize',schedule,{passive:true});

  window.PitchLabHeatMap=Object.freeze({version:'HEATMAP_GLOW_V2_2026-09-06',render:schedule,setMode});
})();
