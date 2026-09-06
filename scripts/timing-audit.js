const fs=require('fs');
const data=JSON.parse(fs.readFileSync('WS_1903384_raw.json','utf8'));
const events=Array.isArray(data)?data:(data.events||[]);
const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
const norm=v=>String(dn(v)||'').toLowerCase().replace(/[\s_-]/g,'');
const sec=e=>Number(e.minute||0)*60+Number(e.second||0);
const typeCounts={};const qualCounts={};
for(const e of events){const t=norm(e.type);typeCounts[t]=(typeCounts[t]||0)+1;for(const q of e.qualifiers||[]){const id=q?.type?.value??q?.type;const n=dn(q?.type)||id;const key=`${id}:${n}`;qualCounts[key]=(qualCounts[key]||0)+1}}
console.log('TOP TYPES',Object.entries(typeCounts).sort((a,b)=>b[1]-a[1]));
console.log('QUALIFIERS',Object.entries(qualCounts).sort((a,b)=>b[1]-a[1]).filter(([k,v])=>/throw|corner|free|goal|kick|offside|out|restart|start|end/i.test(k)||v>20));
console.log('PERIOD ENDS',events.filter(e=>/end/.test(norm(e.type))).map(e=>({id:e.eventId,p:dn(e.period),m:e.minute,s:e.second,t:dn(e.type)})));
for(const pattern of ['throw','corner','goalkick','freekick','offside','goal']){
 const found=[];
 for(const e of events){const qs=(e.qualifiers||[]).map(q=>`${q?.type?.value??q?.type}:${dn(q?.type)}`).join('|');if(norm(e.type).includes(pattern)||qs.toLowerCase().includes(pattern))found.push({id:e.eventId,p:dn(e.period),m:e.minute,s:e.second,t:dn(e.type),out:dn(e.outcomeType),qs});}
 console.log(pattern.toUpperCase(),found.length,found.slice(0,20));
}
