(()=>{
  const bible=window.PitchLabMetricBible;
  if(!bible){console.error('[PitchLab] Metric Bible missing; corner delivery definition not attached.');return;}
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const hq=(e,name)=>(e?.qualifiers||[]).some(q=>String(dn(q?.type)||'').toLowerCase()===String(name).toLowerCase());
  const qv=(e,name)=>{const q=(e?.qualifiers||[]).find(q=>String(dn(q?.type)||'').toLowerCase()===String(name).toLowerCase());return q?.value??null;};
  const corner=e=>et(e)==='pass'&&hq(e,'CornerTaken');
  // Preserve PitchLab's established delivery classifier. These are PitchLab-derived spatial classes,
  // not provider Zone labels, and remain deliberately distinct from the explicit Zone=Center metric.
  const cornerClass=e=>{
    if(!corner(e))return '';
    if(!hq(e,'Cross'))return 'short';
    const x=Number(e?.endX),y=Number(e?.endY),oy=Number(e?.y);
    if(!(x>=85))return 'overhit';
    if(y>=43&&y<=57)return 'central';
    if(oy<50&&y>=30&&y<43)return 'near';
    if(oy>=50&&y>57&&y<=70)return 'near';
    if(oy<50&&y>57&&y<=70)return 'far';
    if(oy>=50&&y>=30&&y<43)return 'far';
    return 'overhit';
  };
  const providerCentral=e=>corner(e)&&String(qv(e,'Zone')||'').toLowerCase()==='center';
  const sixYard=e=>corner(e)&&Number(e?.endX)>=94.2&&Number(e?.endX)<=100&&Number(e?.endY)>=36.8&&Number(e?.endY)<=63.2;
  const chance=e=>corner(e)&&hq(e,'KeyPass');
  const assist=e=>corner(e)&&(e?.assist===true||e?.isAssist===true||hq(e,'IntentionalGoalAssist'));
  const surfaces=Object.freeze(['pitch','leaders','matchStats']);
  const derived=(label,definition,test)=>Object.freeze({label,kind:'event',surfaces,status:'PITCHLAB_DERIVED_SPATIAL_DEFINITION',definition,test});
  const pending=(label,definition,observed,test)=>Object.freeze({label,kind:'event',surfaces,status:'AUTHORITATIVE_DEFINITION_PENDING_GOLD_CONTROL',definition,observedFixtureCounts:Object.freeze(observed),test});
  const defs=Object.freeze({
    corners_short:derived('Short Corners','PitchLab established classifier: CornerTaken Pass without Cross qualifier.',e=>cornerClass(e)==='short'),
    corners_near:derived('Near Post Corners','PitchLab established coordinate classifier using delivery endY relative to the taking side.',e=>cornerClass(e)==='near'),
    corners_central:derived('Central Corners','PitchLab established coordinate classifier: crossed CornerTaken ending endX >= 85 and endY 43-57.',e=>cornerClass(e)==='central'),
    corners_far:derived('Far Post Corners','PitchLab established coordinate classifier using delivery endY opposite the taking side.',e=>cornerClass(e)==='far'),
    corners_overhit:derived('Overhit Corners','PitchLab established classifier: crossed CornerTaken ending before x=85 or outside the near/central/far delivery bands.',e=>cornerClass(e)==='overhit'),
    corners_6yd:pending('Corners - 6 Yard Box','CornerTaken Pass ending inside the established 6-yard-box geometry (endX 94.2-100, endY 36.8-63.2).',{forest:0,leeds:1},sixYard),
    corner_chances:pending('Corner - Chances Created','CornerTaken Pass carrying provider KeyPass qualifier.',{forest:1,leeds:0},chance),
    assists_corners:pending('Assists - From Corners','CornerTaken Pass carrying an explicit goal-assist signal.',{forest:0,leeds:0},assist)
  });
  if(typeof FILTERS!=='undefined')for(const [k,d] of Object.entries(defs))FILTERS[k]=d.test;
  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,...defs});
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),...Object.keys(defs)])]);
  window.PitchLabCornerDeliveryDefinition=Object.freeze({
    version:'CORNER_DELIVERY_PITCHLAB_SPATIAL_V2_2026-08-28',defs,cornerClass,providerCentral,
    forestLeedsEvidence:Object.freeze({total:Object.freeze({forest:3,leeds:2}),providerZoneCenter:Object.freeze({forest:3,leeds:2}),sixYard:Object.freeze({forest:0,leeds:1}),chances:Object.freeze({forest:1,leeds:0}),assists:Object.freeze({forest:0,leeds:0})})
  });
  document.dispatchEvent(new CustomEvent('pitchlab:corner-delivery-definition-ready',{detail:{version:window.PitchLabCornerDeliveryDefinition.version,keys:Object.freeze(Object.keys(defs))}}));
})();
