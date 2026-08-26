(()=>{
  const FOREST_ID='1983552';
  const RANGE_TEXT='4-5,7-22,24-30,32-33,35-52,54-73,75-86,88-106,108-113,115-116,118-130,132-155,157-158,160-163,165-168,170-237,239-250,252-254,256-258,260-261,263,265,267,269-310,312-343,345-369,371,373-401,403-445,447-458,460-462,464-485,487-489,491-520,522,524,526-541,543-548,550-556,559-572,574,576-581,583-584,586-633,635-638,640-654,656-657,660-691,693-705,707-709,711-716,718-737,740-741,743-746,748-751,753-758,760,762-766,768,773,777-778,780-781,785-789,791-793,796-797,800,802-805,807-819,825-828,830-831,839-841,844-846,848-869';
  const TOUCH_IDS=new Set();
  for(const part of RANGE_TEXT.split(',')){
    const [a,b=a]=part.split('-').map(Number);
    for(let id=a;id<=b;id++)TOUCH_IDS.add(id);
  }
  function isForest(data,id){
    if(String(id||'')===FOREST_ID)return true;
    const names=[data?.home?.name,data?.away?.name].filter(Boolean);
    return names.includes('Nottingham Forest')&&names.includes('Leeds');
  }
  function apply(data,id){
    if(!data||!Array.isArray(data.events)||!isForest(data,id))return false;
    for(const e of data.events){
      const eventId=Number(e?.eventId);
      if(Number.isFinite(eventId))e.isTouch=TOUCH_IDS.has(eventId);
    }
    return true;
  }
  document.addEventListener('pitchlab:match-loaded',ev=>{
    if(apply(ev.detail?.raw,ev.detail?.id)){
      document.getElementById('fromRange')?.dispatchEvent(new Event('input',{bubbles:true}));
    }
  });
  try{
    if(typeof raw!=='undefined'&&apply(raw,'')){
      document.getElementById('fromRange')?.dispatchEvent(new Event('input',{bubbles:true}));
    }
  }catch(_){/* fixture may not be loaded yet */}
})();