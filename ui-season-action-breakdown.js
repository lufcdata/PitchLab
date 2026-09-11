(()=>{
  const $=id=>document.getElementById(id);
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const et=e=>String(typeof type==='function'?type(e):dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
  const has=(e,...names)=>typeof hasQ==='function'&&hasQ(e,...names);
  const labelise=s=>String(s||'Other').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,c=>c.toUpperCase());

  function category(e,kind){
    const t=et(e);
    if(kind==='successful'){
      if(t==='pass'){
        if(has(e,'ThrowIn'))return 'Accurate Throw-ins';
        if(has(e,'CornerTaken'))return 'Successful Corners';
        if(has(e,'FreekickTaken','FreeKickTaken'))return 'Accurate Free-kicks';
        if(has(e,'GoalKick'))return 'Successful Goal-kicks';
        if(has(e,'Cross'))return 'Accurate Crosses';
        return 'Successful Passes';
      }
      if(t==='clearance')return has(e,'BlockedCross')?'Blocked Crosses':'Clearances';
      if(t==='save'&&has(e,'OutfielderBlock'))return 'Blocked Shots';
      if(t==='savedshot')return 'Shots on Target';
      if(t==='ballrecovery')return 'Ball Recoveries';
      if(t==='aerial')return 'Aerial Duels Won';
      if(t==='balltouch')return 'Successful Touches';
      if(t==='interception')return 'Interceptions';
      if(t==='tackle')return 'Tackles Won';
      if(t==='takeon')return 'Successful Take-ons';
      if(t==='foul')return 'Fouled';
      if(t==='blockedpass')return 'Blocked Passes';
      if(t==='shieldballopp')return 'Shield Ball from Opponent';
      if(t==='goal')return 'Goals';
      if(t==='claim')return 'Claims';
      if(t==='keeperpickup')return 'Keeper Pick-ups';
      if(t==='keepersweeper')return 'Keeper Sweeper Actions';
      if(t==='punch')return 'Punches';
      if(t==='save')return 'Saves';
    }else{
      if(t==='pass'){
        if(has(e,'ThrowIn'))return 'Inaccurate Throw-ins';
        if(has(e,'CornerTaken'))return 'Unsuccessful Corners';
        if(has(e,'FreekickTaken','FreeKickTaken'))return 'Inaccurate Free-kicks';
        if(has(e,'GoalKick'))return 'Unsuccessful Goal-kicks';
        if(has(e,'Cross'))return 'Inaccurate Crosses';
        return 'Unsuccessful Passes';
      }
      if(t==='savedshot'&&has(e,'Blocked','OutfielderBlock'))return 'Shots Blocked';
      if(t==='savedshot')return has(e,'BigChance')?'Big Chances Saved':'Saved Shots';
      if(t==='missedshots')return has(e,'BigChance')?'Big Chances Off Target':'Shots Off Target';
      if(t==='shotonpost')return 'Woodwork';
      if(t==='challenge')return 'Challenges Lost';
      if(t==='aerial')return 'Aerial Duels Lost';
      if(t==='takeon')return 'Unsuccessful Take-ons';
      if(t==='balltouch')return 'Unsuccessful Touches';
      if(t==='dispossessed')return 'Dispossessed';
      if(t==='error')return 'Errors';
      if(t==='offsidegiven')return 'Offsides';
      if(t==='goal'&&has(e,'OwnGoal'))return 'Own Goals';
      if(t==='foul')return 'Fouls Committed';
      if(t==='claim')return 'Unsuccessful Claims';
      if(t==='keeperpickup')return 'Unsuccessful Keeper Pick-ups';
      if(t==='keepersweeper')return 'Unsuccessful Keeper Sweeper Actions';
      if(t==='punch')return 'Unsuccessful Punches';
    }
    return labelise(dn(e?.type)||t);
  }

  function ensurePanel(){
    let box=$('seasonActionBreakdown');if(box)return box;
    const host=document.querySelector('.plot-heading')?.parentElement||document.querySelector('.plot-card')||document.body;
    box=document.createElement('aside');box.id='seasonActionBreakdown';box.className='season-action-breakdown';box.hidden=true;
    box.innerHTML='<div class="sab-head"><b id="sabTitle">Action breakdown</b><span id="sabTotal"></span></div><div id="sabRows"></div>';
    host.appendChild(box);
    const style=document.createElement('style');style.textContent=`
      .season-action-breakdown{position:absolute;z-index:12;right:14px;top:14px;width:190px;max-height:310px;overflow:auto;padding:7px 8px;border:1px solid rgba(255,255,255,.12);border-radius:7px;background:rgba(13,14,25,.94);box-shadow:0 8px 22px rgba(0,0,0,.24);font:9px/1.25 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;color:rgba(255,255,255,.78);pointer-events:auto}
      .season-action-breakdown[hidden]{display:none}.sab-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-bottom:5px;margin-bottom:3px;border-bottom:1px solid rgba(255,255,255,.08);font-size:9px}.sab-head b{font-size:9px;color:#fff}.sab-head span{font-weight:800;color:#fff}.sab-row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:1.5px 0}.sab-row span:last-child{font-weight:800;color:#fff}.plot-card,.pitch-card,.visual-panel{position:relative}
    `;document.head.appendChild(style);return box;
  }

  function render(){
    const box=ensurePanel(),key=$('metric')?.value;
    if(key!=='successful_actions'&&key!=='unsuccessful_actions'){box.hidden=true;return}
    const kind=key==='successful_actions'?'successful':'unsuccessful',classifier=window.PitchLabActionOutcomeDefinition?.classifyAction;
    if(typeof classifier!=='function'||!Array.isArray(events)){box.hidden=true;return}
    const player=$('player')?.value||'all';
    let list=events.filter(e=>classifier(e)===kind);
    if(player!=='all')list=list.filter(e=>String(e.playerId)===String(player));
    const counts=new Map();for(const e of list){const c=category(e,kind);counts.set(c,(counts.get(c)||0)+1)}
    const rows=[...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
    $('sabTitle').textContent=kind==='successful'?'Successful Actions':'Unsuccessful Actions';$('sabTotal').textContent=String(list.length);
    $('sabRows').innerHTML=rows.map(([name,n])=>`<div class="sab-row"><span>${name}</span><span>${n}</span></div>`).join('');box.hidden=false;
  }

  function bind(){
    ensurePanel();['metric','player','dateFrom','dateTo','competition','period'].forEach(id=>{const el=$(id);el?.addEventListener('change',()=>setTimeout(render,0));el?.addEventListener('input',()=>setTimeout(render,0))});
    const count=$('eventCount');if(count)new MutationObserver(()=>render()).observe(count,{childList:true,characterData:true,subtree:true});
    document.addEventListener('pitchlab:action-outcome-definition-ready',render);setTimeout(render,250);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
