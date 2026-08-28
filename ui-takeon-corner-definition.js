(()=>{
  const bible=window.PitchLabMetricBible;
  if(!bible){
    console.error('[PitchLab] Metric Bible missing; Take-On/Corner outcome family not attached.');
    return;
  }
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const outcome=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const hq=(e,name)=>(e?.qualifiers||[]).some(q=>String(dn(q?.type)||'')===name);
  const success=e=>outcome(e)==='successful';
  const surfaces=Object.freeze(['pitch','leaders','matchStats']);
  const gold=(label,controls,test,definition)=>Object.freeze({label,kind:'event',surfaces,status:'GOLD_LOCKED',controls:Object.freeze(controls),definition,test});
  const takeOn=e=>et(e)==='takeon';
  const corner=e=>et(e)==='pass'&&hq(e,'CornerTaken');

  const defs=Object.freeze({
    takeons:gold('Total Take-Ons',{forest:22,leeds:12},takeOn,'WhoScored/Opta TakeOn event.'),
    takeons_success:gold('Successful Take-Ons',{forest:10,leeds:7},e=>takeOn(e)&&success(e),'TakeOn event with successful outcome.'),
    takeons_unsuccess:gold('Unsuccessful Take-Ons',{forest:12,leeds:5},e=>takeOn(e)&&!success(e),'TakeOn event with unsuccessful outcome.'),
    corners_success:gold('Successful Corners',{forest:1,leeds:1},e=>corner(e)&&success(e),'CornerTaken Pass with successful outcome.'),
    corners_unsuccess:gold('Unsuccessful Corners',{forest:2,leeds:1},e=>corner(e)&&!success(e),'CornerTaken Pass with unsuccessful outcome.')
  });

  if(typeof FILTERS!=='undefined')for(const [key,def] of Object.entries(defs))FILTERS[key]=def.test;
  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,...defs});
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),...Object.keys(defs)])]);

  window.PitchLabTakeOnCornerDefinition=Object.freeze({
    version:'TAKEON_CORNER_OUTCOME_V1_2026-08-28',defs,
    embeddedOptaControls:Object.freeze({
      takeons:Object.freeze({total:Object.freeze({forest:22,leeds:12}),won:Object.freeze({forest:10,leeds:7}),lost:Object.freeze({forest:12,leeds:5})}),
      corners:Object.freeze({total:Object.freeze({forest:3,leeds:2}),accurate:Object.freeze({forest:1,leeds:1}),inaccurate:Object.freeze({forest:2,leeds:1})})
    })
  });
  document.dispatchEvent(new CustomEvent('pitchlab:takeon-corner-definition-ready',{
    detail:{version:window.PitchLabTakeOnCornerDefinition.version,keys:Object.freeze(Object.keys(defs))}
  }));
})();
