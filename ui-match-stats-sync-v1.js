(()=>{
  const $=s=>document.querySelector(s);
  const aliases={
    'Shots - Outside Box':['Shots Outside Box'],
    'Shots - Penalty Area':['Shots Inside The Box','Shots Inside Box'],
    'Shots - Head':['Headed Shots'],
    'Woodwork Shots':['Shots - Woodwork','Woodwork'],
    'Progressive Passes':['Open Play Progressive Passes','Open-Play Progressive Passes'],
    'Ground Duels':['Total Ground Duels'],
    'Aerial Duels':['Total Aerial Duels'],
    'Total Duels':['Duels']
  };
  const retiredLabels=new Set(['Passes Into Final Third','Successful Passes Into Final Third']);
  function makeRow(label,h,a){
    const d=Math.max(h+a,1),r=document.createElement('div');r.className='match-stats-row';r.dataset.metricBibleSync=label;
    r.innerHTML=`<div class="match-stats-row__track match-stats-row__track--home"><div class="match-stats-row__bar" style="width:${h/d*100}%"></div></div><div class="match-stats-row__value match-stats-row__value--home">${h}</div><div class="match-stats-row__label">${label}</div><div class="match-stats-row__value match-stats-row__value--away">${a}</div><div class="match-stats-row__track"><div class="match-stats-row__bar" style="width:${a/d*100}%"></div></div>`;return r;
  }
  function setRow(row,h,a,label){
    const d=Math.max(h+a,1);row.querySelector('.match-stats-row__label').textContent=label;
    row.querySelector('.match-stats-row__value--home').textContent=h;row.querySelector('.match-stats-row__value--away').textContent=a;
    const b=row.querySelectorAll('.match-stats-row__bar');if(b[0])b[0].style.width=`${h/d*100}%`;if(b[1])b[1].style.width=`${a/d*100}%`;
  }
  function findRow(body,label){
    const accepted=new Set([label,...(aliases[label]||[])]);
    return [...body.querySelectorAll('.match-stats-row')].find(r=>accepted.has(r.querySelector('.match-stats-row__label')?.textContent?.trim()));
  }
  function removeRetired(body){
    for(const row of body.querySelectorAll('.match-stats-row')){
      const label=row.querySelector('.match-stats-row__label')?.textContent?.trim();
      if(retiredLabels.has(label))row.remove();
    }
  }
  function patch(){
    const bible=window.PitchLabMetricBible,body=$('#matchStatsBody');if(!bible||!body||typeof raw==='undefined'||!raw||!body.querySelector('.match-stats-row'))return;
    removeRetired(body);
    const home=raw.home?.name,away=raw.away?.name;if(!home||!away)return;const source=Array.isArray(events)?events:[];
    const metrics=[
      ['Total Actions','total_actions'],['Successful Actions','successful_actions'],['Unsuccessful Actions','unsuccessful_actions'],
      ['Interceptions','interceptions'],['Goal Kicks','goal_kicks'],['Touches','touches'],['Penalty Box Touches','touch_box'],
      ['Shots','shots'],['Shots On-Target','shots_on'],['Shots Off-Target','shots_off'],['Blocked Shots','shots_blocked'],['Woodwork Shots','woodwork'],
      ['Shots - Open Play','shots_open'],['Shots - Fast Break','shots_fastbreak'],['Shots from Set-Pieces','shots_setpiece'],['Shots - From Free-Kicks','shots_dfk'],
      ['Shots - 6 Yard Box','shots_6yd'],['Shots - Penalty Box','shots_box'],['Shots - Penalty Area','shots_penalty_area'],['Shots - Outside Box','shots_outside'],
      ['Shots - Right Foot','shots_right'],['Shots - Left Foot','shots_left'],['Shots - Head','shots_head'],['Shots - Other','shots_other'],['Shots - Head from set-pieces','shots_head_setpiece'],
      ['Big Chances','big_chances'],['Big Chances Created','big_chances_created'],['Chances Created','chances_created'],['Assists','assists'],['Headed Clearances','headed_clearances'],
      ['Total Passes','allpasses'],['Successful Passes','successful'],['Unsuccessful Passes','unsuccessful'],['Progressive Passes','progressive'],['Final Third Passes','final_third_passes'],['Successful Final Third Passes','final_third_passes_success'],['Final Third Entries','final_third_entries'],
      ['Ball Recoveries','recoveries'],['Tackles','tackles'],['Tackles Won','tackles_won'],['Tackles Lost','tackles_lost'],
      ['Ground Duels','ground_duels'],['Ground Duels Won','ground_duels_won'],['Ground Duels Lost','ground_duels_lost'],
      ['Aerial Duels','aerial_duels'],['Aerial Duels Won','aerial_duels_won'],['Aerial Duels Lost','aerial_duels_lost'],
      ['Attacking Aerial Duels','att_aerial_duels'],['Attacking Aerial Duels Won','att_aerial_duels_won'],['Attacking Aerial Duels Lost','att_aerial_duels_lost'],
      ['Defensive Aerial Duels','def_aerial_duels'],['Defensive Aerial Duels Won','def_aerial_duels_won'],['Defensive Aerial Duels Lost','def_aerial_duels_lost'],
      ['Total Duels','total_duels'],['Duels Won','duels_won'],['Duels Lost','duels_lost'],
      ['Total Take-Ons','takeons'],['Successful Take-Ons','takeons_success'],['Unsuccessful Take-Ons','takeons_unsuccess'],
      ['Fouls','fouls_committed'],['Fouled','fouled'],['Corners','corners'],
      ['Successful Set Play Crosses','set_play_crosses_success'],['Unsuccessful Set Play Crosses','set_play_crosses_unsuccess'],
      ['Accurate Crosses','accurate_crosses'],['Inaccurate Crosses','inaccurate_crosses']
    ];
    for(const [label,key] of metrics){
      const def=bible.canonicalRegistry?.[key];if(!def||!def.surfaces?.includes?.('matchStats'))continue;
      const h=bible.metricEvents(key,source,home).length,a=bible.metricEvents(key,source,away).length;
      let row=findRow(body,label);
      if(row){setRow(row,h,a,label);continue}
      row=makeRow(label,h,a);
      if(label==='Goal Kicks'){
        const marker=findRow(body,'Interceptions');
        if(marker)marker.insertAdjacentElement('afterend',row);else body.appendChild(row);
      }else if(label==='Total Actions'){
        body.insertBefore(row,body.firstElementChild);
      }else if(label==='Successful Actions'){
        const marker=findRow(body,'Total Actions');
        if(marker)marker.insertAdjacentElement('afterend',row);else body.insertBefore(row,body.firstElementChild);
      }else if(label==='Unsuccessful Actions'){
        const marker=findRow(body,'Successful Actions');
        if(marker)marker.insertAdjacentElement('afterend',row);else body.insertBefore(row,body.firstElementChild);
      }else body.appendChild(row);
    }
  }
  setInterval(patch,450);document.addEventListener('pitchlab:metric-bible-ready',()=>setTimeout(patch,0));document.addEventListener('pitchlab:gold-passing-family-ready',()=>setTimeout(patch,0));document.addEventListener('pitchlab:progressive-pass-definition-ready',()=>setTimeout(patch,0));document.addEventListener('pitchlab:gold-simple-event-family-ready',()=>setTimeout(patch,0));document.addEventListener('pitchlab:gold-recovery-duels-family-ready',()=>setTimeout(patch,0));document.addEventListener('pitchlab:defensive-residual-definition-ready',()=>setTimeout(patch,0));document.addEventListener('pitchlab:takeon-corner-definition-ready',()=>setTimeout(patch,0));document.addEventListener('pitchlab:gold-attacking-family-ready',()=>setTimeout(patch,0));document.addEventListener('pitchlab:final-third-entries-gold-ready',()=>setTimeout(patch,0));document.addEventListener('pitchlab:action-outcome-definition-ready',()=>setTimeout(patch,0));
  ['fromRange','toRange','team'].forEach(id=>document.getElementById(id)?.addEventListener('input',patch));
  setTimeout(patch,0);
})();
