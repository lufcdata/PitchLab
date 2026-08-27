(()=>{
  const MATCH_STATS_ONLY=Object.freeze(['matchStats']);
  const teamDef=(label,calculatorKey,golden=null)=>Object.freeze({
    label,
    kind:'team',
    surfaces:MATCH_STATS_ONLY,
    calculatorKey,
    golden:golden?Object.freeze(golden):null,
    goldStatus:'GOLD_LOCKED',
    pitchEvents:false,
    metricLeaders:false,
    matchStats:true
  });

  // GOLD METRIC BIBLE — TEAM METRICS
  // Classification/scope is canonical here. Existing Match Stats calculators remain untouched.
  const teamRegistry=Object.freeze({
    possession:teamDef('Possession','possession'),
    ppda:teamDef('PPDA','ppda_custom',[12.9,8.8]),
    ten_pass_sequences:teamDef('10+ Pass Sequences','ten_pass_sequences_custom',[6,7]),
    pressed_sequences:teamDef('Pressed Sequences','pressed_sequences_custom',[2,16])
  });

  const bible=window.PitchLabMetricBible;
  if(!bible){
    console.error('[Gold Metric Bible] Base registry missing; Team Metrics were not attached.');
    return;
  }

  Object.defineProperties(bible,{
    name:{value:'Gold Metric Bible',enumerable:true,configurable:false,writable:false},
    teamRegistry:{value:teamRegistry,enumerable:true,configurable:false,writable:false},
    teamKeys:{value:Object.freeze(Object.keys(teamRegistry)),enumerable:true,configurable:false,writable:false},
    metricType:{value:key=>teamRegistry[key]?'team':(bible.canonicalRegistry?.[key]?'event':null),enumerable:true,configurable:false,writable:false},
    allowedOn:{value:(key,surface)=>{
      const def=teamRegistry[key]||bible.canonicalRegistry?.[key];
      return !!def?.surfaces?.includes(surface);
    },enumerable:true,configurable:false,writable:false}
  });

  document.dispatchEvent(new CustomEvent('pitchlab:gold-metric-bible-team-ready',{
    detail:{teamKeys:bible.teamKeys}
  }));
})();