(()=>{
  const bible=window.PitchLabMetricBible;
  const metric=document.getElementById('metric');
  if(!bible||!metric)return;

  const WIN='#43FAD5';
  const LOST='#ED1362';
  const combos=Object.freeze({
    tackles:Object.freeze({label:'Tackles',won:'tackles_won',lost:'tackles_lost'}),
    takeons:Object.freeze({label:'Total Take-Ons',won:'takeons_success',lost:'takeons_unsuccess'}),
    total_duels:Object.freeze({label:'Total Duels',won:'duels_won',lost:'duels_lost'}),
    ground_duels:Object.freeze({label:'Ground Duels',won:'ground_duels_won',lost:'ground_duels_lost'}),
    aerial_duels:Object.freeze({label:'Aerial Duels',won:'aerial_duels_won',lost:'aerial_duels_lost'}),
    def_aerial_duels:Object.freeze({label:'Defensive Aerial Duels',won:'def_aerial_duels_won',lost:'def_aerial_duels_lost'}),
    att_aerial_duels:Object.freeze({label:'Attacking Aerial Duels',won:'att_aerial_duels_won',lost:'att_aerial_duels_lost'})
  });

  // Display-label alignment only: preserve every existing predicate/status/control.
  const registry={...bible.canonicalRegistry};
  for(const [key,c] of Object.entries(combos)){
    const def=registry[key];if(def)registry[key]=Object.freeze({...def,label:c.label});
  }
  bible.canonicalRegistry=Object.freeze(registry);

  function group(label){
    let g=[...metric.querySelectorAll('optgroup')].find(x=>x.label===label);
    if(!g){g=document.createElement('optgroup');g.label=label;metric.appendChild(g)}return g;
  }
  function ensure(value,label,groupLabel='Duels'){
    let o=metric.querySelector(`option[value="${value}"]`);
    if(!o){o=document.createElement('option');o.value=value;group(groupLabel).appendChild(o)}
    o.textContent=label;return o;
  }
  ensure('tackles','Tackles','Defensive');
  ensure('takeons','Total Take-Ons','Attacking');
  ensure('total_duels','Total Duels');
  ensure('ground_duels','Ground Duels');
  ensure('aerial_duels','Aerial Duels');
  ensure('def_aerial_duels','Defensive Aerial Duels');
  ensure('att_aerial_duels','Attacking Aerial Duels');

  const baseDrawPoint=drawPoint;
  drawPoint=(root,e,colour)=>{
    const combo=combos[metric.value];
    if(combo){
      const win=bible.canonicalRegistry?.[combo.won]?.test;
      const loss=bible.canonicalRegistry?.[combo.lost]?.test;
      if(typeof win==='function'&&win(e))colour=WIN;
      else if(typeof loss==='function'&&loss(e))colour=LOST;
    }
    return baseDrawPoint(root,e,colour);
  };

  function syncLegend(){
    const combo=combos[metric.value],legend=document.getElementById('plotLegend');if(!combo||!legend)return;
    const wonLabel=bible.canonicalRegistry?.[combo.won]?.label||'Won';
    const lostLabel=bible.canonicalRegistry?.[combo.lost]?.label||'Lost';
    legend.innerHTML=`<span class="legend-item"><i class="legend-circle metric" style="--metric-colour:${WIN}"></i>${wonLabel}</span><span class="legend-item"><i class="legend-circle metric" style="--metric-colour:${LOST}"></i>${lostLabel}</span>`;
  }
  function refresh(){requestAnimationFrame(syncLegend)}
  metric.addEventListener('input',refresh);metric.addEventListener('change',refresh);
  const count=document.getElementById('eventCount');if(count)new MutationObserver(refresh).observe(count,{childList:true,subtree:true,characterData:true});
  document.addEventListener('pitchlab:match-loaded',refresh);
  setTimeout(refresh,50);

  window.PitchLabCombinedOutcomeSurfaces=Object.freeze({version:'COMBINED_OUTCOME_SURFACES_V1_2026-08-29',colours:Object.freeze({won:WIN,lost:LOST}),combos});
  document.dispatchEvent(new CustomEvent('pitchlab:combined-outcome-surfaces-ready',{detail:{version:window.PitchLabCombinedOutcomeSurfaces.version,keys:Object.freeze(Object.keys(combos))}}));
})();
