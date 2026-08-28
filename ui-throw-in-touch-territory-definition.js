(()=>{
  const bible=window.PitchLabMetricBible;
  if(!bible){
    console.error('[PitchLab] Metric Bible missing; throw-in/touch territory family not attached.');
    return;
  }
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const outcome=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const qnames=e=>(e?.qualifiers||[]).map(q=>String(dn(q?.type)||''));
  const hasQ=(e,name)=>qnames(e).includes(name);
  const success=e=>outcome(e)==='successful';
  const surfaces=Object.freeze(['pitch','leaders','matchStats']);
  const FINAL_THIRD_X=200/3;
  const inBox=(x,y)=>Number(x)>=83&&Number(x)<=100&&Number(y)>=21.1&&Number(y)<=78.9;
  const throwIn=e=>et(e)==='pass'&&hasQ(e,'ThrowIn');
  const touch=e=>e?.isTouch===true;

  const defs=Object.freeze({
    throwins_success:Object.freeze({
      label:'Successful Throw-Ins',kind:'event',surfaces,status:'GOLD_LOCKED',version:'THROW_INS_GOLD_V1_2026-08-28',
      definition:'WhoScored Pass event carrying the Opta ThrowIn qualifier with successful outcome.',
      controls:Object.freeze({forestLeeds:Object.freeze({forest:21,leeds:6}),bournemouthLeeds:Object.freeze({bournemouth:16,leeds:9})}),
      test:e=>throwIn(e)&&success(e)
    }),
    throwins_unsuccess:Object.freeze({
      label:'Unsuccessful Throw-Ins',kind:'event',surfaces,status:'GOLD_LOCKED',version:'THROW_INS_GOLD_V1_2026-08-28',
      definition:'WhoScored Pass event carrying the Opta ThrowIn qualifier with unsuccessful outcome.',
      controls:Object.freeze({forestLeeds:Object.freeze({forest:4,leeds:6}),bournemouthLeeds:Object.freeze({bournemouth:11,leeds:10})}),
      test:e=>throwIn(e)&&!success(e)
    }),
    throwins_success_final_third:Object.freeze({
      label:'Successful Final Third Throw-Ins',kind:'event',surfaces,status:'DERIVED_FROM_GOLD_COMPONENTS',version:'THROW_IN_SPATIAL_V2_2026-08-28',
      definition:'Successful Gold Throw-In taken from the attacking final third (origin x >= 66.6667). Final-third territory is defined by the throw location, not its destination.',
      observedFixtureCounts:Object.freeze({forestLeeds:Object.freeze({forest:6,leeds:2}),bournemouthLeeds:Object.freeze({bournemouth:4,leeds:3})}),
      test:e=>throwIn(e)&&success(e)&&Number(e?.x)>=FINAL_THIRD_X
    }),
    throwins_success_box:Object.freeze({
      label:'Successful Throw-Ins Into Penalty Box',kind:'event',surfaces,status:'DERIVED_FROM_GOLD_COMPONENTS',version:'THROW_IN_SPATIAL_V2_2026-08-28',
      definition:'Successful Gold Throw-In whose destination lies inside the opposition penalty area (x 83-100, y 21.1-78.9). This is not the Opta long-throw metric and has no 20m minimum-length rule.',
      observedFixtureCounts:Object.freeze({forestLeeds:Object.freeze({forest:1,leeds:2}),bournemouthLeeds:Object.freeze({bournemouth:0,leeds:3})}),
      test:e=>throwIn(e)&&success(e)&&inBox(e?.endX,e?.endY)
    }),
    throwins_box:Object.freeze({
      label:'Throw-Ins Into Penalty Box',kind:'event',surfaces,status:'DERIVED_FROM_GOLD_COMPONENTS',version:'THROW_IN_SPATIAL_V2_2026-08-28',
      definition:'Gold Throw-In, successful or unsuccessful, whose destination lies inside the opposition penalty area (x 83-100, y 21.1-78.9). This is not the Opta long-throw metric and has no 20m minimum-length rule.',
      observedFixtureCounts:Object.freeze({forestLeeds:Object.freeze({forest:5,leeds:4}),bournemouthLeeds:Object.freeze({bournemouth:6,leeds:7})}),
      test:e=>throwIn(e)&&inBox(e?.endX,e?.endY)
    }),
    touch_def_third:Object.freeze({
      label:'Defensive-Third Touches',kind:'event',surfaces,status:'DERIVED_FROM_GOLD_COMPONENTS',
      definition:'Gold Touch event with x < 33.3333.',observedFixtureCounts:Object.freeze({forest:238,leeds:162}),
      test:e=>touch(e)&&Number(e?.x)<100/3
    }),
    touch_mid_third:Object.freeze({
      label:'Middle-Third Touches',kind:'event',surfaces,status:'DERIVED_FROM_GOLD_COMPONENTS',
      definition:'Gold Touch event with 33.3333 <= x < 66.6667.',observedFixtureCounts:Object.freeze({forest:252,leeds:240}),
      test:e=>touch(e)&&Number(e?.x)>=100/3&&Number(e?.x)<200/3
    }),
    touch_final_third:Object.freeze({
      label:'Final-Third Touches',kind:'event',surfaces,status:'DERIVED_FROM_GOLD_COMPONENTS',
      definition:'Gold Touch event with x >= 66.6667.',observedFixtureCounts:Object.freeze({forest:127,leeds:98}),
      test:e=>touch(e)&&Number(e?.x)>=200/3
    })
  });

  if(typeof FILTERS!=='undefined')for(const [key,def] of Object.entries(defs))FILTERS[key]=def.test;
  bible.canonicalRegistry=Object.freeze({...bible.canonicalRegistry,...defs});
  bible.canonicalKeys=Object.freeze([...new Set([...(bible.canonicalKeys||[]),...Object.keys(defs)])]);

  window.PitchLabThrowInTouchTerritoryDefinition=Object.freeze({
    version:'THROW_IN_TOUCH_TERRITORY_V2_2026-08-28',defs,
    goldThrowInControls:Object.freeze({
      forestLeeds:Object.freeze({total:Object.freeze({forest:25,leeds:12}),successful:Object.freeze({forest:21,leeds:6}),unsuccessful:Object.freeze({forest:4,leeds:6})}),
      bournemouthLeeds:Object.freeze({total:Object.freeze({bournemouth:27,leeds:19}),successful:Object.freeze({bournemouth:16,leeds:9}),unsuccessful:Object.freeze({bournemouth:11,leeds:10})})
    }),
    spatialControls:Object.freeze({
      successfulFinalThird:Object.freeze({forestLeeds:Object.freeze({forest:6,leeds:2}),bournemouthLeeds:Object.freeze({bournemouth:4,leeds:3})}),
      intoPenaltyBox:Object.freeze({forestLeeds:Object.freeze({forest:5,leeds:4}),bournemouthLeeds:Object.freeze({bournemouth:6,leeds:7})}),
      successfulIntoPenaltyBox:Object.freeze({forestLeeds:Object.freeze({forest:1,leeds:2}),bournemouthLeeds:Object.freeze({bournemouth:0,leeds:3})})
    }),
    touchPartition:Object.freeze({forest:Object.freeze([238,252,127]),leeds:Object.freeze([162,240,98])})
  });
  document.dispatchEvent(new CustomEvent('pitchlab:throw-in-touch-territory-ready',{
    detail:{version:window.PitchLabThrowInTouchTerritoryDefinition.version,keys:Object.freeze(Object.keys(defs))}
  }));
})();
