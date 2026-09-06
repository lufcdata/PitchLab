from pathlib import Path
p=Path('ui-carry-metrics.js')
s=p.read_text()
old="if(endType==='foul'&&kind==='acquisition'&&['ballrecovery','interception','tackle','blockedpass'].includes(startType))continue;"
new="if(endType==='foul'&&kind==='acquisition'&&['ballrecovery','interception','tackle','blockedpass'].includes(startType)){const defensiveFoulGap=exactGap(start,end);if(defensiveFoulGap===null||defensiveFoulGap<2)continue;}"
assert old in s
s=s.replace(old,new,1)
helper="""function looseFoulOrigin(ordered,i){
    const end=ordered[i];
    if(eventType(end)!=='foul'||!successful(end))return null;
    const teamId=end.teamId,playerId=end.playerId;
    let recoveryIndex=-1;
    for(let k=i-1;k>=0;k--){
      const e=ordered[k];
      if(!samePeriod(e,end))break;
      const g=exactGap(e,end);
      if(g!==null&&g>2)break;
      if(String(e.teamId)===String(teamId)&&String(e.playerId)===String(playerId)&&eventType(e)==='ballrecovery'&&successful(e)){recoveryIndex=k;break;}
      if(usable(e)&&String(e.teamId)===String(teamId)&&String(e.playerId)!==String(playerId))return null;
    }
    if(recoveryIndex<0)return null;
    for(let j=recoveryIndex-1;j>=0;j--){
      const e=ordered[j];
      if(!samePeriod(e,end))break;
      const g=exactGap(e,end);
      if(g!==null&&g>4)break;
      if(String(e.teamId)!==String(teamId)&&eventType(e)==='balltouch'&&outcome(e)==='unsuccessful'&&finite(e.x)&&finite(e.y))return {...e,x:100-Number(e.x),y:100-Number(e.y),teamId,playerId};
      if(opponentEstablishesControl(e,teamId))return null;
      if(usable(e)&&String(e.teamId)===String(teamId)&&String(e.playerId)!==String(playerId))return null;
    }
    return null;
  }
  """
assert 'function reconstruct(source){' in s
s=s.replace('function reconstruct(source){',helper+'function reconstruct(source){',1)
start="let start=explicitOrigin(ordered,i),kind='acquisition';"
assert start in s
s=s.replace(start,"let start=looseFoulOrigin(ordered,i),kind=start?'loose-acquisition':'acquisition';if(!start)start=explicitOrigin(ordered,i);",1)
s=s.replace("version:'carry-engine-v5-2026-08-28'","version:'carry-engine-v6-2026-09-06'",1)
s=s.replace("state:'GOLD_LOCKED_PLAYER_CONTROL',note:'Carry Engine v5 reconciles the complete supplied Forest-Leeds outfield-player control table across carry count, carrying distance, progressive count and net forward carrying distance.'","state:'GOLD_LOCKED_MULTI_FIXTURE_CONTROL',note:'Carry Engine v6 preserves the complete Forest-Leeds Gold player control while recovering validated >=5m Brighton acquisition-to-foul carries; the 5m carry minimum and progressive-forward threshold remain unchanged.'",1)
p.write_text(s)
idx=Path('index.html')
t=idx.read_text()
assert 'metrics-98' in t
idx.write_text(t.replace('metrics-98','metrics-99'))
