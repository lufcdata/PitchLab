const fs=require('fs');
const zlib=require('zlib');
const vm=require('vm');
const source=fs.readFileSync('ui-timings.js','utf8');
function run(events){
  const context={events,window:{dispatchEvent(){}},document:{readyState:'complete',querySelector(){return null},addEventListener(){}},CustomEvent:function(type,init){return{type,detail:init?.detail}},console,Math,Number,String,Array,Map,Set,Object};
  vm.createContext(context);vm.runInContext(source,context,{filename:'ui-timings.js'});return context.window.PitchLabTiming;
}
const b=JSON.parse(fs.readFileSync('WS_1903384_raw.json','utf8'));
const bt=run(b.events||[]);
const expected={matchDuration:6015,allocatedTime:5898,addedTime:615,firstHalfDuration:2817,firstHalfAdded:117,secondHalfDuration:3198,secondHalfAdded:498,gameStops:97,throws:46,freeKicks:18,goalKicks:14,corners:13,goals:4,offsides:2,postGoalTime:364};
const diff={};for(const[k,v]of Object.entries(expected))if(bt?.[k]!==v)diff[k]={expected:v,actual:bt?.[k]};
console.log('BOURNEMOUTH',JSON.stringify(bt,null,2));
if(Object.keys(diff).length)throw new Error('Bournemouth timing control failed: '+JSON.stringify(diff));
if(bt?.ballStatusMethod!=='event-restart-estimate'||bt?.restartDetailAvailable!==true)throw new Error('Full raw fixture must expose estimated ball status and restart details');
const parts=['data/ws1983552_00.part','data/ws1983552_01.part','data/ws1983552_02.part','data/ws1983552_03.part','data/ws1983552_04.part','data/ws1983552_05a.part','data/ws1983552_05b.part','data/ws1983552_06a.part','data/ws1983552_06b.part','data/ws1983552_07a.part','data/ws1983552_07b.part','data/ws1983552_08a.part','data/ws1983552_08b.part'];
const packed=parts.map(p=>fs.readFileSync(p,'utf8').trim()).join('');
const f=JSON.parse(zlib.gunzipSync(Buffer.from(packed,'base64')).toString('utf8'));
const ft=run(Array.isArray(f)?f:(f.events||[]));
console.log('FOREST',JSON.stringify(ft,null,2));
if(!ft||ft.version!=='MATCH_TIMINGS_DYNAMIC_V1_2026-09-06'||ft.matchDuration<5400)throw new Error('Forest half timing derivation failed');
if(ft.restartDetailAvailable!==false||ft.ballStatusMethod!=='unavailable'||ft.gameStops!==null||ft.ballIn!==null||ft.ballOut!==null)throw new Error('Compact Forest fixture must not manufacture unavailable restart/ball-status detail');
if(JSON.stringify(ft)===JSON.stringify(bt))throw new Error('Fixture switch did not change timing population');
console.log('PASS: exact fixture timing fields are dynamic, full raw details are derived, and compact-source gaps remain explicitly unavailable.');
