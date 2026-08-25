(()=>{
  const timings=[
    ['MATCH','Total Match Duration','100:15',100],
    ['MATCH','Final Match Clock','98:18',98.05],
    ['MATCH','Total Added Time','10:15',10.22],
    ['HALVES','1st Half Duration','46:57',46.83],
    ['HALVES','1st Half Added Time','1:57',1.95],
    ['HALVES','2nd Half Duration','53:18',53.17],
    ['HALVES','2nd Half Added Time','8:18',8.28],
    ['BALL STATUS','Ball In Play','51:23',51.26],
    ['BALL STATUS','Ball In Play %','51.3%',51.3],
    ['BALL STATUS','Ball Out of Play','48:52',48.74],
    ['BALL STATUS','Ball Out of Play %','48.7%',48.7],
    ['STOPPAGES','Game Stops','97',97],
    ['STOPPAGES','Throw-in Stops','46',46],
    ['STOPPAGES','Free-kick Restarts','18',18],
    ['STOPPAGES','Goal-kick Stops','14',14],
    ['STOPPAGES','Corner Stops','13',13],
    ['STOPPAGES','Goal Stops','4',4],
    ['STOPPAGES','Offside Stops','2',2],
    ['STOPPAGES','Post-goal / Other Time','6:04',6.07]
  ];
  function install(){
    const controls=document.querySelector('.controls-panel');
    if(!controls||document.getElementById('matchTimings'))return;
    const panel=document.createElement('section');
    panel.id='matchTimings';panel.className='match-timings';
    let current='';
    const rows=timings.map(([section,name,value,bar])=>{
      const heading=section!==current?`<div class="match-timings__section">${section}</div>`:'';current=section;
      return `${heading}<div class="match-timing"><div class="match-timing__body"><div class="match-timing__top"><span class="match-timing__name">${name}</span></div><div class="match-timing__track"><div class="match-timing__bar" style="width:${Math.max(2,Math.min(100,bar))}%"></div></div></div><div class="match-timing__value">${value}</div></div>`;
    }).join('');
    panel.innerHTML=`<div class="match-timings__head"><div><div class="match-timings__kicker">Match Timings</div><div class="match-timings__title">Bournemouth 2–2 Leeds</div></div><div class="match-timings__scope">Full Match</div></div><div class="match-timings__list">${rows}</div><div class="match-timings__foot"><span>Match timing audit</span><span>Locked V1</span></div>`;
    controls.appendChild(panel);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();