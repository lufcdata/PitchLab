(()=>{
  const metric=document.getElementById('metric');
  if(!metric||typeof drawPoint!=='function'||typeof svg!=='function'||typeof toPoint!=='function')return;

  const C=Object.freeze({
    magenta:'#F000E8',green:'#20C94B',pink:'#FF0064',blue:'#25ACF5',cyan:'#32D8CF',orange:'#FF8A17',dark:'#0d0e19'
  });
  const specs=Object.freeze({
    takeons_success:Object.freeze({label:'Successful Take-Ons',shape:'diamond',colour:C.magenta}),
    takeons_unsuccess:Object.freeze({label:'Unsuccessful Take-Ons',shape:'diamond-outline',colour:C.magenta}),
    tackles_won:Object.freeze({label:'Tackle Won',shape:'square',colour:C.green}),
    tackles_lost:Object.freeze({label:'Tackle Lost',shape:'square',colour:C.pink}),
    recoveries:Object.freeze({label:'Ball Recovery',shape:'plus',colour:C.blue}),
    fouls_committed:Object.freeze({label:'Foul',shape:'diamond',colour:C.pink}),
    fouled:Object.freeze({label:'Foul Won',shape:'diamond',colour:C.cyan}),
    blocks:Object.freeze({label:'Block',shape:'dash',colour:C.blue}),
    dispossessed:Object.freeze({label:'Dispossessed',shape:'triangle',colour:C.pink}),
    errors:Object.freeze({label:'Error',shape:'x',colour:C.pink}),
    interceptions:Object.freeze({label:'Interception',shape:'square',colour:C.orange}),
    blocked_crosses:Object.freeze({label:'Blocked Cross',shape:'dash',colour:C.green}),
    duels_won:Object.freeze({label:'Duels Won',shape:'square',colour:C.green}),
    duels_lost:Object.freeze({label:'Duel Lost',shape:'square',colour:C.pink})
  });

  function appendSymbol(root,e,spec){
    if(!root||!e||!spec)return;
    const p=toPoint(e),x=p.x,y=p.y,r=.64;
    let node;
    if(spec.shape==='diamond'||spec.shape==='diamond-outline'){
      node=svg('path',{d:`M${x},${y-r} L${x+r},${y} L${x},${y+r} L${x-r},${y} Z`,fill:spec.shape==='diamond'?spec.colour:'none',stroke:spec.colour,'stroke-width':spec.shape==='diamond-outline'?'.32':'.12','vector-effect':'non-scaling-stroke'});
    }else if(spec.shape==='square'){
      node=svg('rect',{x:x-r*.72,y:y-r*.72,width:r*1.44,height:r*1.44,rx:'.04',fill:spec.colour,stroke:C.dark,'stroke-width':'.12','vector-effect':'non-scaling-stroke'});
    }else if(spec.shape==='plus'){
      node=svg('path',{d:`M${x-.18},${y-r} H${x+.18} V${y-.18} H${x+r} V${y+.18} H${x+.18} V${y+r} H${x-.18} V${y+.18} H${x-r} V${y-.18} H${x-.18} Z`,fill:spec.colour,stroke:C.dark,'stroke-width':'.08','vector-effect':'non-scaling-stroke'});
    }else if(spec.shape==='dash'){
      node=svg('rect',{x:x-r,y:y-.12,width:r*2,height:'.24',rx:'.04',fill:spec.colour});
    }else if(spec.shape==='triangle'){
      node=svg('path',{d:`M${x},${y-r} L${x+r*.82},${y+r*.68} L${x-r*.82},${y+r*.68} Z`,fill:spec.colour,stroke:C.dark,'stroke-width':'.1','vector-effect':'non-scaling-stroke'});
    }else if(spec.shape==='x'){
      const g=svg('g',{}),a=svg('line',{x1:x-r*.7,y1:y-r*.7,x2:x+r*.7,y2:y+r*.7,stroke:spec.colour,'stroke-width':'.38','stroke-linecap':'square','vector-effect':'non-scaling-stroke'}),b=svg('line',{x1:x+r*.7,y1:y-r*.7,x2:x-r*.7,y2:y+r*.7,stroke:spec.colour,'stroke-width':'.38','stroke-linecap':'square','vector-effect':'non-scaling-stroke'});g.append(a,b);node=g;
    }
    if(node){node.setAttribute('data-pitchlab-marker-shape',spec.shape);node.setAttribute('data-pitchlab-marker-colour',spec.colour);root.appendChild(node)}
  }

  const baseDrawPoint=drawPoint;
  drawPoint=(root,e,colour)=>{
    const spec=specs[metric.value];
    if(spec){appendSymbol(root,e,spec);return}
    return baseDrawPoint(root,e,colour);
  };

  function iconHtml(spec){
    const common=`style="--marker-colour:${spec.colour}" data-marker-shape="${spec.shape}" data-marker-colour="${spec.colour}"`;
    return `<i class="season-event-symbol season-event-symbol-${spec.shape}" ${common}></i>`;
  }
  function legendHtml(key){const spec=specs[key];return spec?`<span class="legend-item season-event-symbol-legend">${iconHtml(spec)}${spec.label}</span>`:''}

  window.PitchLabSeasonEventMarkerSymbols=Object.freeze({version:'SEASON_EVENT_MARKER_SYMBOLS_V1_2026-09-09',specs,legendHtml});
  requestAnimationFrame(()=>render());
})();
