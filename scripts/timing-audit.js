const fs=require('fs');
const data=JSON.parse(fs.readFileSync('WS_1903384_raw.json','utf8'));
const events=Array.isArray(data)?data:(data.events||[]);
const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
const norm=v=>String(dn(v)||'').toLowerCase().replace(/[\s_-]/g,'');
const hasSecond=e=>e?.second!==undefined&&e?.second!==null&&e?.second!=='';
const sec=e=>Number(e.minute||0)*60+(hasSecond(e)?Number(e.second):0);
const pkey=e=>norm(e.period).includes('first')?1:norm(e.period).includes('second')?2:9;
const quals=e=>new Set((e.qualifiers||[]).map(q=>Number(q?.type?.value??q?.type)));
const ordered=[...events].filter(e=>pkey(e)<9&&hasSecond(e)).sort((a,b)=>pkey(a)-pkey(b)||sec(a)-sec(b)||(Number(a.eventId)||0)-(Number(b.eventId)||0));
const isAdmin=e=>['card','substitutionoff','substitutionon','formationchange','formationset','start','end'].includes(norm(e.type));
const restartType=e=>{const q=quals(e);if(q.has(107))return'throw';if(q.has(5))return'free';if(q.has(124))return'goalKick';if(q.has(6))return'corner';return null};
const restarts=ordered.filter(restartType);
function previousLive(i){for(let j=i-1;j>=0;j--){const e=ordered[j];if(pkey(e)!==pkey(ordered[i]))break;if(!isAdmin(e))return e}return null}
const byKind={};let restartDead=0;const gaps=[];
for(const r of restarts){const i=ordered.indexOf(r),prev=previousLive(i);if(!prev)continue;const gap=Math.max(0,sec(r)-sec(prev));restartDead+=gap;byKind[restartType(r)]=(byKind[restartType(r)]||0)+gap;gaps.push({kind:restartType(r),restart:`${r.minute}:${String(r.second).padStart(2,'0')}`,prev:`${prev.minute}:${String(prev.second).padStart(2,'0')}`,prevType:dn(prev.type),gap})}
const goals=ordered.filter(e=>norm(e.type)==='goal');let goalDead=0;const goalGaps=[];
for(const g of goals){const i=ordered.indexOf(g);let next=null;for(let j=i+1;j<ordered.length;j++){const e=ordered[j];if(pkey(e)!==pkey(g))break;if(isAdmin(e))continue;next=e;break}if(next){const gap=Math.max(0,sec(next)-sec(g));goalDead+=gap;goalGaps.push({goal:`${g.minute}:${String(g.second).padStart(2,'0')}`,restart:`${next.minute}:${String(next.second).padStart(2,'0')}`,gap})}}
const total=restartDead+goalDead;
const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
console.log(JSON.stringify({counts:restarts.reduce((o,e)=>(o[restartType(e)]=(o[restartType(e)]||0)+1,o),{}),restartDead,byKind,goalCount:goals.length,goalDead,goalGaps,total,totalFmt:fmt(total),expectedOut:'48:52',deltaFromExpected:total-(48*60+52)},null,2));
console.log('LARGEST',gaps.sort((a,b)=>b.gap-a.gap).slice(0,20));
