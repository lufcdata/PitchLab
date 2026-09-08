(()=>{
  const stage=document.querySelector('.pitch-stage');
  const panel=document.querySelector('.pitch-panel');
  const controls=document.querySelector('.controls-panel');
  const metric=document.getElementById('metric');
  const team=document.getElementById('team');
  const player=document.getElementById('player');
  const from=document.getElementById('fromRange');
  const to=document.getElementById('toRange');
  if(!stage||!panel||!controls||!metric||!team||!player)return;

  const mode=document.createElement('div');
  mode.className='field pitch-map-mode';
  mode.innerHTML='<label>Map View</label><div class="pitch-map-mode__rail" role="group" aria-label="Pitch visualisation mode"><button class="pitch-map-mode__button is-active" type="button" id="eventMapMode" aria-pressed="true">Event Map</button><button class="pitch-map-mode__button" type="button" id="heatMapMode" aria-pressed="false">Heat Map</button></div>';
  const filters=controls.querySelector('.filters');
  function placeMode(){
    const matchField=document.getElementById('pitchlabMatch')?.closest('.field');
    if(matchField){matchField.insertAdjacentElement('afterend',mode);return true;}
    if(filters&&mode.parentNode!==filters)filters.prepend(mode);
    else if(!filters&&!mode.parentNode)stage.before(mode);
    return false;
  }
  if(!placeMode()){
    let tries=0;const timer=setInterval(()=>{tries++;if(placeMode()||tries>30)clearInterval(timer)},100);
  }

  const canvas=document.createElement('canvas');
  canvas.className='pitch-heatmap-canvas';
  canvas.setAttribute('aria-hidden','true');
  stage.appendChild(canvas);

  const key=document.createElement('div');
  key.className='pitch-heatmap-key';
  key.innerHTML='<span>Low density</span><i class="pitch-heatmap-key__ramp"></i><span>High density</span>';
  stage.after(key);

  const eventButton=document.getElementById('eventMapMode');
  const heatButton=document.getElementById('heatMapMode');
  let active=false;
  let raf=0;

  const stops=[
    [0.00,[30,3,5]],[0.10,[62,7,8]],[0.24,[116,12,12]],[0.43,[194,25,20]],
    [0.61,[255,55,37]],[0.78,[255,126,55]],[0.91,[255,192,75]],[1.00,[255,235,111]]
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
    return{w,h};
  }

  function densityProfile(count,size){
    if(count<15)return{radius:size*.205,alpha:.30,threshold:.006,gamma:.46};
    if(count<40)return{radius:size*.178,alpha:.20,threshold:.008,gamma:.47};
    if(count<100)return{radius:size*.155,alpha:.135,threshold:.010,gamma:.48};
    if(count<220)return{radius:size*.135,alpha:.092,threshold:.012,gamma:.49};
    return{radius:size*.118,alpha:.067,threshold:.014,gamma:.50};
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
    const radius=Math.max(30,profile.radius);
    for(const e of list){
      const px=(1-Number(e.y)/100)*w;
      const py=(1-Number(e.x)/100)*h;
      const a=profile.alpha;
      const g=d.createRadialGradient(px,py,0,px,py,radius);
      g.addColorStop(0,`rgba(255,255,255,${a})`);
      g.addColorStop(.12,`rgba(255,255,255,${a*.985})`);
      g.addColorStop(.30,`rgba(255,255,255,${a*.88})`);
      g.addColorStop(.52,`rgba(255,255,255,${a*.62})`);
      g.addColorStop(.72,`rgba(255,255,255,${a*.34})`);
      g.addColorStop(.88,`rgba(255,255,255,${a*.12})`);
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
      out.data[i]=c[0];out.data[i+1]=c[1];out.data[i+2]=c[2];
      out.data[i+3]=Math.round(255*Math.min(.89,.035+t*.855));
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
  document.addEventListener('pitchlab:match-loaded',()=>{placeMode();schedule()});
  const count=document.getElementById('eventCount');
  if(count)new MutationObserver(schedule).observe(count,{subtree:true,childList:true,characterData:true});
  window.addEventListener('resize',schedule,{passive:true});

  window.PitchLabHeatMap=Object.freeze({version:'HEATMAP_GLOW_V5_1_2026-09-09',render:schedule,setMode});
})();