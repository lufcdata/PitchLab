(()=>{
const dn=v=>v&&typeof v==='object'?(v.displayName??v.name??v.value):v;
const et=e=>String(dn(e?.type)||'').replace(/[\s_-]/g,'').toLowerCase();
const oc=e=>String(dn(e?.outcomeType)||dn(e?.outcome)||'').toLowerCase();
const opponentPass=e=>et(e)==='pass'&&Number(e?.x)<=60;
const defensiveAction=e=>Number(e?.x)>=40&&(['tackle','challenge','interception','blockedpass'].includes(et(e))||(et(e)==='foul'&&oc(e)==='unsuccessful'));
const ratio=(passes,actions)=>actions?passes/actions:null;
function summary(events,pressingTeamId,opponentTeamId,include=()=>true){let passes=0,actions=0;for(const e of Array.isArray(events)?events:[]){if(!include(e))continue;const id=String(e?.teamId??'');if(id===String(opponentTeamId)&&opponentPass(e))passes++;if(id===String(pressingTeamId)&&defensiveAction(e))actions++}return{passes,actions,ppda:ratio(passes,actions)}}
window.PitchLabPPDAGold=Object.freeze({version:'PPDA_GOLD_SHARED_V1_2026-09-15',opponentPass,defensiveAction,ratio,summary,definition:'Opponent passes with x <= 60 divided by tackles + challenges + interceptions + blocked passes + unsuccessful fouls with x >= 40.'});
})();