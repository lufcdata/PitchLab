const fs=require('fs');
const zlib=require('zlib');
const vm=require('vm');
const {execSync}=require('child_process');

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
function differences(before,after){
  const diff=[];
  for(const id of new Set([...before.keys(),...after.keys()])){
    const a=before.get(id)||{carries:0,distance:0,progressive:0,net:0};
    const b=after.get(id)||{carries:0,distance:0,progressive:0,net:0};
    if(JSON.stringify(a)!==JSON.stringify(b))diff.push({id,before:a,after:b});
  }
  return diff;
}

execSync('git fetch origin main --depth=1',{stdio:'inherit'});
const baselineSource=execSync('git show origin/main:ui-carry-metrics.js',{encoding:'utf8'});
const candidateSource=fs.readFileSync('ui-carry-metrics.js','utf8');
const baseline=load('main-gold',baselineSource);
const candidate=load('v6-candidate',candidateSource);
const baselineCount=baseline.reconstruct(events).length;
const candidateCount=candidate.reconstruct(events).length;
const diff=differences(rounded(baseline),rounded(candidate));
const result={baselineEngine:baseline.version,candidateEngine:candidate.version,eventCount:events.length,baselineCount,candidateCount,diff};
console.log(JSON.stringify(result,null,2));
if(baselineCount!==177)throw new Error(`Forest Gold baseline moved: expected 177, got ${baselineCount}`);
if(candidateCount!==177||diff.length)throw new Error('Carry V6 changes the protected Forest carry-family player control');
if(candidate.constants.MIN_CARRY_M!==5)throw new Error('Carry V6 changed the protected 5m carry minimum');
if(candidate.constants.PROGRESSIVE_FORWARD_M!==5)throw new Error('Carry V6 changed the protected 5m progressive-forward threshold');
console.log('PASS: Carry V6 preserves all protected Forest carry-family rows and thresholds.');
