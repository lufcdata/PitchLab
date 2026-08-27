(()=>{
  const $=s=>document.querySelector(s);
  function makeRow(label,h,a){
    const d=Math.max(h+a,1),r=document.createElement('div');r.className='match-stats-row';r.dataset.metricBibleSync=label;
    r.innerHTML=`<div class="match-stats-row__track match-stats-row__track--home"><div class="match-stats-row__bar" style="width:${h/d*100}%"></div></div><div class="match-stats-row__value match-stats-row__value--home">${h}</div><div class="match-stats-row__label">${label}</div><div class="match-stats-row__value match-stats-row__value--away">${a}</div><div class="match-stats-row__track"><div class="match-stats-row__bar" style="width:${a/d*100}%"></div></div>`;return r;
  }
  function setRow(row,h,a,label){
    const d=Math.max(h+a,1);row.querySelector('.match-stats-row__label').textContent=label;
    row.querySelector('.match-stats-row__value--home').textContent=h;row.querySelector('.match-stats-row__value--away').textContent=a;
    const b=row.querySelectorAll('.match-stats-row__bar');if(b[0])b[0].style.width=`${h/d*100}%`;if(b[1])b[1].style.width=`${a/d*100}%`;
  }
  function patch(){
    const bible=window.PitchLabMetricBible,body=$('#matchStatsBody');if(!bible||!body||typeof raw==='undefined'||!raw||!body.querySelector('.match-stats-row'))return;
    const home=raw.home?.name,away=raw.away?.name;if(!home||!away)return;const source=Array.isArray(events)?events:[];
    const metrics=[
      ['Interceptions','interceptions'],['Goal Kicks','goal_kicks'],['Touches','touches'],['Penalty Box Touches','touch_box'],
      ['Headed Shots','shots_head'],['Woodwork Shots','woodwork'],['Fouls','fouls_committed'],['Fouled','fouled'],['Corners','corners'],
      ['Successful Set Play Crosses','set_play_crosses_success'],['Unsuccessful Set Play Crosses','set_play_crosses_unsuccess'],
      ['Accurate Crosses','accurate_crosses'],['Inaccurate Crosses','inaccurate_crosses']
    ];
    for(const [label,key] of metrics){
      const h=bible.metricEvents(key,source,home).length,a=bible.metricEvents(key,source,away).length;
      let row=[...body.querySelectorAll('.match-stats-row')].find(r=>r.querySelector('.match-stats-row__label')?.textContent?.trim()===label);
      if(row){setRow(row,h,a,label);continue}
      row=makeRow(label,h,a);
      if(label==='Goal Kicks'){
        const marker=[...body.querySelectorAll('.match-stats-row')].find(r=>r.querySelector('.match-stats-row__label')?.textContent?.trim()==='Interceptions');
        if(marker)marker.insertAdjacentElement('afterend',row);else body.appendChild(row);
      }else body.appendChild(row);
    }
  }
  setInterval(patch,450);document.addEventListener('pitchlab:metric-bible-ready',()=>setTimeout(patch,0));
  ['fromRange','toRange','team'].forEach(id=>document.getElementById(id)?.addEventListener('input',patch));
  setTimeout(patch,0);
})();