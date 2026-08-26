(()=>{
  const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
  const eventType=e=>String(dn(e?.type)||'').toLowerCase().replace(/[\s_-]/g,'');
  const outcome=e=>String(dn(e?.outcomeType)||'').toLowerCase();
  const sec=e=>Number(e?.minute||0)*60+Number(e?.second||0);
  const finite=v=>Number.isFinite(Number(v));
  const period=e=>String(dn(e?.period)||'');
  const endPoint=e=>finite(e?.endX)&&finite(e?.endY)?[Number(e.endX),Number(e.endY)]:[Number(e?.x),Number(e?.y)];
  const distM=(x1,y1,x2,y2)=>Math.hypot((Number(x2)-Number(x1))*1.05,(Number(y2)-Number(y1))*0.68);
  const forwardM=(x1,x2)=>(Number(x2)-Number(x1))*1.05;

  const MIN_CARRY_M=5;
  const MAX_CARRY_M=60;
  const MAX_GAP_S=10;
  const PROGRESSIVE_FORWARD_M=5;

  const ignoredTypes=new Set(['offsidegiven','cornerawarded','card','start','end','formationchange','substitutionoff','substitutionon']);
  const softOpponentEvents=new Set(['challenge','takeon','aerial']);
  const controlledOpponentEvents=new Set(['pass','ballrecovery','interception','tackle','takeon','balltouch','aerial','clearance','save','keeperpickup','keepersweeper']);

  function sorted(source){
    return [...(Array.isArray(source)?source:[])].sort((a,b)=>sec(a)-sec(b)||(Number(a.eventId)||0)-(Number(b.eventId)||0));
  }

  function usable(e){
    return !!e?.playerId&&finite(e.x)&&finite(e.y)&&!ignoredTypes.has(eventType(e));
  }

  function breaksControl(e,teamId){
    if(!usable(e)||e.teamId===teamId)return false;
    const t=eventType(e);
    if(softOpponentEvents.has(t)&&outcome(e)==='unsuccessful')return false;
    return controlledOpponentEvents.has(t)&&outcome(e)!=='unsuccessful';
  }

  // GOLDEN CARRY RECONSTRUCTION
  // A carry is controlled same-team ball movement between two active on-ball states.
  // WhoScored does not expose a native Carry event in the raw match feed, so we reconstruct
  // the movement while preserving control through paired unsuccessful challenge/turnover events.
  // OffsideGiven is explicitly excluded as a start/end binding.
  function reconstruct(source){
    const ordered=sorted(source).filter(e=>finite(e.x)&&finite(e.y));
    const carries=[];
    const seen=new Set();

    for(let i=1;i<ordered.length;i++){
      const next=ordered[i];
      if(!usable(next))continue;
      const teamId=next.teamId,playerId=next.playerId;

      for(let j=i-1;j>=0;j--){
        const prev=ordered[j];
        const gap=sec(next)-sec(prev);
        if(gap>MAX_GAP_S)break;
        if(gap<0||period(prev)!==period(next))continue;
        if(eventType(prev)==='offsidegiven')continue;

        let broken=false;
        for(let k=j+1;k<i;k++){
          if(breaksControl(ordered[k],teamId)){broken=true;break}
        }
        if(broken)continue;
        if(prev.teamId!==teamId)continue;

        const [sx,sy]=endPoint(prev);
        if(!finite(sx)||!finite(sy))continue;
        const ex=Number(next.x),ey=Number(next.y);
        const metres=distM(sx,sy,ex,ey);
        if(metres<MIN_CARRY_M||metres>MAX_CARRY_M)continue;

        const key=`${playerId}:${prev.eventId??j}:${next.eventId??i}`;
        if(seen.has(key))break;
        seen.add(key);
        carries.push({
          playerId,teamId,
          minute:Number(next.minute||0),second:Number(next.second||0),period:next.period,
          startX:sx,startY:sy,endX:ex,endY:ey,
          distanceM:metres,
          forwardM:forwardM(sx,ex),
          progressive:forwardM(sx,ex)>=PROGRESSIVE_FORWARD_M,
          startEventId:prev.eventId??null,endEventId:next.eventId??null
        });
        break;
      }
    }
    return carries;
  }

  function summary(carries,predicate=()=>true){
    const list=(Array.isArray(carries)?carries:[]).filter(predicate);
    const count=list.length;
    const distance=list.reduce((s,c)=>s+Number(c.distanceM||0),0);
    const progressive=list.filter(c=>c.progressive).length;
    // Provider-aligned field: net forward distance across ALL qualifying carries.
    const progressiveDistance=list.reduce((s,c)=>s+Number(c.forwardM||0),0);
    return {
      carries:count,
      carryingDistanceM:distance,
      avgCarryingDistanceM:count?distance/count:0,
      progressiveCarries:progressive,
      progressiveCarryingDistanceM:progressiveDistance,
      avgProgressiveCarryingDistanceM:progressive?progressiveDistance/progressive:0
    };
  }

  function teamSummary(source,teamId){
    const carries=reconstruct(source);
    return summary(carries,c=>String(c.teamId)===String(teamId));
  }

  function playerSummaries(source){
    const carries=reconstruct(source);
    const map=new Map();
    for(const c of carries){
      if(!map.has(String(c.playerId)))map.set(String(c.playerId),[]);
      map.get(String(c.playerId)).push(c);
    }
    const result=new Map();
    for(const [id,list] of map)result.set(id,{playerId:id,teamId:list[0]?.teamId,...summary(list)});
    return result;
  }

  window.PitchLabCarry={
    version:'golden-2026-08-26',
    constants:{MIN_CARRY_M,MAX_CARRY_M,MAX_GAP_S,PROGRESSIVE_FORWARD_M},
    reconstruct,summary,teamSummary,playerSummaries,distM,forwardM,
    goldenFixture:{
      matchId:1983552,
      note:'Nottingham Forest 0-1 Leeds player-level control set used to lock Carry Family definitions.'
    }
  };
})();