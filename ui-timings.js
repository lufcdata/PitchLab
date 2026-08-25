(()=>{
  const primary=[
    ['Match Duration','100:15'],
    ['Allocated Time','98:18'],
    ['Added Time','10:15']
  ];
  const details=[
    ['HALVES','1st Half Duration','46:57'],
    ['HALVES','1st Half Added Time','1:57'],
    ['HALVES','2nd Half Duration','53:18'],
    ['HALVES','2nd Half Added Time','8:18'],
    ['BALL STATUS','Ball In Play','51:23'],
    ['BALL STATUS','Ball In Play %','51.3%'],
    ['BALL STATUS','Ball Out of Play','48:52'],
    ['BALL STATUS','Ball Out of Play %','48.7%'],
    ['STOPPAGES','Game Stops','97'],
    ['STOPPAGES','Throw-in Stops','46'],
    ['STOPPAGES','Free-kick Restarts','18'],
    ['STOPPAGES','Goal-kick Stops','14'],
    ['STOPPAGES','Corner Stops','13'],
    ['STOPPAGES','Goal Stops','4'],
    ['STOPPAGES','Offside Stops','2'],
    ['STOPPAGES','Post-goal / Other Time','6:04']
  ];

  function install(){
    const summary=document.querySelector('.summary-card');
    if(!summary||summary.dataset.matchTimingsInstalled==='1')return;
    summary.dataset.matchTimingsInstalled='1';
    summary.classList.add('match-timings-summary');

    const oldPanel=document.getElementById('matchTimings');
    if(oldPanel)oldPanel.remove();

    let current='';
    const detailRows=details.map(([section,name,value])=>{
      const heading=section!==current?`<div class="match-timings__section">${section}</div>`:'';
      current=section;
      return `${heading}<div class="match-timing-detail"><span class="match-timing-detail__name">${name}</span><span class="match-timing-detail__value">${value}</span></div>`;
    }).join('');

    summary.innerHTML=`
      <div class="match-timings-summary__head">Match Timings</div>
      <div class="match-timings-summary__grid">
        ${primary.map(([label,value])=>`<div class="match-timings-summary__item"><span>${label}</span><b>${value}</b></div>`).join('')}
      </div>
      <button class="match-timings-summary__toggle" type="button" aria-expanded="false" aria-controls="matchTimingsDetails">
        <span>Expand Details</span><span class="match-timings-summary__chevron" aria-hidden="true">⌄</span>
      </button>
      <div id="matchTimingsDetails" class="match-timings-summary__details" hidden>${detailRows}</div>
      <div hidden aria-hidden="true"><span id="sumFrom"></span><span id="sumTo"></span><span id="sumTeam"></span><span id="sumMetric"></span></div>`;

    const toggle=summary.querySelector('.match-timings-summary__toggle');
    const detailsEl=summary.querySelector('#matchTimingsDetails');
    toggle.addEventListener('click',()=>{
      const expanded=toggle.getAttribute('aria-expanded')==='true';
      toggle.setAttribute('aria-expanded',String(!expanded));
      detailsEl.hidden=expanded;
      toggle.querySelector('span:first-child').textContent=expanded?'Expand Details':'Hide Details';
      summary.classList.toggle('is-expanded',!expanded);
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();