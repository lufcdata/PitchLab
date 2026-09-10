(()=>{
  const periodName=e=>String(e?.period?.displayName??e?.period?.name??e?.period??'').toLowerCase().replace(/[\s_-]/g,'');
  const nonPlaying=new Set(['prematch','postgame']);
  let lastSource=null,lastLength=-1;

  function apply(){
    if(typeof events==='undefined'||!Array.isArray(events)||!events.length)return;
    if(events===lastSource&&events.length===lastLength)return;
    const filtered=events.filter(e=>!nonPlaying.has(periodName(e)));
    if(filtered.length!==events.length){
      events=filtered;
      if(typeof raw!=='undefined'&&raw&&Array.isArray(raw.events))raw.events=filtered;
      document.dispatchEvent(new CustomEvent('pitchlab:playing-events-ready',{detail:{events:filtered,removed:Math.max(0,lastLength-filtered.length)}}));
    }
    lastSource=events;lastLength=events.length;
  }

  document.addEventListener('pitchlab:match-loaded',()=>setTimeout(apply,0));
  setInterval(apply,120);
  apply();
})();