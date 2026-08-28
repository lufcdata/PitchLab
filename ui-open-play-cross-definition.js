(()=>{
  const bible=window.PitchLabMetricBible;
  if(!bible){
    console.error('[PitchLab] Metric Bible missing; Open Play Cross definition not attached.');
    return;
  }
  const crossDef=bible.canonicalRegistry?.crosses;
  const accurateDef=bible.canonicalRegistry?.accurate_crosses;
  const inaccurateDef=bible.canonicalRegistry?.inaccurate_crosses;
  const setPlaySuccessDef=bible.canonicalRegistry?.set_play_crosses_success;
  const setPlayFailDef=bible.canonicalRegistry?.set_play_crosses_unsuccess;
  if(!crossDef||!accurateDef||!inaccurateDef||!setPlaySuccessDef||!setPlayFailDef){
    console.error('[PitchLab] Gold Cross components missing; Open Play Cross definition not attached.');
    return;
  }

  const isSetPlayCross=e=>setPlaySuccessDef.test(e)||setPlayFailDef.test(e);
  const isOpenPlayCross=e=>crossDef.test(e)&&!isSetPlayCross(e);
  const isAccurateOpenPlayCross=e=>accurateDef.test(e)&&!isSetPlayCross(e);
  const isInaccurateOpenPlayCross=e=>inaccurateDef.test(e)&&!isSetPlayCross(e);
  const surfaces=Object.freeze(['pitch','leaders','matchStats']);
  const derived=(label,components,observed,test)=>Object.freeze({
    label,kind:'event',surfaces,status:'DERIVED_FROM_GOLD_COMPONENTS',components:Object.freeze(components),
    observedFixtureCounts:Object.freeze(observed),test
  });

  const defs=Object.freeze({
    open_play_crosses:derived('Open-Play Crosses',['crosses','set_play_crosses_success','set_play_crosses_unsuccess'],{forest:13,leeds:5},isOpenPlayCross),
    accurate_open_play_crosses:derived('Accurate Open-Play Crosses',['accurate_crosses','set_play_crosses_success'],{forest:3,leeds:2},isAccurateOpenPlayCross),
    inaccurate_open_play_crosses:derived('Inaccurate Open-Play Crosses',['inaccurate_crosses','set_play_crosses_unsuccess'],{forest:10,leeds:3},isInaccurateOpenPlayCross)
  });

  if(typeof FILTERS!=='undefined'){
    for(const [key,def] of Object.entries(defs))FILTERS[key]=def.test;
  }
  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,...defs});
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),...Object.keys(defs)])]);

  const sel=document.getElementById('metric');
  if(sel){
    let group=[...sel.querySelectorAll('optgroup')].find(g=>g.label==='Passing');
    if(!group){group=document.createElement('optgroup');group.label='Passing';sel.appendChild(group)}
    const ensure=(value,text)=>{let o=sel.querySelector(`option[value="${value}"]`);if(!o){o=document.createElement('option');o.value=value;group.appendChild(o)}o.textContent=text};
    ensure('open_play_crosses','Open-Play Crosses');
    ensure('accurate_open_play_crosses','Accurate Open-Play Crosses');
    ensure('inaccurate_open_play_crosses','Inaccurate Open-Play Crosses');
  }

  window.PitchLabOpenPlayCrossDefinition=Object.freeze({
    version:'OPEN_PLAY_CROSS_DERIVED_V1_2026-08-28',defs,
    observations:Object.freeze({total:Object.freeze({forest:13,leeds:5}),accurate:Object.freeze({forest:3,leeds:2}),inaccurate:Object.freeze({forest:10,leeds:3})})
  });
  document.dispatchEvent(new CustomEvent('pitchlab:open-play-cross-definition-ready',{detail:{version:window.PitchLabOpenPlayCrossDefinition.version}}));
})();
