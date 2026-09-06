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
const names=decoded.playerIdNameDictionary||decoded.names||{};

const context={window:{},document:{getElementById:()=>null},console,Math,Number,String,Array,Map,Set,Object};
vm.createContext(context);
vm.runInContext(fs.readFileSync('ui-carry-metrics.js','utf8'),context,{filename:'ui-carry-metrics.js'});
const engine=context.window.PitchLabCarry;
if(!engine)throw new Error('PitchLabCarry not loaded');
const carries=engine.reconstruct(events);
const rows=[...engine.playerSummaries(events).entries()].map(([id,s])=>({id,name:names[id]||id,...s})).sort((a,b)=>String(a.name).localeCompare(String(b.name)));
console.log(JSON.stringify({engine:engine.version,eventCount:events.length,carryCount:carries.length,rows},null,2));
