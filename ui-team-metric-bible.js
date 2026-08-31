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
  const compositeDef=(label,components)=>Object.freeze({
    label,
    kind:'composite',
    surfaces:MATCH_STATS_ONLY,
    components:Object.freeze([...components]),
    status:'DERIVED_FROM_GOLD_COMPONENTS',
    pitchEvents:false,
    metricLeaders:false,
    matchStats:true,
    deduplicate:false
  });

  // GOLD METRIC BIBLE — TEAM METRICS
  // Classification/scope is canonical here. Existing Match Stats calculators remain untouched.
  const teamRegistry=Object.freeze({
    possession:teamDef('Possession','possession'),
    ppda:teamDef('PPDA','ppda_custom',[12.9,8.8]),
    ten_pass_sequences:teamDef('10+ Pass Sequences','ten_pass_sequences_custom',[6,7]),
    pressed_sequences:teamDef('Pressed Sequences','pressed_sequences_custom',[2,16])
  });

  // COMPOSITE ACTIONS — authoritative component lists only.
  // These are arithmetic sums of existing Gold metrics. Overlapping events are
  // intentionally NOT deduplicated because each requested component contributes
  // independently to the composite total.
  const compositeRegistry=Object.freeze({
    defensive_actions:compositeDef('Defensive Actions',[
      'tackles_won','tackles_lost','interceptions','clearances','shots_blocked',
      'recoveries','ground_duels_won','def_aerial_duels_won','def_aerial_duels_lost'
    ]),
    attacking_actions:compositeDef('Attacking Actions',[
      'shots','final_third_passes','takeons_success','takeons_unsuccess','progressive',
      'through_balls','att_aerial_duels_won','att_aerial_duels_lost','high_turnovers'
    ])
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
    compositeRegistry:{value:compositeRegistry,enumerable:true,configurable:false,writable:false},
    compositeKeys:{value:Object.freeze(Object.keys(compositeRegistry)),enumerable:true,configurable:false,writable:false},
    metricType:{value:key=>compositeRegistry[key]?'composite':teamRegistry[key]?'team':(bible.canonicalRegistry?.[key]?'event':null),enumerable:true,configurable:false,writable:false},
    allowedOn:{value:(key,surface)=>{
      const def=compositeRegistry[key]||teamRegistry[key]||bible.canonicalRegistry?.[key];
      return !!def?.surfaces?.includes(surface);
    },enumerable:true,configurable:false,writable:false}
  });

  document.dispatchEvent(new CustomEvent('pitchlab:gold-metric-bible-team-ready',{
    detail:{teamKeys:bible.teamKeys,compositeKeys:bible.compositeKeys}
  }));
})();