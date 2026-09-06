const fs=require('fs');
const zlib=require('zlib');
const vm=require('vm');

const packed=fs.readFileSync('WS_1983552_compact.b64','utf8').trim();
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
