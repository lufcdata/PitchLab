(()=>{
  const bible=window.PitchLabMetricBible;
  if(!bible){console.error('[PitchLab] Metric Bible missing; corner delivery definition not attached.');return;}
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const hq=(e,name)=>(e?.qualifiers||[]).some(q=>String(dn(q?.type)||'').toLowerCase()===String(name).toLowerCase());
  const qv=(e,name)=>{const q=(e?.qualifiers||[]).find(q=>String(dn(q?.type)||'').toLowerCase()===String(name).toLowerCase());return q?.value??null;};
  const corner=e=>et(e)==='pass'&&hq(e,'CornerTaken');
  const central=e=>corner(e)&&String(qv(e,'Zone')||'').toLowerCase()==='center';
  const sixYard=e=>corner(e)&&Number(e?.endX)>=94.2&&Number(e?.endX)<=100&&Number(e?.endY)>=36.8&&Number(e?.endY)<=63.2;
  const chance=e=>corner(e)&&hq(e,'KeyPass');
  const assist=e=>corner(e)&&(e?.assist===true||e?.isAssist===true||hq(e,'IntentionalGoalAssist'));
  const surfaces=Object.freeze(['pitch','leaders','matchStats']);
  const pending=(label,definition,observed,test)=>Object.freeze({label,kind:'event',surfaces,status:'AUTHORITATIVE_DEFINITION_PENDING_GOLD_CONTROL',definition,observedFixtureCounts:Object.freeze(observed),test});
  const defs=Object.freeze({
    corners_central:pending('Central Corners','CornerTaken Pass carrying provider Zone=Center qualifier.',{forest:3,leeds:2},central),
    corners_6yd:pending('Corners - 6 Yard Box','CornerTaken Pass ending inside the established 6-yard-box geometry (endX 94.2-100, endY 36.8-63.2).',{forest:0,leeds:1},sixYard),
    corner_chances:pending('Corner - Chances Created','CornerTaken Pass carrying provider KeyPass qualifier.',{forest:1,leeds:0},chance),
    assists_corners:pending('Assists - From Corners','CornerTaken Pass carrying an explicit goal-assist signal.',{forest:0,leeds:0},assist)
  });
  if(typeof FILTERS!=='undefined')for(const [k,d] of Object.entries(defs))FILTERS[k]=d.test;
  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,...defs});
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),...Object.keys(defs)])]);

  // These legacy labels were backed only by an invented coordinate classifier, not provider taxonomy.
  // Hide them until a genuine provider definition/control is recovered. Central remains because Zone=Center is explicit.
  const retired=Object.freeze(['corners_short','corners_near','corners_far','corners_overhit']);
  const select=document.getElementById('metric');
  if(select)for(const key of retired)select.querySelector(`option[value="${key}"]`)?.remove();

  window.PitchLabCornerDeliveryDefinition=Object.freeze({
    version:'CORNER_DELIVERY_PROVIDER_TAXONOMY_V1_2026-08-28',defs,retired,
    forestLeedsEvidence:Object.freeze({total:Object.freeze({forest:3,leeds:2}),zoneCenter:Object.freeze({forest:3,leeds:2}),sixYard:Object.freeze({forest:0,leeds:1}),chances:Object.freeze({forest:1,leeds:0}),assists:Object.freeze({forest:0,leeds:0})})
  });
  document.dispatchEvent(new CustomEvent('pitchlab:corner-delivery-definition-ready',{detail:{version:window.PitchLabCornerDeliveryDefinition.version,keys:Object.freeze(Object.keys(defs)),retired}}));
})();
