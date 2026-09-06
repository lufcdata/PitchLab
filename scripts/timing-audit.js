const fs=require('fs');
const data=JSON.parse(fs.readFileSync('WS_1903384_raw.json','utf8'));
const events=Array.isArray(data)?data:(data.events||[]);
const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
const norm=v=>String(dn(v)||'').toLowerCase().replace(/[\s_-]/g,'');
const hasSecond=e=>e?.second!==undefined&&e?.second!==null&&e?.second!=='';
const sec=e=>Number(e.minute||0)*60+(hasSecond(e)?Number(e.second):0);
const pkey=e=>norm(e.period).includes('first')?1:norm(e.period).includes('second')?2:9;
const qs=e=>new Set((e.qualifiers||[]).map(q=>Number(q?.type?.value??q?.type)));
const ordered=[...events].filter(e=>pkey(e)<9&&hasSecond(e)).sort((a,b)=>pkey(a)-pkey(b)||sec(a)-sec(b)||(Number(a.eventId)||0)-(Number(b.eventId)||0));
const isAdmin=e=>['card','substitutionoff','substitutionon','formationchange','formationset','start','end'].includes(norm(e.type));
const restartType=e=>{const q=qs(e);if(q.has(107))return'throw';if(q.has(5))return'free';if(q.has(124))return'goalKick';if(q.has(6))return'corner';return null};
const restarts=ordered.filter(restartType);
function previousCandidate(i){for(let j=i-1;j>=0;j--){const e=ordered[j];if(pkey(e)!==pkey(ordered[i]))break;if(!isAdmin(e)&&!restartType(e))return e}return null}
let prevSum=0;const gaps=[];
for(const r of restarts){const i=ordered.indexOf(r),prev=previousCandidate(i);if(!prev)continue;const gap=Math.max(0,sec(r)-sec(prev));prevSum+=gap;gaps.push({kind:restartType(r),restart:`${r.minute}:${String(r.second).padStart(2,'0')}`,prev:`${prev.minute}:${String(prev.second).padStart(2,'0')}`,prevType:dn(prev.type),gap})}
console.log('RESTART_COUNTS',restarts.reduce((o,e)=>(o[restartType(e)]=(o[restartType(e)]||0)+1,o),{}),'sum',restarts.length);
console.log('PREVIOUS_EVENT_DEAD_SUM',prevSum,`${Math.floor(prevSum/60)}:${String(prevSum%60).padStart(2,'0')}`);
console.log('LARGEST_GAPS',gaps.sort((a,b)=>b.gap-a.gap).slice(0,30));
const goals=ordered.filter(e=>norm(e.type)==='goal');
for(const g of goals){const i=ordered.indexOf(g);console.log('GOAL_SEQ',ordered.slice(Math.max(0,i-4),Math.min(ordered.length,i+10)).map(e=>({time:`${e.minute}:${String(e.second).padStart(2,'0')}`,type:dn(e.type),out:dn(e.outcomeType),restart:restartType(e),id:e.eventId})));}
const offs=ordered.filter(e=>norm(e.type)==='offsidepass');
for(const o of offs){const i=ordered.indexOf(o);console.log('OFFSIDE_SEQ',ordered.slice(Math.max(0,i-3),Math.min(ordered.length,i+10)).map(e=>({time:`${e.minute}:${String(e.second).padStart(2,'0')}`,type:dn(e.type),out:dn(e.outcomeType),restart:restartType(e),id:e.eventId})));}
