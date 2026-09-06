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
  for(const [id,s] of engine.playerSummaries(events))map.set(String(id),{
    carries:s.carries,
    distance:Number(s.carryingDistanceM.toFixed(1)),
    progressive:s.progressiveCarries,
    net:Number(s.progressiveCarryingDistanceM.toFixed(1))
  });
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

const allowAll=source.replace(blanket,'');
compare('allow-all-defensive-acquisition-fouls',load('allow-all',allowAll),baseline);

const elapsedTwo=source.replace(blanket,"if(endType==='foul'&&kind==='acquisition'&&['ballrecovery','interception','tackle','blockedpass'].includes(startType)){const defensiveFoulGap=exactGap(start,end);if(defensiveFoulGap===null||defensiveFoulGap<2)continue;}");
compare('allow-defensive-acquisition-fouls-after-2s',load('after-2s',elapsedTwo),baseline);

const elapsedThree=source.replace(blanket,"if(endType==='foul'&&kind==='acquisition'&&['ballrecovery','interception','tackle','blockedpass'].includes(startType)){const defensiveFoulGap=exactGap(start,end);if(defensiveFoulGap===null||defensiveFoulGap<3)continue;}");
compare('allow-defensive-acquisition-fouls-after-3s',load('after-3s',elapsedThree),baseline);
