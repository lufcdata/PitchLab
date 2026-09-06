const fs=require('fs');
const zlib=require('zlib');
const vm=require('vm');

const parts=[
  'data/ws1983552_00.part','data/ws1983552_01.part','data/ws1983552_02.part',
  'data/ws1983552_03.part','data/ws1983552_04.part',
  'data/ws1983552_05a.part','data/ws1983552_05b.part',
  'data/ws1983552_06a.part','data/ws1983552_06b.part',
  'data/ws1983552_07a.part','data/ws1983552_07b.part',
  'data/ws1983552_08a.part','data/ws1983552_08b.part'
];
const packed=parts.map(p=>fs.readFileSync(p,'utf8').trim()).join('');
const decoded=JSON.parse(zlib.gunzipSync(Buffer.from(packed,'base64')).toString('utf8'));
const events=Array.isArray(decoded)?decoded:(decoded.events||[]);
const source=fs.readFileSync('ui-carry-metrics.js','utf8');

function load(label,code){
  const context={window:{},document:{getElementById:()=>null},console,Math,Number,String,Array,Map,Set,Object};
  vm.createContext(context);
  vm.runInContext(code,context,{filename:`ui-carry-metrics-${label}.js`});
  const engine=context.window.PitchLabCarry;
  if(!engine)throw new Error(`PitchLabCarry not loaded for ${label}`);
  return engine;
}
function rounded(engine){
  const map=new Map();
  for(const [id,s] of engine.playerSummaries(events))map.set(String(id),{carries:s.carries,distance:Number(s.carryingDistanceM.toFixed(1)),progressive:s.progressiveCarries,net:Number(s.progressiveCarryingDistanceM.toFixed(1))});
  return map;
}
function compare(label,engine,baseline){
  const rows=rounded(engine),diff=[];
  const ids=new Set([...baseline.keys(),...rows.keys()]);
  for(const id of ids){
    const a=baseline.get(id)||{carries:0,distance:0,progressive:0,net:0};
    const b=rows.get(id)||{carries:0,distance:0,progressive:0,net:0};
    if(JSON.stringify(a)!==JSON.stringify(b))diff.push({id,before:a,after:b});
  }
  console.log(JSON.stringify({label,carryCount:engine.reconstruct(events).length,diff},null,2));
}

const baselineEngine=load('baseline',source);
const baseline=rounded(baselineEngine);
console.log(JSON.stringify({label:'baseline',engine:baselineEngine.version,eventCount:events.length,carryCount:baselineEngine.reconstruct(events).length},null,2));

const blanket="if(endType==='foul'&&kind==='acquisition'&&['ballrecovery','interception','tackle','blockedpass'].includes(startType))continue;";
if(!source.includes(blanket))throw new Error('Expected defensive-foul suppression not found');
const elapsedTwo=source.replace(blanket,"if(endType==='foul'&&kind==='acquisition'&&['ballrecovery','interception','tackle','blockedpass'].includes(startType)){const defensiveFoulGap=exactGap(start,end);if(defensiveFoulGap===null||defensiveFoulGap<2)continue;}");
compare('safe-foul-after-2s',load('safe-foul',elapsedTwo),baseline);

for(const threshold of [4.5,4.0,3.5]){
  const code=elapsedTwo.replace('const MIN_CARRY_M=5;',`const MIN_CARRY_M=${threshold};`);
  compare(`global-min-${threshold}m`,load(`min-${threshold}`,code),baseline);
}

const receptionTolerance=elapsedTwo.replace('if(metres<MIN_CARRY_M)return null;',"const minMovement=kind==='reception'?4.0:MIN_CARRY_M;if(metres<minMovement)return null;");
compare('reception-only-4m-tolerance',load('reception-4m',receptionTolerance),baseline);

const looseHelper=`function looseFoulOrigin(ordered,i){
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
      if(String(e.teamId)!==String(teamId)&&eventType(e)==='balltouch'&&outcome(e)==='unsuccessful'&&finite(e.x)&&finite(e.y)){
        return {...e,x:100-Number(e.x),y:100-Number(e.y),teamId,playerId};
      }
      if(opponentEstablishesControl(e,teamId))return null;
      if(usable(e)&&String(e.teamId)===String(teamId)&&String(e.playerId)!==String(playerId))return null;
    }
    return null;
  }\n  `;
let looseFoul=elapsedTwo.replace('function reconstruct(source){',looseHelper+'function reconstruct(source){');
const startNeedle="let start=explicitOrigin(ordered,i),kind='acquisition';";
if(!looseFoul.includes(startNeedle))throw new Error('Expected reconstruct start not found');
looseFoul=looseFoul.replace(startNeedle,"let start=looseFoulOrigin(ordered,i),kind=start?'loose-acquisition':'acquisition';if(!start)start=explicitOrigin(ordered,i);");
compare('loose-touch-before-recovery-foul',load('loose-foul',looseFoul),baseline);
