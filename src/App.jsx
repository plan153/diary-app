import { useState, useEffect, useRef } from "react";

/* ══ TOKENS ══════════════════════════════════════ */
const E = { p:"#C084FC",p2:"#A855F7",bg:"#07040E",s:"#0F0820",b:"#1E1040" };
const D = { p:"#FB923C",p2:"#F97316",bg:"#0F0600",s:"#1A0D02",b:"#3D1800" };
const M = { p:"#34D399",p2:"#10B981",bg:"#030F08",s:"#061508",b:"#0A2E1A" };
const H = { p:"#38BDF8",bg:"#020912",s:"#070F1C",b:"#0D1F38" };
const CT= { p:"#F472B6",p2:"#EC4899",bg:"#0F0008",s:"#1A0010",b:"#3D0025" };
// Color constants (must be before SharedDB)
const EC=E.p, DC=D.p, MC=M.p;

/* ══ CONTENT TYPES ═══════════════════════════════ */
const CONTENT_TYPES = [
  { id:"instagram", icon:"📸", label:"Instagram",    sub:"캡션 + 해시태그",      color:"#E1306C" },
  { id:"reel",      icon:"🎞️", label:"Reel Script",  sub:"15-30초 스크립트",    color:"#833AB4" },
  { id:"tiktok",    icon:"🎬", label:"TikTok",       sub:"훅 + 스크립트",        color:"#69C9D0" },
  { id:"thread",    icon:"🧵", label:"Thread / X",   sub:"4연속 포스팅",         color:"#1DA1F2" },
  { id:"newsletter",icon:"📮", label:"Newsletter",   sub:"주간 이메일 콘텐츠",   color:"#34D399" },
  { id:"podcast",   icon:"🎙️", label:"Podcast",      sub:"3-5분 스크립트",       color:"#F97316" },
];

/* ══ CONTENT PROMPTS ══════════════════════════════ */
const CONTENT_PROMPTS = {
  instagram: `인스타그램 포스팅을 만드세요. JSON만 반환:
{"headline":"포스트 제목(5단어)","caption":"감성적인 캡션 2-3줄","hashtags":"#해시태그 10개","image_desc":"이상적인 사진 묘사","mood":"warm/cool/vibrant/minimal"}`,
  reel: `인스타그램 릴스 스크립트를 만드세요. JSON만 반환:
{"title":"릴스 제목","hook":"첫 3초 훅(강렬하게)","scene_1":"4-8초 장면","scene_2":"8-15초 장면","scene_3":"15-25초 장면","cta":"마지막 5초 행동 유도","music_vibe":"음악 분위기(예:lo-fi chill)","caption":"릴스 캡션+해시태그5개"}`,
  tiktok: `틱톡 스크립트를 만드세요. JSON만 반환:
{"hook":"첫 3초(무조건 클릭하게)","body_1":"4-8초","body_2":"8-15초","outro":"15-18초 마무리","hashtags":"#fyp + 관련태그5개","sound_vibe":"사운드 추천","trend_tip":"트렌드 팁 한 줄"}`,
  thread: `트위터/X 스레드를 만드세요. JSON만 반환:
{"hook_tweet":"첫 트윗(훅, 280자이내)","tweet_2":"2번째 트윗(핵심)","tweet_3":"3번째 트윗(인사이트)","tweet_4":"마지막 트윗(결론+행동유도)","topic_tag":"#주제태그"}`,
  newsletter: `주간 뉴스레터를 만드세요. JSON만 반환:
{"subject":"이메일 제목","preview":"프리뷰 텍스트(40자)","greeting":"독자에게 인사(1문장)","highlight_1":"하이라이트1","highlight_2":"하이라이트2","highlight_3":"하이라이트3","reflection":"한 주 돌아보며(2문장)","cta":"독자 행동 유도(1문장)","sign_off":"마무리 인사"}`,
  podcast: `개인 팟캐스트 에피소드 스크립트를 만드세요. JSON만 반환:
{"title":"에피소드 제목","intro":"30초 인트로 스크립트","segment_1":"1분 첫 번째 주제","segment_2":"1분 두 번째 주제","segment_3":"1분 세 번째 주제","outro":"30초 아웃트로","show_notes":["노트1","노트2","노트3"]}`,
};

/* ══ LEVELS & BADGES ══════════════════════════════ */
const LEVELS=[
  {lv:1,name:"Seed",   kor:"씨앗",   icon:"🌱",min:0,   max:100,  c:"#86EFAC"},
  {lv:2,name:"Sprout", kor:"새싹",   icon:"🌿",min:100, max:300,  c:"#4ADE80"},
  {lv:3,name:"Tree",   kor:"나무",   icon:"🌳",min:300, max:600,  c:"#22C55E"},
  {lv:4,name:"Star",   kor:"별",     icon:"⭐",min:600, max:1100, c:"#FCD34D"},
  {lv:5,name:"Moon",   kor:"달",     icon:"🌙",min:1100,max:1800, c:"#A78BFA"},
  {lv:6,name:"Ocean",  kor:"바다",   icon:"🌊",min:1800,max:2800, c:"#38BDF8"},
  {lv:7,name:"Master", kor:"마스터", icon:"👑",min:2800,max:9999, c:"#F97316"},
];
const BADGE_DEFS=[
  {id:"first_echo",  icon:"🎙️",name:"첫 대화",   desc:"ECHO 첫 일기",   xp:20},
  {id:"first_dayly", icon:"⚡", name:"첫 클릭",   desc:"DAYLY 첫 일기",  xp:20},
  {id:"first_memoir",icon:"🌐",name:"첫 위키",   desc:"MEMOIR 생성",    xp:25},
  {id:"all_three",   icon:"🌟",name:"트리오",    desc:"세 앱 모두 사용", xp:50},
  {id:"streak_3",    icon:"🔥",name:"3일 연속",  desc:"3일 연속 기록",  xp:30},
  {id:"streak_7",    icon:"⚡",name:"7일 연속",  desc:"7일 연속 기록",  xp:70},
  {id:"entries_5",   icon:"📓",name:"5개 일기",  desc:"총 5개 저장",    xp:25},
  {id:"first_content",icon:"🎬",name:"첫 콘텐츠",desc:"콘텐츠 첫 생성", xp:30},
  {id:"content_all", icon:"🏆",name:"콘텐츠 마스터",desc:"6가지 모두 생성",xp:100},
];

/* ══ DATA ════════════════════════════════════════ */
const MOODS=[{id:"rad",emoji:"🤩",eng:"Rad",kor:"최고야",c:"#FCD34D"},{id:"good",emoji:"😊",eng:"Good",kor:"좋아",c:"#4ADE80"},{id:"okay",emoji:"😐",eng:"Okay",kor:"그냥",c:"#94A3B8"},{id:"bad",emoji:"😔",eng:"Bad",kor:"별로",c:"#60A5FA"},{id:"awful",emoji:"😭",eng:"Awful",kor:"최악",c:"#F87171"},{id:"tired",emoji:"😴",eng:"Tired",kor:"피곤해",c:"#A78BFA"},{id:"angry",emoji:"😤",eng:"Angry",kor:"화났어",c:"#EF4444"},{id:"calm",emoji:"😌",eng:"Calm",kor:"평온해",c:"#38BDF8"},{id:"excited",emoji:"🥳",eng:"Excited",kor:"신나!",c:"#FB923C"},{id:"nervous",emoji:"😰",eng:"Nervous",kor:"긴장",c:"#34D399"}];
const ACTS=[{id:"coffee",emoji:"☕",eng:"Coffee",kor:"커피"},{id:"workout",emoji:"🏋️",eng:"Workout",kor:"운동"},{id:"study",emoji:"📚",eng:"Study",kor:"공부"},{id:"work",emoji:"💼",eng:"Work",kor:"일"},{id:"dining",emoji:"🍽️",eng:"Dining",kor:"외식"},{id:"cooking",emoji:"🍳",eng:"Cooking",kor:"요리"},{id:"shopping",emoji:"🛒",eng:"Shopping",kor:"쇼핑"},{id:"gaming",emoji:"🎮",eng:"Gaming",kor:"게임"},{id:"movie",emoji:"🎬",eng:"Movie",kor:"영화"},{id:"walk",emoji:"🌿",eng:"Walking",kor:"산책"},{id:"meeting",emoji:"🤝",eng:"Meeting",kor:"미팅"},{id:"reading",emoji:"📖",eng:"Reading",kor:"독서"},{id:"music",emoji:"🎵",eng:"Music",kor:"음악"},{id:"travel",emoji:"✈️",eng:"Travel",kor:"여행"},{id:"sns",emoji:"📱",eng:"Social",kor:"SNS"},{id:"nap",emoji:"🛏️",eng:"Rest",kor:"휴식"},{id:"hangout",emoji:"🎉",eng:"Hangout",kor:"놀기"},{id:"pet",emoji:"🐾",eng:"Pet",kor:"반려동물"},{id:"doctor",emoji:"💊",eng:"Doctor",kor:"병원"},{id:"cleaning",emoji:"🧹",eng:"Clean",kor:"청소"}];
const WHOM=[{id:"alone",emoji:"🧍",eng:"Alone",kor:"혼자"},{id:"partner",emoji:"💑",eng:"Partner",kor:"연인"},{id:"family",emoji:"👨‍👩‍👧",eng:"Family",kor:"가족"},{id:"friends",emoji:"👥",eng:"Friends",kor:"친구들"},{id:"colleague",emoji:"👔",eng:"Colleagues",kor:"동료"},{id:"pet2",emoji:"🐕",eng:"Pet",kor:"반려동물"}];
const LOCS=[{id:"home",emoji:"🏠",eng:"Home",kor:"집"},{id:"office",emoji:"🏢",eng:"Office",kor:"직장"},{id:"cafe",emoji:"☕",eng:"Cafe",kor:"카페"},{id:"park",emoji:"🌳",eng:"Park",kor:"공원"},{id:"gym",emoji:"🏋️",eng:"Gym",kor:"헬스장"},{id:"mall",emoji:"🏬",eng:"Mall",kor:"쇼핑몰"},{id:"restaurant",emoji:"🍽️",eng:"Restaurant",kor:"식당"},{id:"school",emoji:"🏫",eng:"School",kor:"학교"},{id:"travel",emoji:"✈️",eng:"Traveling",kor:"여행중"},{id:"hospital",emoji:"🏥",eng:"Hospital",kor:"병원"}];
const WX=[{id:"sunny",emoji:"☀️",eng:"Sunny",kor:"맑음"},{id:"cloudy",emoji:"⛅",eng:"Cloudy",kor:"흐림"},{id:"rainy",emoji:"🌧️",eng:"Rainy",kor:"비"},{id:"snowy",emoji:"❄️",eng:"Snowy",kor:"눈"},{id:"windy",emoji:"💨",eng:"Windy",kor:"바람"},{id:"hot",emoji:"🌡️",eng:"Hot",kor:"더움"},{id:"cool",emoji:"🌬️",eng:"Cool",kor:"시원"}];

/* ══ SENSOR DATA ════════════════════════════════ */
function buildSD(){
  const W=["맑음 23°C ☀️","흐림 18°C ⛅","비 15°C 🌧️","구름조금 24°C 🌤️"];
  const PL=[["집","🏠","2h 30m"],["스타벅스","☕","45m"],["서울숲","🌳","1h 10m"],["이마트","🛒","35m"],["사무실","🏢","8h 20m"]];
  const MU=["IU — 밤편지","NewJeans — Hype Boy","aespa — Supernova","BTS — Spring Day","Lo-fi Study Beats"];
  const sl=(5.5+Math.random()*3.5).toFixed(1);
  const wk=`0${Math.floor(6+Math.random()*3)}:${String(Math.floor(10+Math.random()*50)).padStart(2,"0")}`;
  const st=Math.floor(3000+Math.random()*13000);
  return {date:new Date().toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric",weekday:"long"}),weather:W[Math.floor(Math.random()*W.length)],aqi:Math.floor(18+Math.random()*65),sleep:{duration:sl,wakeTime:wk,quality:["보통","좋음","매우 좋음"][Math.floor(Math.random()*3)]},steps:{count:st,distance:(st*0.0008).toFixed(1),calories:Math.floor(st*0.04)},places:[...PL].sort(()=>Math.random()-0.5).slice(0,3),music:[...MU].sort(()=>Math.random()-0.5).slice(0,3),screenTime:(2+Math.random()*5).toFixed(1),battery:{start:Math.floor(80+Math.random()*20),end:Math.floor(15+Math.random()*35)},hrAvg:Math.floor(62+Math.random()*20)};
}

/* ══ SHARED DB ═══════════════════════════════════ */
const db={
  get:(k)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch{return null;}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}},
};
const SharedDB={
  all(){return{echo:db.get("echo_v1")||{xp:0,history:[]},dayly:db.get("dayly_v1")||{xp:0,history:[]},memoir:db.get("memoir_v1")||{xp:0}};},
  totalXP(){const{echo,dayly,memoir}=this.all();return(echo.xp||0)+(dayly.xp||0)+(memoir.xp||0)+(db.get("shared_v1")||{}).contentXp||0;},
  entries(){
    const{echo,dayly}=this.all();
    const E=(echo.history||[]).map(e=>({...e,src:"echo",srcLabel:"ECHO",srcIcon:"🎙️",srcColor:EC}));
    const D=(dayly.history||[]).map(e=>({...e,src:"dayly",srcLabel:"DAYLY",srcIcon:"⚡",srcColor:DC}));
    return[...E,...D].sort((a,b)=>new Date(b.date)-new Date(a.date));
  },
  entriesByPeriod(period){
    const all=this.entries();
    const now=new Date();
    return all.filter(e=>{
      const d=new Date(e.date);
      if(period==="today"){return d.toDateString()===now.toDateString();}
      if(period==="week"){const w=new Date(now);w.setDate(w.getDate()-7);return d>=w;}
      if(period==="month"){const m=new Date(now);m.setDate(m.getDate()-30);return d>=m;}
      return true;
    });
  },
  streak(){
    const all=this.entries();if(!all.length)return 0;
    const dates=[...new Set(all.map(e=>e.date.split("T")[0]))].sort().reverse();
    let s=0;let d=new Date();
    for(const dt of dates){const ex=d.toISOString().split("T")[0];if(dt===ex){s++;d.setDate(d.getDate()-1);}else break;}
    return s;
  },
  weekDays(){
    const all=this.entries();const ds=new Set(all.map(e=>e.date.split("T")[0]));
    const W=["일","월","화","수","목","금","토"];
    return Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return{key:d.toISOString().split("T")[0],label:W[d.getDay()],has:ds.has(d.toISOString().split("T")[0]),isToday:i===6};});
  },
  badges(){return(db.get("shared_v1")||{badges:[]}).badges||[];},
  contentCreated(){return(db.get("shared_v1")||{contentCreated:[]}).contentCreated||[];},
  checkBadges(){
    const cur=this.badges();const{echo,dayly,memoir}=this.all();const all=this.entries();const streak=this.streak();const cc=this.contentCreated();
    const earned=[];
    [{id:"first_echo",f:()=>(echo.history||[]).length>0},{id:"first_dayly",f:()=>(dayly.history||[]).length>0},{id:"first_memoir",f:()=>(memoir.xp||0)>0},{id:"all_three",f:()=>(echo.history||[]).length>0&&(dayly.history||[]).length>0&&(memoir.xp||0)>0},{id:"streak_3",f:()=>streak>=3},{id:"streak_7",f:()=>streak>=7},{id:"entries_5",f:()=>all.length>=5},{id:"first_content",f:()=>cc.length>0},{id:"content_all",f:()=>CONTENT_TYPES.every(t=>cc.includes(t.id))}].forEach(({id,f})=>{if(!cur.includes(id)&&f()){earned.push(id);}});
    if(earned.length){const sv=db.get("shared_v1")||{};db.set("shared_v1",{...sv,badges:[...(sv.badges||[]),...earned]});}
    return earned;
  },
  topMood(){const{dayly}=this.all();const cnt={};(dayly.history||[]).forEach(e=>{if(e.mood){if(!cnt[e.mood.id])cnt[e.mood.id]={c:0,m:e.mood};cnt[e.mood.id].c++;}});return Object.values(cnt).sort((a,b)=>b.c-a.c)[0]?.m||null;},
  topAct(){const{dayly}=this.all();const cnt={};(dayly.history||[]).forEach(e=>(e.acts||[]).forEach(a=>{if(!cnt[a.id])cnt[a.id]={c:0,a};cnt[a.id].c++;}));return Object.values(cnt).sort((a,b)=>b.c-a.c)[0]?.a||null;},
  addContentXp(type){
    const sv=db.get("shared_v1")||{contentXp:0,contentCreated:[]};
    const created=[...new Set([...(sv.contentCreated||[]),type])];
    db.set("shared_v1",{...sv,contentXp:(sv.contentXp||0)+15,contentCreated:created});
  },
};

/* ══ UTILS ════════════════════════════════════════ */
function getApiKey(){
  return sessionStorage.getItem("anthropic_key")||"";
}
function getModel(){
  return sessionStorage.getItem("anthropic_model")||"claude-3-haiku-20240307";
}
async function aiCall(msgs,sys,tokens=800){
  const key=getApiKey();
  const headers={"Content-Type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"};
  if(key)headers["x-api-key"]=key;
  // Try models in order of preference
  const MODELS=["claude-3-haiku-20240307","claude-3-5-haiku-20241022","claude-3-5-sonnet-20241022","claude-sonnet-4-20250514"];
  const savedModel=getModel();
  const tryList=[savedModel,...MODELS.filter(m=>m!==savedModel)];
  for(const model of tryList){
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers,body:JSON.stringify({model,max_tokens:tokens,system:sys,messages:msgs})});
    const d=await r.json();
    if(!d.error){sessionStorage.setItem("anthropic_model",model);return d.content[0].text;}
    if(d.error&&!d.error.message.includes("model"))throw new Error(d.error.message);
  }
  throw new Error("사용 가능한 모델이 없습니다.");
}
function getCtx(){const h=new Date().getHours();const W=["☀️ 맑음 23°C","⛅ 흐림 18°C","🌧️ 비 15°C","🌤️ 구름 24°C"];return{timeName:h<6?"새벽":h<12?"아침":h<18?"오후":h<22?"저녁":"밤",weather:W[Math.floor(Math.random()*W.length)],sleep:(5.5+Math.random()*3.5).toFixed(1),steps:Math.floor(1800+Math.random()*9500).toLocaleString(),battery:Math.floor(35+Math.random()*60),date:new Date().toLocaleDateString("ko-KR",{month:"long",day:"numeric",weekday:"long"})};}
const getLv=(xp)=>LEVELS.find(l=>xp>=l.min&&xp<l.max)||LEVELS[LEVELS.length-1];
const getLvPr=(xp)=>{const l=getLv(xp);return(xp-l.min)/(l.max-l.min);};
const fmtDate=(iso)=>new Date(iso).toLocaleDateString("ko-KR",{month:"short",day:"numeric",weekday:"short"});
const fmtTime=(iso)=>new Date(iso).toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"});

/* ══ SHARED COMPONENTS ════════════════════════════ */
function LvBar({xp,ac}){const lv=getLv(xp),pr=getLvPr(xp),c=ac||lv.c;return(<div style={{display:"flex",alignItems:"center",gap:8}}><span>{lv.icon}</span><div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10,fontWeight:700,color:c}}>Lv.{lv.lv} {lv.name}</span><span style={{fontSize:9,color:"#475569"}}>{xp} XP</span></div><div style={{height:4,background:"rgba(255,255,255,0.08)",borderRadius:2}}><div style={{height:"100%",width:`${Math.min(pr*100,100)}%`,background:c,borderRadius:2,transition:"width 0.6s"}}/></div></div></div>);}
function DiaryCard({content,ac,onSave}){const[kor,setKor]=useState(false);const[eng,setEng]=useState(content.diary_eng||content.story_eng||"");const[saved,setSaved]=useState(false);return(<div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,border:`1.5px solid ${ac}50`,overflow:"hidden"}}><div style={{background:`linear-gradient(135deg,${ac}30,${ac}10)`,padding:"12px 16px"}}><div style={{fontSize:9,color:ac,letterSpacing:2,marginBottom:3}}>✨ 오늘의 이야기</div><div style={{fontSize:15,fontWeight:700,color:"#F1F5F9"}}>{content.title||content.headline||"My Day"}</div></div><div style={{padding:"14px 16px"}}><div style={{fontSize:9,color:ac,letterSpacing:1.5,fontWeight:700,marginBottom:6}}>🇬🇧 ENGLISH</div><textarea value={eng} onChange={e=>setEng(e.target.value)} style={{width:"100%",background:"rgba(0,0,0,0.4)",border:`1px solid ${ac}30`,borderRadius:10,padding:"10px 12px",fontSize:13,color:"#F1F5F9",lineHeight:1.75,resize:"vertical",minHeight:90,fontFamily:"Georgia,serif",boxSizing:"border-box",outline:"none"}}/><button onClick={()=>setKor(!kor)} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"5px 14px",color:"#94A3B8",fontSize:11,cursor:"pointer",margin:"8px 0",fontFamily:"'Noto Sans KR',sans-serif"}}>{kor?"🙈 숨기기":"🇰🇷 한국어 보기"}</button>{kor&&<div style={{background:"rgba(0,0,0,0.3)",borderRadius:10,padding:"10px 12px",marginBottom:8,fontSize:13,color:"#94A3B8",lineHeight:1.75,fontFamily:"'Noto Sans KR',sans-serif"}}>{content.diary_kor||content.story_kor}</div>}{onSave&&<button onClick={()=>{onSave(eng);setSaved(true);}} disabled={saved} style={{width:"100%",padding:"12px",border:"none",borderRadius:12,fontWeight:700,fontSize:14,cursor:saved?"default":"pointer",fontFamily:"'Noto Sans KR',sans-serif",background:saved?"#052E16":`linear-gradient(135deg,${ac}CC,${ac})`,color:saved?"#34D399":"#fff"}}>{saved?"✅ 저장 완료!":"💾 저장하기 (+30 XP)"}</button>}</div></div>);}

/* ══════════════════════════════════════════════════
   🎬  PHASE 5: CONTENT STUDIO
══════════════════════════════════════════════════ */

function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text).catch(()=>{});
    setDone(true);
    setTimeout(()=>setDone(false), 2000);
  };
  return (
    <button onClick={copy} style={{
      padding:"8px 16px", borderRadius:10, border:`1px solid ${CT.p}50`,
      background:done?`${CT.p}20`:"transparent", color:done?"#F472B6":"#94A3B8",
      fontSize:12, fontWeight:700, cursor:"pointer", transition:"all 0.2s",
    }}>
      {done ? "✅ 복사됨!" : "📋 복사하기"}
    </button>
  );
}

function ContentPreview({ type, data }) {
  const t = CONTENT_TYPES.find(x=>x.id===type);
  if (!t || !data) return null;

  const Section = ({label, value, mono=false}) => value ? (
    <div style={{marginBottom:10}}>
      <div style={{fontSize:9,color:t.color,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>{label}</div>
      <div style={{background:"rgba(0,0,0,0.35)",borderRadius:8,padding:"9px 12px",fontSize:12,color:"#CBD5E1",lineHeight:1.7,fontFamily:mono?"monospace":"'Noto Sans KR',sans-serif"}}>
        {Array.isArray(value) ? value.map((v,i)=><div key={i} style={{padding:"3px 0",borderBottom:i<value.length-1?"1px solid rgba(255,255,255,0.06)":"none"}}>{v}</div>) : value}
      </div>
    </div>
  ) : null;

  // Build full text for copy
  const fullText = Object.values(data).flat().join('\n\n');

  return (
    <div style={{background:CT.s,borderRadius:16,border:`1.5px solid ${t.color}50`,overflow:"hidden",marginTop:14}}>
      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${t.color}30,${t.color}10)`,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:22}}>{t.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:800,color:t.color}}>{t.label}</div>
          <div style={{fontSize:10,color:"#64748B"}}>{t.sub}</div>
        </div>
        <CopyBtn text={fullText}/>
      </div>

      <div style={{padding:"14px 16px"}}>
        {/* Instagram */}
        {type==="instagram"&&<>
          <Section label="📌 HEADLINE" value={data.headline}/>
          <Section label="✍️ CAPTION" value={data.caption}/>
          <Section label="📸 IDEAL IMAGE" value={data.image_desc}/>
          <Section label="#️⃣ HASHTAGS" value={data.hashtags}/>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
            <span style={{fontSize:10,color:"#64748B"}}>Mood:</span>
            <span style={{fontSize:10,padding:"2px 10px",borderRadius:20,background:`${t.color}20`,color:t.color,fontWeight:700}}>{data.mood}</span>
          </div>
        </>}

        {/* Reel */}
        {type==="reel"&&<>
          <Section label="🎯 TITLE" value={data.title}/>
          <Section label="⚡ HOOK (0-3s)" value={data.hook}/>
          <Section label="🎬 SCENE 1 (4-8s)" value={data.scene_1}/>
          <Section label="🎬 SCENE 2 (8-15s)" value={data.scene_2}/>
          <Section label="🎬 SCENE 3 (15-25s)" value={data.scene_3}/>
          <Section label="🏁 CTA (마지막)" value={data.cta}/>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <div style={{flex:1,background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"8px 10px"}}>
              <div style={{fontSize:9,color:t.color,marginBottom:2}}>🎵 MUSIC</div>
              <div style={{fontSize:11,color:"#94A3B8"}}>{data.music_vibe}</div>
            </div>
          </div>
          <div style={{marginTop:8}}><Section label="📸 CAPTION" value={data.caption}/></div>
        </>}

        {/* TikTok */}
        {type==="tiktok"&&<>
          <div style={{background:`${t.color}15`,borderRadius:10,padding:"10px 12px",marginBottom:10,border:`1px solid ${t.color}30`}}>
            <div style={{fontSize:9,color:t.color,fontWeight:700,marginBottom:3}}>🪝 HOOK — 첫 3초</div>
            <div style={{fontSize:14,fontWeight:700,color:"#F1F5F9",lineHeight:1.4}}>{data.hook}</div>
          </div>
          <Section label="📹 BODY 1 (4-8s)" value={data.body_1}/>
          <Section label="📹 BODY 2 (8-15s)" value={data.body_2}/>
          <Section label="🏁 OUTRO" value={data.outro}/>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:6}}>
            <div style={{background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"6px 10px",flex:1}}>
              <div style={{fontSize:9,color:t.color,marginBottom:2}}>🔊 SOUND</div>
              <div style={{fontSize:11,color:"#94A3B8"}}>{data.sound_vibe}</div>
            </div>
          </div>
          <div style={{marginTop:8}}><Section label="#️⃣ HASHTAGS" value={data.hashtags}/></div>
          {data.trend_tip&&<div style={{fontSize:11,color:t.color,background:`${t.color}10`,borderRadius:8,padding:"7px 10px",marginTop:6,borderLeft:`2px solid ${t.color}`}}>💡 {data.trend_tip}</div>}
        </>}

        {/* Thread */}
        {type==="thread"&&<>
          <div style={{fontSize:9,color:t.color,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>🧵 THREAD</div>
          {[data.hook_tweet, data.tweet_2, data.tweet_3, data.tweet_4].filter(Boolean).map((tweet,i)=>(
            <div key={i} style={{display:"flex",gap:10,marginBottom:10}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:`${t.color}30`,border:`2px solid ${t.color}60`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:t.color,flexShrink:0}}>{i+1}</div>
                {i<3&&<div style={{width:2,height:20,background:`${t.color}30`}}/>}
              </div>
              <div style={{flex:1,background:"rgba(0,0,0,0.3)",borderRadius:10,padding:"9px 12px",fontSize:12,color:"#CBD5E1",lineHeight:1.6,marginBottom:0}}>
                {i===0&&<span style={{fontSize:9,color:t.color,fontWeight:700,display:"block",marginBottom:3}}>HOOK ✦</span>}
                {tweet}
              </div>
            </div>
          ))}
          {data.topic_tag&&<div style={{fontSize:11,color:t.color,fontWeight:700}}>{data.topic_tag}</div>}
        </>}

        {/* Newsletter */}
        {type==="newsletter"&&<>
          <div style={{background:`${t.color}15`,borderRadius:10,padding:"10px 12px",marginBottom:10}}>
            <div style={{fontSize:9,color:t.color,marginBottom:2}}>📧 SUBJECT LINE</div>
            <div style={{fontSize:14,fontWeight:700,color:"#F1F5F9"}}>{data.subject}</div>
            <div style={{fontSize:10,color:"#64748B",marginTop:2}}>Preview: {data.preview}</div>
          </div>
          <Section label="👋 GREETING" value={data.greeting}/>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:9,color:t.color,fontWeight:700,letterSpacing:1.5,marginBottom:6}}>⭐ HIGHLIGHTS</div>
            {[data.highlight_1,data.highlight_2,data.highlight_3].filter(Boolean).map((h,i)=>(
              <div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:i<2?"1px solid rgba(255,255,255,0.05)":"none"}}>
                <span style={{color:t.color,flexShrink:0}}>→</span>
                <span style={{fontSize:12,color:"#CBD5E1"}}>{h}</span>
              </div>
            ))}
          </div>
          <Section label="💭 REFLECTION" value={data.reflection}/>
          <Section label="👉 CTA" value={data.cta}/>
          <Section label="✍️ SIGN OFF" value={data.sign_off}/>
        </>}

        {/* Podcast */}
        {type==="podcast"&&<>
          <div style={{background:`${t.color}15`,borderRadius:10,padding:"10px 12px",marginBottom:10}}>
            <div style={{fontSize:9,color:t.color,marginBottom:2}}>🎙️ EPISODE TITLE</div>
            <div style={{fontSize:14,fontWeight:700,color:"#F1F5F9"}}>{data.title}</div>
          </div>
          <Section label="🎬 INTRO (30s)" value={data.intro}/>
          <Section label="📢 SEGMENT 1 (1min)" value={data.segment_1}/>
          <Section label="📢 SEGMENT 2 (1min)" value={data.segment_2}/>
          <Section label="📢 SEGMENT 3 (1min)" value={data.segment_3}/>
          <Section label="🏁 OUTRO (30s)" value={data.outro}/>
          {data.show_notes&&<div>
            <div style={{fontSize:9,color:t.color,fontWeight:700,letterSpacing:1.5,marginBottom:6}}>📝 SHOW NOTES</div>
            {(Array.isArray(data.show_notes)?data.show_notes:[data.show_notes]).map((n,i)=>(
              <div key={i} style={{fontSize:11,color:"#94A3B8",padding:"3px 0",display:"flex",gap:6}}><span style={{color:t.color}}>·</span>{n}</div>
            ))}
          </div>}
        </>}
      </div>
    </div>
  );
}

function ContentStudio({ onBack }) {
  const [period, setPeriod]   = useState("week");
  const [selType, setSelType] = useState(null);
  const [genning, setGenning] = useState(false);
  const [results, setResults] = useState({});
  const [toast, setToast]     = useState(null);
  const [newBadges, setNewBadges] = useState([]);
  const entries = SharedDB.entriesByPeriod(period);
  const created = SharedDB.contentCreated();
  const totalXP = SharedDB.totalXP();

  const buildContext = () => {
    const titles = entries.map(e=>e.title).slice(0,5).join(" / ");
    const texts  = entries.map(e=>e.text||"").slice(0,3).join(" | ");
    const moods  = [...new Set(entries.filter(e=>e.mood).map(e=>e.mood.eng))].slice(0,4).join(", ");
    const acts   = [...new Set(entries.flatMap(e=>e.acts||[]).map(a=>a.eng))].slice(0,6).join(", ");
    const period_label = period==="today"?"오늘":period==="week"?"이번 주":"이번 달";
    return `기간: ${period_label} (${entries.length}개 일기)\n제목들: ${titles||"일상 기록"}\n내용 요약: ${texts.slice(0,300)||"하루하루 성실하게 살아가고 있습니다"}\n감정들: ${moods||"다양한 감정"}\n활동들: ${acts||"다양한 활동"}\n날짜: ${new Date().toLocaleDateString("ko-KR",{month:"long",day:"numeric",weekday:"long"})}`;
  };

  const generate = async (typeId) => {
    setSelType(typeId);
    setGenning(true);
    const ctx = buildContext();
    const sys = `당신은 소셜미디어 콘텐츠 크리에이터입니다. 사용자의 일기 데이터로 매력적인 콘텐츠를 만드세요.\n${CONTENT_PROMPTS[typeId]}\n\n중요: JSON만 반환하세요. 마크다운이나 백틱 없이.`;
    try {
      const raw = await aiCall([{role:"user",content:ctx}], sys, 900);
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setResults(prev=>({...prev,[typeId]:parsed}));
      SharedDB.addContentXp(typeId);
      const nb = SharedDB.checkBadges();
      if(nb.length){ setNewBadges(nb); setTimeout(()=>setNewBadges([]),4000); }
      setToast(`${CONTENT_TYPES.find(t=>t.id===typeId)?.label} 생성 완료! (+15 XP)`);
      setTimeout(()=>setToast(null),3000);
    } catch {
      const fallback = {
        instagram:{headline:"오늘의 이야기",caption:"매일이 새로운 챕터입니다 📖",hashtags:"#일상 #감성 #오늘 #diary #ECHO",image_desc:"따뜻한 빛이 드는 카페",mood:"warm"},
        reel:{title:"오늘 하루",hook:"이 영상 보면 당신의 하루도 달라집니다",scene_1:"아침을 여는 순간",scene_2:"하루의 가장 빛나는 순간",scene_3:"저녁의 여운",cta:"여러분의 오늘은 어땠나요?",music_vibe:"lo-fi chill",caption:"오늘도 잘 살아냈습니다 🌙\n#일상 #vlog"},
        tiktok:{hook:"이 말 진심으로 필요한 사람?",body_1:"오늘 하루도 최선을 다했다면",body_2:"그걸로 충분합니다",outro:"내일도 같이 해봐요",hashtags:"#fyp #감성 #일상 #동기부여",sound_vibe:"emotional acoustic",trend_tip:"'오늘 하루' 시리즈로 연재해보세요"},
        thread:{hook_tweet:"오늘 하루를 돌아봤습니다. 🧵",tweet_2:"작은 순간들이 모여 하루가 되고",tweet_3:"하루가 쌓여 인생이 됩니다.",tweet_4:"오늘도 수고하셨습니다. 내일도 화이팅! 💪",topic_tag:"#일상기록"},
        newsletter:{subject:"이번 주 나의 이야기",preview:"작은 순간들의 기록",greeting:"안녕하세요, 독자 여러분!",highlight_1:"이번 주 가장 기억에 남는 순간",highlight_2:"새롭게 배운 것들",highlight_3:"다음 주 기대하는 것들",reflection:"매일 기록하는 것의 가치를 느낍니다.",cta:"여러분도 오늘 하루를 기록해보세요.",sign_off:"감사합니다 🌙"},
        podcast:{title:"오늘 하루, 그 가치에 대해",intro:"안녕하세요. 오늘은 제 일상의 이야기를 나눕니다.",segment_1:"아침의 소중함에 대해",segment_2:"하루 중 가장 의미 있었던 순간",segment_3:"내일을 기대하는 이유",outro:"들어주셔서 감사합니다. 내일도 좋은 하루 되세요!",show_notes:["일상의 소중함","기록의 힘","내일을 향한 기대"]},
      };
      setResults(prev=>({...prev,[typeId]:fallback[typeId]||{}}));
      SharedDB.addContentXp(typeId);
    }
    setGenning(false);
  };

  const PERIODS = [
    {id:"today",label:"오늘",cnt:SharedDB.entriesByPeriod("today").length},
    {id:"week", label:"이번 주",cnt:SharedDB.entriesByPeriod("week").length},
    {id:"month",label:"이번 달",cnt:SharedDB.entriesByPeriod("month").length},
  ];

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:CT.bg,fontFamily:"'Noto Sans KR',system-ui,sans-serif",color:"#F1F5F9"}}>

      {/* Badge toast */}
      {newBadges.length>0&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:99,background:"linear-gradient(135deg,#FCD34D,#F97316)",color:"#fff",borderRadius:12,padding:"10px 20px",fontSize:13,fontWeight:700,boxShadow:"0 4px 20px rgba(0,0,0,0.5)",whiteSpace:"nowrap"}}>🏅 배지 획득! {newBadges.map(id=>BADGE_DEFS.find(b=>b.id===id)?.icon).join(" ")}</div>}
      {toast&&<div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",zIndex:99,background:CT.p,color:"#fff",borderRadius:12,padding:"8px 18px",fontSize:12,fontWeight:700,whiteSpace:"nowrap",boxShadow:"0 4px 14px rgba(0,0,0,0.4)"}}>{toast}</div>}

      {/* Topbar */}
      <div style={{background:"linear-gradient(135deg,#1A0010,#0F0008)",padding:"12px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${CT.b}`,flexShrink:0}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:CT.p,fontSize:20,cursor:"pointer",padding:0}}>←</button>
        <div style={{width:32,height:32,borderRadius:9,background:`${CT.p}25`,border:`1.5px solid ${CT.p}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🎬</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:800,color:CT.p}}>Content Studio</div>
          <div style={{fontSize:9,color:"#6B0032"}}>일기 → 콘텐츠 자동 변환 · Phase 5</div>
        </div>
        <div style={{minWidth:100}}><LvBar xp={totalXP} ac={CT.p}/></div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"14px 14px"}}>

        {/* Data summary */}
        <div style={{background:CT.s,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`1px solid ${CT.b}`}}>
          <div style={{fontSize:9,color:CT.p,letterSpacing:1.5,marginBottom:8}}>📊 사용 가능한 데이터</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {[
              {icon:"🎙️",label:"ECHO",cnt:(SharedDB.all().echo.history||[]).length,c:EC},
              {icon:"⚡",label:"DAYLY",cnt:(SharedDB.all().dayly.history||[]).length,c:DC},
              {icon:"🎬",label:"생성 완료",cnt:created.length+"/6",c:CT.p},
            ].map((s,i)=>(
              <div key={i} style={{background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"7px 12px",display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontSize:14}}>{s.icon}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:s.c}}>{s.cnt}</div>
                  <div style={{fontSize:8,color:"#475569"}}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Period selector */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,color:"#64748B",letterSpacing:1.5,marginBottom:8}}>📅 기간 선택</div>
          <div style={{display:"flex",gap:7}}>
            {PERIODS.map(p=>(
              <button key={p.id} onClick={()=>setPeriod(p.id)}
                style={{flex:1,padding:"9px 4px",borderRadius:10,border:`1.5px solid ${period===p.id?CT.p:CT.b}`,background:period===p.id?`${CT.p}18`:"transparent",cursor:"pointer",textAlign:"center"}}>
                <div style={{fontSize:12,fontWeight:700,color:period===p.id?CT.p:"#64748B"}}>{p.label}</div>
                <div style={{fontSize:9,color:"#475569"}}>{p.cnt}개 일기</div>
              </button>
            ))}
          </div>
        </div>

        {/* No data warning */}
        {entries.length===0&&(
          <div style={{background:`${CT.p}10`,borderRadius:12,padding:"14px",marginBottom:14,border:`1px solid ${CT.p}30`,textAlign:"center"}}>
            <div style={{fontSize:20,marginBottom:6}}>⚠️</div>
            <div style={{fontSize:12,color:CT.p,fontWeight:700,marginBottom:4}}>{period==="today"?"오늘 아직 일기가 없어요":period==="week"?"이번 주 일기가 없어요":"이번 달 일기가 없어요"}</div>
            <div style={{fontSize:11,color:"#64748B"}}>ECHO나 DAYLY에서 일기를 작성하면 더 좋은 콘텐츠가 생성돼요</div>
          </div>
        )}

        {/* Content type grid */}
        <div style={{fontSize:9,color:"#64748B",letterSpacing:1.5,marginBottom:8}}>🎯 콘텐츠 타입 선택</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:4}}>
          {CONTENT_TYPES.map(t=>{
            const isDone = created.includes(t.id);
            const isActive = selType===t.id;
            const isLoading = genning && isActive;
            return (
              <button key={t.id} onClick={()=>!isLoading&&generate(t.id)}
                style={{padding:"12px 8px",borderRadius:14,border:`1.5px solid ${isActive?t.color:isDone?t.color+"50":CT.b}`,background:isActive?`${t.color}22`:isDone?`${t.color}10`:"transparent",cursor:isLoading?"not-allowed":"pointer",textAlign:"center",transition:"all 0.15s",position:"relative"}}>
                {isDone&&<div style={{position:"absolute",top:4,right:6,fontSize:8,color:t.color,fontWeight:700}}>✓</div>}
                <div style={{fontSize:22,marginBottom:4}}>{isLoading?"⏳":t.icon}</div>
                <div style={{fontSize:10,fontWeight:700,color:isActive?t.color:isDone?t.color+"CC":"#94A3B8",lineHeight:1.2}}>{t.label}</div>
                <div style={{fontSize:8,color:"#475569",marginTop:2}}>{isLoading?"생성 중…":t.sub}</div>
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{background:CT.s,borderRadius:10,padding:"10px 14px",marginBottom:14,border:`1px solid ${CT.b}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:10,color:CT.p,fontWeight:700}}>콘텐츠 달성도</span>
            <span style={{fontSize:10,color:"#64748B"}}>{created.length} / {CONTENT_TYPES.length}</span>
          </div>
          <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:3}}>
            <div style={{height:"100%",width:`${(created.length/CONTENT_TYPES.length)*100}%`,background:`linear-gradient(90deg,${CT.p2},${CT.p})`,borderRadius:3,transition:"width 0.5s"}}/>
          </div>
          {created.length===CONTENT_TYPES.length&&<div style={{fontSize:10,color:CT.p,marginTop:5,textAlign:"center"}}>🏆 콘텐츠 마스터 달성!</div>}
        </div>

        {/* Generated content */}
        {selType && results[selType] && (
          <ContentPreview type={selType} data={results[selType]} />
        )}

        {/* All results list */}
        {Object.keys(results).length > 0 && (
          <div style={{marginTop:14}}>
            <div style={{fontSize:9,color:"#64748B",letterSpacing:1.5,marginBottom:10}}>📁 생성된 콘텐츠 ({Object.keys(results).length}개)</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {Object.keys(results).map(typeId=>{
                const t=CONTENT_TYPES.find(x=>x.id===typeId);
                return(
                  <button key={typeId} onClick={()=>setSelType(typeId)}
                    style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${selType===typeId?t.color:CT.b}`,background:selType===typeId?`${t.color}20`:"transparent",color:selType===typeId?t.color:"#64748B",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                    {t.icon} {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{height:20}}/>
      </div>
    </div>
  );
}

/* ══ UNIFIED FEED ════════════════════════════════ */
function UnifiedFeed({onBack}){
  const[filter,setFilter]=useState("all");
  const all=SharedDB.entries();
  const filtered=filter==="all"?all:all.filter(e=>e.src===filter);
  return(<div style={{height:"100vh",display:"flex",flexDirection:"column",background:H.bg,fontFamily:"'Noto Sans KR',system-ui,sans-serif",color:"#F1F5F9"}}>
    <div style={{background:"linear-gradient(135deg,#0A1628,#020912)",padding:"12px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${H.b}`,flexShrink:0}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:H.p,fontSize:20,cursor:"pointer",padding:0}}>←</button>
      <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,color:H.p}}>전체 일기</div><div style={{fontSize:9,color:"#334155"}}>{all.length}개 통합 기록</div></div>
    </div>
    <div style={{display:"flex",gap:6,padding:"10px 14px",background:H.s,borderBottom:`1px solid ${H.b}`,flexShrink:0}}>
      {[["all","전체"],["echo","ECHO 🎙️"],["dayly","DAYLY ⚡"]].map(([v,l])=>(
        <button key={v} onClick={()=>setFilter(v)} style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${filter===v?H.p:H.b}`,background:filter===v?`${H.p}18`:"transparent",color:filter===v?H.p:"#475569",fontSize:11,fontWeight:700,cursor:"pointer"}}>{l}</button>
      ))}
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>
      {filtered.length===0?<div style={{textAlign:"center",padding:"60px 0"}}><div style={{fontSize:44,marginBottom:12}}>📖</div><div style={{fontSize:14,color:"#475569"}}>일기가 없어요</div></div>:filtered.map((e,i)=>(
        <div key={e.id||i} style={{background:H.s,borderRadius:14,border:`1px solid ${H.b}`,marginBottom:10,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",borderBottom:`1px solid ${H.b}`,display:"flex",alignItems:"center",gap:8}}>
            <span>{e.srcIcon}</span>
            <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:10,background:`${e.srcColor}20`,color:e.srcColor}}>{e.srcLabel}</span>
            <div style={{flex:1,fontSize:13,fontWeight:700,color:"#F1F5F9"}}>{e.title}</div>
            <div style={{fontSize:9,color:"#475569",textAlign:"right"}}>{fmtDate(e.date)}<br/>{fmtTime(e.date)}</div>
          </div>
          {e.src==="dayly"&&e.acts&&<div style={{padding:"7px 14px",borderBottom:`1px solid ${H.b}`,display:"flex",gap:5}}>{e.mood&&<span style={{fontSize:16}}>{e.mood.emoji}</span>}{e.acts.slice(0,6).map(a=><span key={a.id} style={{fontSize:15}}>{a.emoji}</span>)}</div>}
          <div style={{padding:"10px 14px",fontSize:12,color:"#94A3B8",lineHeight:1.7,fontFamily:"Georgia,serif"}}>{(e.text||"").slice(0,160)}{(e.text||"").length>160?"…":""}</div>
        </div>
      ))}
    </div>
  </div>);}

/* ══ HUB SCREEN ══════════════════════════════════ */
function HubScreen({onEnter}){
  const[brief,setBrief]=useState(null);const[genBrief,setGenBrief]=useState(false);
  const[newBadges,setNewBadges]=useState([]);const[showFeed,setShowFeed]=useState(false);
  const[tab,setTab]=useState("dash");
  const DATA=useRef(buildSD()).current;
  const totalXP=SharedDB.totalXP();const streak=SharedDB.streak();const allDiaries=SharedDB.entries();const weekDays=SharedDB.weekDays();const badges=SharedDB.badges();const topMood=SharedDB.topMood();const topAct=SharedDB.topAct();const lv=getLv(totalXP);const lvPr=getLvPr(totalXP);const created=SharedDB.contentCreated();
  useEffect(()=>{const nb=SharedDB.checkBadges();if(nb.length)setNewBadges(nb);const t=setTimeout(()=>setNewBadges([]),4000);return()=>clearTimeout(t);},[]);
  const generateBrief=async()=>{setGenBrief(true);try{const raw=await aiCall([{role:"user",content:`날짜:${DATA.date}\n날씨:${DATA.weather}\n수면:${DATA.sleep.duration}h\n걸음:${DATA.steps.count.toLocaleString()}보\n총일기:${allDiaries.length}개\n스트릭:${streak}일`}],`개인 AI 비서. 오늘의 따뜻한 브리핑. JSON만 반환: {"greeting":"2문장 인사+응원","tip":"오늘을 위한 팁 한 줄"}`,400);setBrief(JSON.parse(raw.replace(/```json|```/g,"").trim()));}catch{const h=new Date().getHours();setBrief({greeting:`${h<12?"좋은 아침":"좋은 하루"}이에요! ${DATA.weather} 날씨네요. 오늘도 멋진 하루가 될 거예요.`,tip:`${DATA.sleep.duration}h 수면에 ${DATA.steps.count.toLocaleString()}보, 훌륭한 출발이에요!`});}setGenBrief(false);};
  if(showFeed)return<UnifiedFeed onBack={()=>setShowFeed(false)}/>;
  const APPS=[{id:"echo",icon:"🎙️",name:"ECHO",sub:"공감 대화",c:E.p,cnt:(SharedDB.all().echo.history||[]).length},{id:"dayly",icon:"⚡",name:"DAYLY",sub:"아이콘 일기",c:D.p,cnt:(SharedDB.all().dayly.history||[]).length},{id:"memoir",icon:"🌐",name:"MEMOIR",sub:"라이프 기록",c:M.p,cnt:null},{id:"content",icon:"🎬",name:"콘텐츠",sub:"자동 생성",c:CT.p,cnt:`${created.length}/6`}];
  return(<div style={{minHeight:"100vh",background:H.bg,fontFamily:"'Noto Sans KR',system-ui,sans-serif",color:"#F1F5F9",overflowY:"auto"}}>
    {newBadges.length>0&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:99,background:"linear-gradient(135deg,#FCD34D,#F97316)",color:"#fff",borderRadius:12,padding:"10px 20px",fontSize:13,fontWeight:700,boxShadow:"0 4px 20px rgba(0,0,0,0.5)",whiteSpace:"nowrap"}}>🏅 새 배지! {newBadges.map(id=>BADGE_DEFS.find(b=>b.id===id)?.icon).join(" ")}</div>}
    <div style={{padding:"28px 18px 16px",background:"linear-gradient(180deg,#0D1628,#020912)"}}>
      <div style={{fontSize:9,color:H.p,letterSpacing:3,textTransform:"uppercase",marginBottom:4}}>Phase 5 Complete · 완전한 생태계</div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div><h1 style={{fontSize:22,fontWeight:900,margin:"0 0 2px",letterSpacing:-0.5}}>세 개의 앱<br/><span style={{color:H.p}}>하나의 나</span></h1><div style={{fontSize:10,color:"#475569"}}>{DATA.date}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:20}}>{lv.icon}</div><div style={{fontSize:10,fontWeight:700,color:lv.c}}>Lv.{lv.lv} {lv.name}</div></div>
      </div>
    </div>
    <div style={{display:"flex",background:H.s,borderBottom:`1px solid ${H.b}`,position:"sticky",top:0,zIndex:10}}>
      {[["dash","📊 대시보드"],["insight","💡 인사이트"],["badges","🏅 배지"]].map(([v,l])=>(
        <button key={v} onClick={()=>setTab(v)} style={{flex:1,padding:"9px 4px",background:"none",border:"none",cursor:"pointer",borderBottom:`2px solid ${tab===v?H.p:"transparent"}`,color:tab===v?H.p:"#475569",fontSize:10,fontWeight:700,fontFamily:"'Noto Sans KR',sans-serif"}}>{l}</button>
      ))}
    </div>
    <div style={{padding:"14px 16px 40px"}}>
      {tab==="dash"&&<>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
          {[{label:"총 XP",value:totalXP,icon:"⭐",c:lv.c},{label:"스트릭",value:`${streak}일`,icon:"🔥",c:"#F97316"},{label:"총 일기",value:`${allDiaries.length}개`,icon:"📓",c:H.p},{label:"콘텐츠",value:`${created.length}/6`,icon:"🎬",c:CT.p}].map((s,i)=>(
            <div key={i} style={{background:H.s,borderRadius:12,padding:"10px 8px",textAlign:"center",border:`1px solid ${H.b}`}}>
              <div style={{fontSize:16}}>{s.icon}</div>
              <div style={{fontSize:15,fontWeight:800,color:s.c,marginTop:2}}>{s.value}</div>
              <div style={{fontSize:8,color:"#475569"}}>{s.label}</div>
            </div>
          ))}
        </div>
        {/* Level bar */}
        <div style={{background:H.s,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`1px solid ${H.b}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:10,fontWeight:700,color:lv.c}}>{lv.icon} {lv.name} ({lv.kor})</span><span style={{fontSize:9,color:"#64748B"}}>{totalXP}/{lv.max} XP</span></div>
          <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3}}><div style={{height:"100%",width:`${Math.min(lvPr*100,100)}%`,background:`linear-gradient(90deg,${lv.c}99,${lv.c})`,borderRadius:3,transition:"width 0.8s"}}/></div>
          <div style={{fontSize:9,color:"#475569",marginTop:4}}>다음 레벨까지 {lv.max-totalXP} XP</div>
        </div>
        {/* Week grid */}
        <div style={{background:H.s,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`1px solid ${H.b}`}}>
          <div style={{fontSize:9,color:"#64748B",letterSpacing:1.5,marginBottom:10}}>📅 이번 주 기록</div>
          <div style={{display:"flex",gap:6,justifyContent:"space-between"}}>
            {weekDays.map((d,i)=>(
              <div key={i} style={{flex:1,textAlign:"center"}}>
                <div style={{fontSize:8,color:"#475569",marginBottom:5}}>{d.label}</div>
                <div style={{width:"100%",aspectRatio:"1",borderRadius:8,border:`1.5px solid ${d.has?H.p:H.b}`,background:d.has?`${H.p}20`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:d.has?10:8,position:"relative"}}>
                  {d.has?"✓":""}
                  {d.isToday&&<div style={{position:"absolute",bottom:-4,left:"50%",transform:"translateX(-50%)",width:4,height:4,borderRadius:"50%",background:H.p}}/>}
                </div>
              </div>
            ))}
          </div>
          <div style={{fontSize:9,color:"#64748B",marginTop:8,textAlign:"center"}}>{weekDays.filter(d=>d.has).length}/7일 · 스트릭 {streak}일</div>
        </div>
        {/* Sensor */}
        <div style={{background:H.s,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`1px solid ${H.b}`}}>
          <div style={{fontSize:9,color:H.p,letterSpacing:1.5,marginBottom:8}}>📡 오늘 센서</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            {[[DATA.weather,"날씨"],[`${DATA.sleep.duration}h`,"수면"],[`${DATA.steps.count.toLocaleString()}보`,"걸음"]].map(([v,l])=>(
              <div key={l} style={{background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"7px 8px",textAlign:"center"}}><div style={{fontSize:10,fontWeight:700,color:"#CBD5E1"}}>{v}</div><div style={{fontSize:8,color:"#475569"}}>{l}</div></div>
            ))}
          </div>
        </div>
        {/* Brief */}
        <div style={{background:"linear-gradient(135deg,#0D1F38,#020912)",borderRadius:14,padding:"14px",marginBottom:12,border:`1px solid ${H.p}30`}}>
          <div style={{fontSize:9,color:H.p,letterSpacing:1.5,marginBottom:8}}>🧠 오늘의 AI 브리핑</div>
          {brief?(<><div style={{fontSize:13,color:"#CBD5E1",lineHeight:1.75,marginBottom:8,fontFamily:"'Noto Sans KR',sans-serif"}}>{brief.greeting}</div><div style={{fontSize:11,color:H.p,padding:"6px 10px",background:`${H.p}10`,borderRadius:8,borderLeft:`2px solid ${H.p}`}}>💡 {brief.tip}</div></>):(
            <button onClick={generateBrief} disabled={genBrief} style={{width:"100%",padding:"11px",border:`1px solid ${H.p}50`,borderRadius:10,background:"transparent",color:H.p,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Noto Sans KR',sans-serif"}}>{genBrief?"✨ 생성 중…":"✨ 오늘의 브리핑 받기"}</button>
          )}
        </div>
        {/* App cards — 2x2 grid including Content Studio */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {APPS.map(app=>(
            <button key={app.id} onClick={()=>onEnter(app.id)}
              style={{padding:"14px 10px",background:H.s,border:`1.5px solid ${app.c}50`,borderRadius:14,cursor:"pointer",textAlign:"center",transition:"all 0.15s",display:"flex",flexDirection:"column",alignItems:"center"}}>
              <div style={{fontSize:22,marginBottom:4}}>{app.icon}</div>
              <div style={{fontSize:12,fontWeight:800,color:app.c}}>{app.name}</div>
              <div style={{fontSize:9,color:"#475569",marginTop:2}}>{app.cnt!==null?`${app.cnt}`:""}</div>
            </button>
          ))}
        </div>
        {/* Recent + feed */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div style={{fontSize:9,color:"#64748B",letterSpacing:1.5}}>📖 최근 일기</div>
          <button onClick={()=>setShowFeed(true)} style={{background:"transparent",border:"none",color:H.p,fontSize:11,cursor:"pointer",fontWeight:700}}>전체 보기 →</button>
        </div>
        {allDiaries.slice(0,3).map((e,i)=>(
          <div key={e.id||i} style={{background:H.s,borderRadius:12,padding:"11px 13px",marginBottom:8,border:`1px solid ${H.b}`}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
              <span>{e.srcIcon}</span><span style={{fontSize:9,padding:"2px 7px",borderRadius:8,background:`${e.srcColor}18`,color:e.srcColor,fontWeight:700}}>{e.srcLabel}</span>
              <div style={{flex:1,fontSize:12,fontWeight:700,color:"#F1F5F9"}}>{e.title}</div>
              <div style={{fontSize:8,color:"#475569"}}>{fmtDate(e.date)}</div>
            </div>
            {e.src==="dayly"&&e.acts&&<div style={{display:"flex",gap:4,marginBottom:5}}>{e.mood&&<span style={{fontSize:14}}>{e.mood.emoji}</span>}{e.acts.slice(0,5).map(a=><span key={a.id} style={{fontSize:13}}>{a.emoji}</span>)}</div>}
            <div style={{fontSize:11,color:"#94A3B8",lineHeight:1.6,fontFamily:"Georgia,serif"}}>{(e.text||"").slice(0,100)}{(e.text||"").length>100?"…":""}</div>
          </div>
        ))}
        {allDiaries.length===0&&<div style={{textAlign:"center",padding:"24px",color:"#334155",fontSize:12}}>아직 일기가 없어요. 앱을 사용해보세요!</div>}
      </>}
      {tab==="insight"&&<>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {[{icon:"🎙️",label:"ECHO 일기",value:`${(SharedDB.all().echo.history||[]).length}개`,color:E.p},{icon:"⚡",label:"DAYLY 일기",value:`${(SharedDB.all().dayly.history||[]).length}개`,color:D.p},{icon:"📅",label:"이번 주",value:`${weekDays.filter(d=>d.has).length}일`,color:H.p},{icon:"🔥",label:"스트릭",value:`${streak}일`,color:"#F97316"}].map((s,i)=>(
            <div key={i} style={{background:H.s,borderRadius:14,padding:"14px",border:`1px solid ${H.b}`}}><div style={{fontSize:22,marginBottom:6}}>{s.icon}</div><div style={{fontSize:20,fontWeight:900,color:s.color}}>{s.value}</div><div style={{fontSize:10,color:"#475569",marginTop:2}}>{s.label}</div></div>
          ))}
        </div>
        {(topMood||topAct)&&<div style={{background:H.s,borderRadius:14,padding:"14px",marginBottom:12,border:`1px solid ${H.b}`}}>
          <div style={{fontSize:9,color:"#64748B",letterSpacing:1.5,marginBottom:10}}>DAYLY 패턴</div>
          {topMood&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${H.b}`}}><span style={{fontSize:24}}>{topMood.emoji}</span><div><div style={{fontSize:12,fontWeight:700,color:topMood.c}}>가장 많은 기분</div><div style={{fontSize:10,color:"#64748B"}}>{topMood.eng} · {topMood.kor}</div></div></div>}
          {topAct&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0"}}><span style={{fontSize:24}}>{topAct.emoji}</span><div><div style={{fontSize:12,fontWeight:700,color:D.p}}>가장 많은 활동</div><div style={{fontSize:10,color:"#64748B"}}>{topAct.eng} · {topAct.kor}</div></div></div>}
        </div>}
        {/* Content progress */}
        <div style={{background:H.s,borderRadius:14,padding:"14px",marginBottom:12,border:`1px solid ${H.b}`}}>
          <div style={{fontSize:9,color:"#64748B",letterSpacing:1.5,marginBottom:10}}>🎬 콘텐츠 생성 현황</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {CONTENT_TYPES.map(t=>(
              <div key={t.id} style={{padding:"4px 10px",borderRadius:20,background:created.includes(t.id)?`${t.color}20`:"rgba(0,0,0,0.3)",border:`1px solid ${created.includes(t.id)?t.color:CT.b}`,fontSize:10,color:created.includes(t.id)?t.color:"#475569"}}>
                {t.icon} {created.includes(t.id)?"✓":""} {t.label}
              </div>
            ))}
          </div>
          <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,marginTop:10}}><div style={{height:"100%",width:`${(created.length/6)*100}%`,background:`linear-gradient(90deg,${CT.p2},${CT.p})`,borderRadius:2}}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
          {[{name:"ECHO",icon:"🎙️",xp:SharedDB.all().echo.xp||0,c:E.p},{name:"DAYLY",icon:"⚡",xp:SharedDB.all().dayly.xp||0,c:D.p},{name:"MEMOIR",icon:"🌐",xp:SharedDB.all().memoir.xp||0,c:M.p}].map((a,i)=>(
            <div key={i} style={{background:H.s,borderRadius:12,padding:"10px 8px",textAlign:"center",border:`1px solid ${H.b}`}}><span style={{fontSize:16}}>{a.icon}</span><div style={{fontSize:13,fontWeight:700,color:a.c,marginTop:4}}>{a.xp} XP</div><div style={{fontSize:8,color:"#475569"}}>{a.name}</div></div>
          ))}
        </div>
      </>}
      {tab==="badges"&&<>
        <div style={{fontSize:12,color:"#64748B",marginBottom:14}}>{badges.length} / {BADGE_DEFS.length}개 획득</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {BADGE_DEFS.map(b=>{const earned=badges.includes(b.id);return(
            <div key={b.id} style={{background:H.s,borderRadius:14,padding:"14px",border:`1px solid ${earned?"#FCD34D40":H.b}`,opacity:earned?1:0.4}}>
              <div style={{fontSize:28,marginBottom:6}}>{b.icon}</div>
              <div style={{fontSize:12,fontWeight:700,color:earned?"#FCD34D":"#475569"}}>{b.name}</div>
              <div style={{fontSize:10,color:"#475569",marginTop:2}}>{b.desc}</div>
              <div style={{fontSize:9,color:"#FCD34D",marginTop:6}}>{earned?"✓ 획득!":""} +{b.xp} XP</div>
            </div>
          );})}
        </div>
      </>}
    </div>
  </div>);}

/* ══ ECHO APP ════════════════════════════════════ */
function TypingDot({delay}){const[v,setV]=useState(true);useEffect(()=>{const t=setTimeout(()=>{const iv=setInterval(()=>setV(x=>!x),600);return()=>clearInterval(iv);},delay);return()=>clearTimeout(t);},[delay]);return <div style={{width:7,height:7,borderRadius:"50%",background:v?E.p2:E.p2+"40",transition:"background 0.3s"}}/>;}
function TypingInd(){return(<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><div style={{width:28,height:28,borderRadius:8,background:`${E.p2}30`,border:`1px solid ${E.p2}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🎙️</div><div style={{display:"flex",gap:5,padding:"12px 16px",background:E.s,borderRadius:"18px 18px 18px 4px",border:`1px solid ${E.b}`,alignItems:"center"}}><TypingDot delay={0}/><TypingDot delay={200}/><TypingDot delay={400}/></div></div>);}
function Bubble({msg}){const ai=msg.role==="ai";return(<div style={{display:"flex",justifyContent:ai?"flex-start":"flex-end",marginBottom:10,alignItems:"flex-end",gap:8}}>{ai&&<div style={{width:28,height:28,borderRadius:8,background:`${E.p2}30`,border:`1px solid ${E.p2}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🎙️</div>}<div style={{maxWidth:"76%",padding:"11px 15px",fontSize:13,lineHeight:1.75,borderRadius:ai?"18px 18px 18px 4px":"18px 18px 4px 18px",background:ai?E.s:"linear-gradient(135deg,#5B21B6,#9333EA)",color:ai?"#DDD6FE":"#fff",border:ai?`1px solid ${E.b}`:"none",fontFamily:"'Noto Sans KR',sans-serif"}}>{msg.text}</div></div>);}
function EchoApp({onBack}){
  const cx=useRef(getCtx()).current;
  const[view,setView]=useState("home");const[tab,setTab]=useState("home");const[msgs,setMsgs]=useState([]);const[input,setInput]=useState("");const[typing,setTyping]=useState(false);const[stage,setStage]=useState(0);const[content,setContent]=useState(null);const[genning,setGenning]=useState(false);const[history,setHistory]=useState([]);const[xp,setXp]=useState(0);const chatEnd=useRef(null);
  useEffect(()=>{const d=db.get("echo_v1");if(d){setHistory(d.history||[]);setXp(d.xp||0);}},[]);
  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[msgs,typing]);
  const SYS=(st)=>`당신은 ECHO입니다 — 따뜻한 AI 일기 친구. 오늘:${cx.date} ${cx.timeName}·${cx.weather}·수면${cx.sleep}h·${cx.steps}보. 단계${st}: ${st===0?"인사+날씨/시간+질문 하나":st<=2?"공감+이야기 끌어내기+질문 하나":"마무리+핵심 요약+일기 제안"}. 한국어 2-3문장.`;
  const startChat=async()=>{setView("chat");setMsgs([]);setStage(0);setContent(null);setTyping(true);try{const t=await aiCall([],SYS(0));setMsgs([{role:"ai",text:t}]);setStage(1);}catch{setMsgs([{role:"ai",text:`${cx.timeName}이에요! 오늘 어떻게 보내고 있어요? 😊`}]);setStage(1);}setTyping(false);};
  const send=async()=>{const txt=input.trim();if(!txt||typing)return;setInput("");const nm=[...msgs,{role:"user",text:txt}];setMsgs(nm);setTyping(true);const am=nm.map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text}));const nx=Math.min(stage+1,3);try{const t=await aiCall(am,SYS(nx));setMsgs([...nm,{role:"ai",text:t}]);setStage(nx);}catch{setMsgs([...nm,{role:"ai",text:"그렇군요. 더 이야기해 주세요 😊"}]);}setTyping(false);};
  const generate=async()=>{setGenning(true);const conv=msgs.map(m=>`${m.role==="ai"?"ECHO":"나"}: ${m.text}`).join("\n");try{const raw=await aiCall([{role:"user",content:`대화:\n${conv}`}],`일기 생성. JSON만: {"title":"제목","diary_eng":"영어일기","diary_kor":"한국어","instagram":"캡션+해시태그","shortform":"훅"}`,800);setContent(JSON.parse(raw.replace(/```json|```/g,"").trim()));}catch{setContent({title:"오늘도 잘 살아냈어",diary_eng:"Today was worth remembering.",diary_kor:"오늘도 기억할 만한 하루였다.",instagram:"일상 🌙\n#ECHO",shortform:"오늘도 잘 살아냈으니까"});}setGenning(false);};
  const save=(text)=>{const e={id:Date.now(),date:new Date().toISOString(),title:content.title,text};const nh=[e,...history];const nx=xp+30;setHistory(nh);setXp(nx);db.set("echo_v1",{history:nh,xp:nx});setTimeout(()=>{setView("home");setTab("history");},800);};
  return(<div style={{height:"100vh",display:"flex",flexDirection:"column",background:E.bg,fontFamily:"'Noto Sans KR',system-ui,sans-serif",color:"#F1F5F9"}}>
    <div style={{background:"linear-gradient(135deg,#0D0420,#150830)",padding:"12px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${E.b}`,flexShrink:0}}>
      <button onClick={()=>view==="chat"?setView("home"):onBack()} style={{background:"none",border:"none",color:E.p,fontSize:20,cursor:"pointer",padding:0}}>←</button>
      <div style={{width:32,height:32,borderRadius:9,background:`${E.p2}30`,border:`1.5px solid ${E.p2}60`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🎙️</div>
      <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,color:E.p}}>ECHO</div><div style={{fontSize:9,color:"#6B21A8"}}>공감 대화 일기</div></div>
      <div style={{minWidth:100}}><LvBar xp={xp} ac={E.p}/></div>
    </div>
    {view==="chat"&&<>
      <div style={{background:E.s,padding:"7px 16px",display:"flex",gap:12,borderBottom:`1px solid ${E.b}`,flexShrink:0,alignItems:"center",flexWrap:"wrap"}}>
        {[cx.weather,`😴 ${cx.sleep}h`,`👟 ${cx.steps}`].map((t,i)=><span key={i} style={{fontSize:10,color:"#7C3AED"}}>{t}</span>)}
        {stage===3&&<button onClick={generate} disabled={genning} style={{marginLeft:"auto",background:"linear-gradient(135deg,#5B21B6,#7C3AED)",color:"#fff",border:"none",borderRadius:8,padding:"5px 14px",fontSize:11,fontWeight:700,cursor:"pointer"}}>{genning?"✨ 생성중…":"✨ 일기 만들기"}</button>}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 14px"}}>
        {msgs.map((m,i)=><Bubble key={i} msg={m}/>)}{typing&&<TypingInd/>}
        {content&&!genning&&<DiaryCard content={content} ac={E.p} onSave={save}/>}
        <div ref={chatEnd}/>
      </div>
      {!content&&<div style={{padding:"10px 14px 20px",background:E.bg,borderTop:`1px solid ${E.b}`,display:"flex",gap:8,flexShrink:0}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="이야기해 주세요…" disabled={stage===3} style={{flex:1,background:E.s,border:`1px solid ${E.b}`,borderRadius:12,padding:"11px 14px",fontSize:13,color:"#DDD6FE",outline:"none",fontFamily:"'Noto Sans KR',sans-serif"}}/>
        <button onClick={send} disabled={!input.trim()||typing||stage===3} style={{width:44,height:44,borderRadius:12,border:"none",fontSize:18,background:input.trim()&&!typing&&stage<3?"linear-gradient(135deg,#5B21B6,#9333EA)":"#1E1040",color:"#fff",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
      </div>}
    </>}
    {view==="home"&&<>
      <div style={{display:"flex",background:E.s,borderBottom:`1px solid ${E.b}`,flexShrink:0}}>{[["home","🏠 홈"],["history","📖 기록"]].map(([v,l])=><button key={v} onClick={()=>setTab(v)} style={{flex:1,padding:"10px",background:"none",border:"none",cursor:"pointer",borderBottom:`2px solid ${tab===v?E.p:"transparent"}`,color:tab===v?E.p:"#475569",fontSize:12,fontWeight:700,fontFamily:"'Noto Sans KR',sans-serif"}}>{l}</button>)}</div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 14px"}}>
        {tab==="home"&&<div style={{background:"linear-gradient(135deg,#1A0840,#0D0420)",borderRadius:18,padding:"20px 18px",border:`1px solid ${E.b}`}}>
          <div style={{fontSize:10,color:E.p,letterSpacing:1.5,marginBottom:10}}>📅 {cx.date} · {cx.timeName}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>{[["🌤️","날씨",cx.weather],["😴","수면",`${cx.sleep}h`],["👟","걸음",cx.steps],["🔋","배터리",`${cx.battery}%`]].map(([ic,lb,val])=>(<div key={lb} style={{background:"rgba(0,0,0,0.35)",borderRadius:10,padding:"8px 10px"}}><div style={{fontSize:9,color:"#6B21A8",marginBottom:2}}>{ic} {lb}</div><div style={{fontSize:12,fontWeight:700,color:"#DDD6FE"}}>{val}</div></div>))}</div>
          <button onClick={startChat} style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#5B21B6,#9333EA)",color:"#fff",border:"none",borderRadius:12,fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"'Noto Sans KR',sans-serif"}}>🎙️ 오늘 이야기 시작하기</button>
        </div>}
        {tab==="history"&&(history.length===0?<div style={{textAlign:"center",padding:"60px 0"}}><div style={{fontSize:44,marginBottom:12}}>📖</div><div style={{fontSize:14,color:"#475569"}}>아직 일기가 없어요</div></div>:history.map((e,i)=>(<div key={e.id||i} style={{background:E.s,borderRadius:14,border:`1px solid ${E.b}`,marginBottom:8,padding:"12px 14px"}}><div style={{fontSize:13,fontWeight:700,color:"#E9D5FF",marginBottom:2}}>{e.title}</div><div style={{fontSize:10,color:"#475569",marginBottom:6}}>{fmtDate(e.date)}</div><div style={{fontSize:12,color:"#94A3B8",lineHeight:1.7,fontFamily:"Georgia,serif"}}>{e.text}</div></div>)))}
      </div>
    </>}
  </div>);}

/* ══ DAYLY APP ════════════════════════════════════ */
function MB({m,sel,onTap}){return(<button onClick={onTap} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"10px 6px",borderRadius:14,minWidth:56,border:`2px solid ${sel?m.c:"#1E293B"}`,background:sel?`${m.c}22`:"#0F0600",cursor:"pointer",boxShadow:sel?`0 0 14px ${m.c}50`:"none"}}><span style={{fontSize:24}}>{m.emoji}</span><span style={{fontSize:10,fontWeight:700,color:sel?m.c:"#CBD5E1"}}>{m.eng}</span><span style={{fontSize:7,color:"#475569"}}>{m.kor}</span></button>);}
function IB({item,sel,onTap,sm}){return(<button onClick={onTap} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:sm?"8px 5px":"10px 8px",borderRadius:sm?10:12,border:`2px solid ${sel?D.p:"#1E293B"}`,background:sel?`${D.p}22`:"#0F0600",cursor:"pointer",boxShadow:sel?`0 0 10px ${D.p}40`:"none"}}><span style={{fontSize:sm?20:24}}>{item.emoji}</span><span style={{fontSize:sm?9:10,fontWeight:700,color:sel?D.p:"#CBD5E1",textAlign:"center",lineHeight:1.2}}>{item.eng}</span><span style={{fontSize:7,color:"#475569"}}>{item.kor}</span></button>);}
function DaylyApp({onBack}){
  const[view,setView]=useState("home");const[tab,setTab]=useState("home");const[step,setStep]=useState(0);const[mood,setMood]=useState(null);const[acts,setActs]=useState([]);const[whom,setWhom]=useState([]);const[loc,setLoc]=useState(null);const[wx,setWx]=useState(null);const[content,setContent]=useState(null);const[genning,setGenning]=useState(false);const[history,setHistory]=useState([]);const[xp,setXp]=useState(0);const[reward,setReward]=useState(null);
  useEffect(()=>{const d=db.get("dayly_v1");if(d){setHistory(d.history||[]);setXp(d.xp||0);}},[]);
  const tog=(arr,setArr,item)=>arr.some(x=>x.id===item.id)?setArr(arr.filter(x=>x.id!==item.id)):setArr([...arr,item]);
  const reset=()=>{setStep(0);setMood(null);setActs([]);setWhom([]);setLoc(null);setWx(null);setContent(null);setView("home");};
  const generate=async()=>{setGenning(true);const date=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});try{const raw=await aiCall([{role:"user",content:`Date:${date}\nMood:${mood?.eng}\nActivities:${acts.map(a=>a.eng).join(",")||"none"}\nWith:${whom.map(w=>w.eng).join(",")||"alone"}\nLocation:${loc?.eng||"various"}\nWeather:${wx?.eng||"unknown"}`}],`Write natural English diary (3-4 sentences). JSON only: {"title":"title","diary_eng":"...","diary_kor":"Korean","instagram":"caption+hashtags","shortform":"hook"}`,700);setContent(JSON.parse(raw.replace(/```json|```/g,"").trim()));setView("result");}catch{setContent({title:"A Day in My Life",diary_eng:"Today was a day worth remembering.",diary_kor:"오늘은 기억할 만한 하루였다.",instagram:"일상 🌙\n#DAYLY",shortform:"오늘도 잘 살아냈으니까"});setView("result");}setGenning(false);};
  const save=(text)=>{const pLv=getLv(xp).lv;const e={id:Date.now(),date:new Date().toISOString(),title:content.title,text,mood,acts};const nh=[e,...history];const nx=xp+30;const nLv=getLv(nx);setHistory(nh);setXp(nx);db.set("dayly_v1",{history:nh,xp:nx});if(nLv.lv>pLv)setReward(`${nLv.icon} Level Up! ${nLv.name}`);setTimeout(()=>{reset();setTab("history");},800);setTimeout(()=>setReward(null),3000);};
  const SL=["How are you feeling? 😊","What did you do? 🎯","Who were you with? 👥","Where were you? 📍","How was the weather? 🌤️"];
  return(<div style={{height:"100vh",display:"flex",flexDirection:"column",background:D.bg,fontFamily:"'Noto Sans KR',system-ui,sans-serif",color:"#F1F5F9"}}>
    {reward&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:99,background:D.p,color:"#fff",borderRadius:12,padding:"10px 20px",fontSize:13,fontWeight:700,whiteSpace:"nowrap"}}>🎉 {reward}</div>}
    <div style={{background:"linear-gradient(135deg,#1A0800,#2D1000)",padding:"12px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${D.b}`,flexShrink:0}}>
      <button onClick={()=>view==="home"?onBack():reset()} style={{background:"none",border:"none",color:D.p,fontSize:20,cursor:"pointer",padding:0}}>←</button>
      <div style={{width:32,height:32,borderRadius:9,background:`${D.p}30`,border:`1.5px solid ${D.p}60`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>⚡</div>
      <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,color:D.p}}>DAYLY</div><div style={{fontSize:9,color:"#78350F"}}>아이콘 영어 일기</div></div>
      <div style={{minWidth:100}}><LvBar xp={xp} ac={D.p}/></div>
    </div>
    {view==="result"&&content&&<div style={{flex:1,overflowY:"auto",padding:"16px 14px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><span style={{fontSize:22}}>✨</span><div><div style={{fontSize:16,fontWeight:800}}>Diary ready!</div></div></div>
      <div style={{background:D.s,borderRadius:12,padding:"10px 12px",marginBottom:12,display:"flex",flexWrap:"wrap",gap:6,border:`1px solid ${D.b}`}}>{mood&&<span style={{fontSize:20}}>{mood.emoji}</span>}{acts.slice(0,6).map(a=><span key={a.id} style={{fontSize:18}}>{a.emoji}</span>)}{whom.slice(0,2).map(w=><span key={w.id} style={{fontSize:18}}>{w.emoji}</span>)}{loc&&<span style={{fontSize:18}}>{loc.emoji}</span>}{wx&&<span style={{fontSize:18}}>{wx.emoji}</span>}</div>
      <DiaryCard content={content} ac={D.p} onSave={save}/>
      <button onClick={reset} style={{width:"100%",marginTop:10,padding:"10px",background:"transparent",color:"#475569",border:`1px solid ${D.b}`,borderRadius:12,fontSize:12,cursor:"pointer"}}>← Start Over</button>
    </div>}
    {view==="steps"&&<div style={{flex:1,overflowY:"auto",padding:"16px 14px"}}>
      <div style={{display:"flex",gap:5,marginBottom:14}}>{[0,1,2,3,4].map(i=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<step?D.p:i===step?`${D.p}70`:"#1E293B"}}/>)}</div>
      <div style={{fontSize:18,fontWeight:800,marginBottom:14}}>{SL[step]}</div>
      {step===0&&<><div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:7,marginBottom:16}}>{MOODS.map(m=><MB key={m.id} m={m} sel={mood?.id===m.id} onTap={()=>setMood(mood?.id===m.id?null:m)}/>)}</div><button onClick={()=>setStep(1)} disabled={!mood} style={{width:"100%",padding:"13px",border:"none",borderRadius:12,fontWeight:800,fontSize:14,cursor:mood?"pointer":"not-allowed",background:mood?`linear-gradient(135deg,${D.p},${D.p2})`:"#1E293B",color:mood?"#fff":"#475569"}}>Next →</button></>}
      {step===1&&<><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:14}}>{ACTS.map(a=><IB key={a.id} item={a} sm sel={acts.some(x=>x.id===a.id)} onTap={()=>tog(acts,setActs,a)}/>)}</div><div style={{display:"flex",gap:8}}><button onClick={()=>setStep(0)} style={{flex:1,padding:"10px",background:"transparent",color:"#94A3B8",border:`1px solid ${D.b}`,borderRadius:10,cursor:"pointer"}}>← Back</button><button onClick={()=>setStep(2)} style={{flex:2,padding:"10px",background:`linear-gradient(135deg,${D.p},${D.p2})`,color:"#fff",border:"none",borderRadius:10,fontWeight:800,cursor:"pointer"}}>Next →</button></div></>}
      {step===2&&<><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>{WHOM.map(w=><IB key={w.id} item={w} sel={whom.some(x=>x.id===w.id)} onTap={()=>tog(whom,setWhom,w)}/>)}</div><div style={{display:"flex",gap:8}}><button onClick={()=>setStep(1)} style={{flex:1,padding:"10px",background:"transparent",color:"#94A3B8",border:`1px solid ${D.b}`,borderRadius:10,cursor:"pointer"}}>← Back</button><button onClick={()=>setStep(3)} style={{flex:2,padding:"10px",background:`linear-gradient(135deg,${D.p},${D.p2})`,color:"#fff",border:"none",borderRadius:10,fontWeight:800,cursor:"pointer"}}>Next →</button></div></>}
      {step===3&&<><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:14}}>{LOCS.map(l=><IB key={l.id} item={l} sm sel={loc?.id===l.id} onTap={()=>setLoc(loc?.id===l.id?null:l)}/>)}</div><div style={{display:"flex",gap:8}}><button onClick={()=>setStep(2)} style={{flex:1,padding:"10px",background:"transparent",color:"#94A3B8",border:`1px solid ${D.b}`,borderRadius:10,cursor:"pointer"}}>← Back</button><button onClick={()=>setStep(4)} style={{flex:2,padding:"10px",background:`linear-gradient(135deg,${D.p},${D.p2})`,color:"#fff",border:"none",borderRadius:10,fontWeight:800,cursor:"pointer"}}>Next →</button></div></>}
      {step===4&&<><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>{WX.map(w=><IB key={w.id} item={w} sel={wx?.id===w.id} onTap={()=>setWx(wx?.id===w.id?null:w)}/>)}</div>
      <div style={{background:D.s,borderRadius:10,padding:"10px 12px",marginBottom:14,display:"flex",flexWrap:"wrap",gap:6,border:`1px solid ${D.b}`}}>{mood&&<span style={{fontSize:20}}>{mood.emoji}</span>}{acts.slice(0,5).map(a=><span key={a.id} style={{fontSize:18}}>{a.emoji}</span>)}{whom.slice(0,2).map(w=><span key={w.id} style={{fontSize:18}}>{w.emoji}</span>)}{loc&&<span style={{fontSize:18}}>{loc.emoji}</span>}{wx&&<span style={{fontSize:18}}>{wx.emoji}</span>}</div>
      <div style={{display:"flex",gap:8}}><button onClick={()=>setStep(3)} style={{flex:1,padding:"10px",background:"transparent",color:"#94A3B8",border:`1px solid ${D.b}`,borderRadius:10,cursor:"pointer"}}>← Back</button><button onClick={generate} disabled={genning} style={{flex:2,padding:"10px",border:"none",borderRadius:10,fontWeight:800,cursor:genning?"not-allowed":"pointer",background:genning?"#1E293B":`linear-gradient(135deg,#7C3AED,${D.p})`,color:genning?"#475569":"#fff"}}>{genning?"✨ 생성중…":"✨ Generate!"}</button></div></>}
    </div>}
    {view==="home"&&<>
      <div style={{display:"flex",background:D.s,borderBottom:`1px solid ${D.b}`,flexShrink:0}}>{[["home","🏠 홈"],["history","📖 기록"]].map(([v,l])=><button key={v} onClick={()=>setTab(v)} style={{flex:1,padding:"10px",background:"none",border:"none",cursor:"pointer",borderBottom:`2px solid ${tab===v?D.p:"transparent"}`,color:tab===v?D.p:"#475569",fontSize:12,fontWeight:700,fontFamily:"'Noto Sans KR',sans-serif"}}>{l}</button>)}</div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 14px"}}>
        {tab==="home"&&<div style={{background:"linear-gradient(135deg,#2D1000,#1A0800)",borderRadius:18,padding:"20px 18px",border:`1px solid ${D.b}`}}>
          <div style={{fontSize:12,color:D.p,fontWeight:700,marginBottom:14}}>📅 {new Date().toLocaleDateString("ko-KR",{month:"long",day:"numeric",weekday:"long"})}</div>
          <button onClick={()=>setView("steps")} style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,${D.p},${D.p2})`,color:"#fff",border:"none",borderRadius:12,fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"'Noto Sans KR',sans-serif"}}>⚡ 아이콘 클릭으로 시작하기</button>
        </div>}
        {tab==="history"&&(history.length===0?<div style={{textAlign:"center",padding:"60px 0"}}><div style={{fontSize:44,marginBottom:12}}>📖</div><div style={{fontSize:14,color:"#475569"}}>아직 일기가 없어요</div></div>:history.map((e,i)=>(<div key={e.id||i} style={{background:D.s,borderRadius:14,border:`1px solid ${D.b}`,marginBottom:8,padding:"12px 14px"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>{e.mood&&<span style={{fontSize:18}}>{e.mood.emoji}</span>}<div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#F1F5F9"}}>{e.title}</div><div style={{fontSize:10,color:"#475569"}}>{fmtDate(e.date)}</div></div><div>{e.acts?.slice(0,4).map(a=><span key={a.id} style={{fontSize:14}}>{a.emoji}</span>)}</div></div><div style={{fontSize:12,color:"#94A3B8",lineHeight:1.7,fontFamily:"Georgia,serif"}}>{e.text}</div></div>)))}
      </div>
    </>}
  </div>);}

/* ══ MEMOIR APP ══════════════════════════════════ */
function SCard({icon,label,value,sub}){return(<div style={{background:M.s,borderRadius:12,padding:"12px 14px",border:`1px solid ${M.b}`}}><div style={{fontSize:9,color:M.p,letterSpacing:1,marginBottom:4}}>{icon} {label.toUpperCase()}</div><div style={{fontSize:16,fontWeight:700,color:"#F1F5F9"}}>{value}</div>{sub&&<div style={{fontSize:10,color:"#475569",marginTop:2}}>{sub}</div>}</div>);}
function MemoirApp({onBack}){
  const DATA=useRef(buildSD()).current;
  const[tab,setTab]=useState("home");const[timeline,setTimeline]=useState(null);const[genTL,setGenTL]=useState(false);const[exports,setExports]=useState({});const[genExp,setGenExp]=useState(null);const[xp,setXp]=useState(0);
  useEffect(()=>{const d=db.get("memoir_v1");if(d)setXp(d.xp||0);},[]);
  const addXp=(amt)=>{const nx=xp+amt;setXp(nx);db.set("memoir_v1",{xp:nx});};
  const genTimeline=async()=>{setGenTL(true);try{const raw=await aiCall([{role:"user",content:`날짜:${DATA.date}\n날씨:${DATA.weather}\n수면:${DATA.sleep.duration}h(기상${DATA.sleep.wakeTime})\n걸음:${DATA.steps.count.toLocaleString()}보\n장소:${DATA.places.map(p=>p[0]).join(",")}\n음악:${DATA.music.join("/")}`}],`개인 라이프 위키. JSON만: {"headline":"한줄요약","summary":"2문장","timeline":[{"time":"HH:MM","icon":"이모지","event":"설명","en":"English"}],"highlights":["h1","h2","h3"],"diary_eng":"영어일기","diary_kor":"한국어","instagram":"캡션+해시태그"}`,1000);setTimeline(JSON.parse(raw.replace(/```json|```/g,"").trim()));setTab("timeline");addXp(25);}catch{setTimeline({headline:"오늘도 열심히",summary:`${DATA.sleep.duration}h 수면 후 ${DATA.steps.count.toLocaleString()}보 걸었다.`,timeline:[{time:DATA.sleep.wakeTime,icon:"☀️",event:"기상",en:"Woke up"},{time:"12:00",icon:"🍽️",event:"점심",en:"Lunch"},{time:"18:00",icon:"🚶",event:"산책",en:"Walk"},{time:"22:00",icon:"🌙",event:"마무리",en:"Day end"}],highlights:["활기찬 하루","좋은 걸음수","다양한 장소"],diary_eng:"Today was a full day.",diary_kor:"오늘도 열심히 살았다.",instagram:"오늘의 순간들 🌙\n#MEMOIR"});setTab("timeline");addXp(25);}setGenTL(false);};
  const genExport=async(type)=>{setGenExp(type);const SYS_MAP={reel:`릴스 스크립트. JSON만: {"script":"스크립트","caption":"캡션+해시태그","music_vibe":"음악분위기"}`,tiktok:`틱톡. JSON만: {"hook":"훅","script":"스크립트","hashtags":"해시태그"}`};const s=SYS_MAP[type];if(!s){setGenExp(null);return;}try{const raw=await aiCall([{role:"user",content:`날짜:${DATA.date}\n날씨:${DATA.weather}\n${timeline?`요약:${timeline.summary}`:""}`}],s,500);setExports(p=>({...p,[type]:JSON.parse(raw.replace(/```json|```/g,"").trim())}));addXp(15);}catch{setExports(p=>({...p,[type]:{error:"생성 실패"}}));}setGenExp(null);};
  return(<div style={{height:"100vh",display:"flex",flexDirection:"column",background:M.bg,fontFamily:"'Noto Sans KR',system-ui,sans-serif",color:"#F1F5F9"}}>
    <div style={{background:"linear-gradient(135deg,#010F06,#021A0A)",padding:"12px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${M.b}`,flexShrink:0}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:M.p,fontSize:20,cursor:"pointer",padding:0}}>←</button>
      <div style={{width:32,height:32,borderRadius:9,background:`${M.p}25`,border:`1.5px solid ${M.p}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🌐</div>
      <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,color:M.p}}>MEMOIR</div><div style={{fontSize:9,color:"#064E3B"}}>자동 라이프 아카이브</div></div>
      <div style={{minWidth:100}}><LvBar xp={xp} ac={M.p}/></div>
    </div>
    <div style={{display:"flex",background:M.s,borderBottom:`1px solid ${M.b}`,flexShrink:0}}>{[["home","📡 오늘"],["timeline","⏱️ 타임라인"],["export","📤 콘텐츠"]].map(([v,l])=><button key={v} onClick={()=>setTab(v)} style={{flex:1,padding:"9px 4px",background:"none",border:"none",cursor:"pointer",borderBottom:`2px solid ${tab===v?M.p:"transparent"}`,color:tab===v?M.p:"#475569",fontSize:10,fontWeight:700,fontFamily:"'Noto Sans KR',sans-serif"}}>{l}</button>)}</div>
    <div style={{flex:1,overflowY:"auto",padding:"14px 14px"}}>
      {tab==="home"&&<>
        <div style={{fontSize:11,color:M.p,fontWeight:700,marginBottom:10}}>{DATA.date}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}><SCard icon="🌤️" label="날씨" value={DATA.weather} sub={`AQI ${DATA.aqi}`}/><SCard icon="😴" label="수면" value={`${DATA.sleep.duration}h`} sub={`기상 ${DATA.sleep.wakeTime}`}/><SCard icon="👟" label="걸음수" value={DATA.steps.count.toLocaleString()} sub={`${DATA.steps.distance}km`}/><SCard icon="❤️" label="심박수" value={`${DATA.hrAvg} bpm`} sub="평균"/></div>
        <div style={{background:M.s,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`1px solid ${M.b}`}}>
          <div style={{fontSize:9,color:M.p,letterSpacing:1.5,marginBottom:8}}>📍 방문 장소</div>
          {DATA.places.map(([n,ic,t],i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"5px 0",borderBottom:i<DATA.places.length-1?`1px solid ${M.b}`:"none"}}><span style={{fontSize:18}}>{ic}</span><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:"#F1F5F9"}}>{n}</div><div style={{fontSize:10,color:"#475569"}}>{t}</div></div></div>)}
        </div>
        <button onClick={genTimeline} disabled={genTL} style={{width:"100%",padding:"14px",border:"none",borderRadius:14,fontWeight:800,fontSize:15,cursor:genTL?"not-allowed":"pointer",fontFamily:"'Noto Sans KR',sans-serif",background:genTL?"#0A2E1A":`linear-gradient(135deg,${M.p2},${M.p})`,color:genTL?"#34D399":"#fff"}}>{genTL?"🧠 생성 중…":"🧠 LLMWiki 생성하기 (+25 XP)"}</button>
      </>}
      {tab==="timeline"&&(!timeline?<div style={{textAlign:"center",padding:"60px 0"}}><div style={{fontSize:44,marginBottom:12}}>⏱️</div><div style={{fontSize:14,color:"#475569"}}>홈에서 먼저 생성해주세요</div><button onClick={()=>setTab("home")} style={{marginTop:16,background:`${M.p}20`,border:`1px solid ${M.p}50`,borderRadius:10,padding:"10px 20px",color:M.p,cursor:"pointer",fontSize:13}}>← 홈으로</button></div>:<>
        <div style={{background:`linear-gradient(135deg,${M.p}20,${M.p}08)`,border:`1px solid ${M.p}40`,borderRadius:14,padding:"14px 16px",marginBottom:14}}><div style={{fontSize:9,color:M.p,letterSpacing:2,marginBottom:4}}>📰 TODAY</div><div style={{fontSize:17,fontWeight:800,color:"#F1F5F9",lineHeight:1.3}}>{timeline.headline}</div><div style={{fontSize:12,color:"#94A3B8",marginTop:6}}>{timeline.summary}</div></div>
        {timeline.highlights&&<div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>{timeline.highlights.map((h,i)=><span key={i} style={{fontSize:10,padding:"4px 12px",borderRadius:20,background:`${M.p}18`,color:M.p,border:`1px solid ${M.p}30`}}>⭐ {h}</span>)}</div>}
        <div style={{background:M.s,borderRadius:14,padding:"14px",marginBottom:14,border:`1px solid ${M.b}`}}>{(timeline.timeline||[]).map((item,i)=><div key={i} style={{display:"flex",gap:12,padding:"8px 0",borderBottom:i<timeline.timeline.length-1?`1px solid ${M.b}`:"none",alignItems:"flex-start"}}><div style={{fontSize:10,color:M.p,fontWeight:700,minWidth:40,fontFamily:"monospace"}}>{item.time}</div><div style={{fontSize:18,flexShrink:0}}>{item.icon}</div><div><div style={{fontSize:12,color:"#CBD5E1",lineHeight:1.5}}>{item.event}</div>{item.en&&<div style={{fontSize:10,color:"#475569",fontStyle:"italic"}}>{item.en}</div>}</div></div>)}</div>
        {timeline.diary_eng&&<DiaryCard content={{...timeline,title:timeline.headline}} ac={M.p}/>}
      </>)}
      {tab==="export"&&<>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>{[{type:"reel",icon:"🎞️",label:"릴스"},{type:"tiktok",icon:"🎬",label:"틱톡"}].map(({type,icon,label})=>(<button key={type} onClick={()=>genExport(type)} disabled={genExp===type||!timeline} style={{background:exports[type]?`${M.p}18`:M.s,border:`1.5px solid ${exports[type]?M.p:M.b}`,borderRadius:12,padding:"12px 10px",cursor:(!timeline||genExp===type)?"not-allowed":"pointer",textAlign:"left",opacity:!timeline?0.4:1}}><div style={{fontSize:20,marginBottom:4}}>{icon}</div><div style={{fontSize:12,fontWeight:700,color:exports[type]?M.p:"#F1F5F9"}}>{label}</div><div style={{fontSize:9,color:"#475569"}}>{genExp===type?"생성 중…":exports[type]?"✓ 완료":"탭하여 생성"}</div></button>))}</div>
        {Object.entries(exports).map(([type,data])=>data&&(<div key={type} style={{background:M.s,borderRadius:14,padding:"14px",border:`1px solid ${M.p}30`,marginBottom:10}}><div style={{fontSize:9,color:M.p,letterSpacing:1.5,marginBottom:8}}>{type==="reel"?"🎞️ 릴스":"🎬 틱톡"}</div>{type==="reel"&&<><div style={{fontSize:10,color:"#64748B",marginBottom:4}}>🎵 {data.music_vibe}</div><div style={{fontSize:12,color:"#CBD5E1",lineHeight:1.7,marginBottom:6}}>{data.script}</div><div style={{fontSize:11,color:"#94A3B8"}}>{data.caption}</div></>}{type==="tiktok"&&<><div style={{fontSize:13,fontWeight:700,color:M.p,marginBottom:6}}>🪝 {data.hook}</div><div style={{fontSize:12,color:"#CBD5E1",lineHeight:1.7,marginBottom:6}}>{data.script}</div><div style={{fontSize:10,color:"#475569"}}>{data.hashtags}</div></>}</div>))}
        {!timeline&&<div style={{textAlign:"center",padding:"20px",color:"#475569",fontSize:12}}>먼저 타임라인 탭에서 LLMWiki를 생성해주세요</div>}
      </>}
    </div>
  </div>);}


/* ══ API KEY GATE ════════════════════════════════ */
function ApiKeyGate({children}){
  const[key,setKey]=useState(()=>sessionStorage.getItem("anthropic_key")||"");
  const[input,setInput]=useState("");
  const[err,setErr]=useState("");

  if(key)return children;

  const save=()=>{
    const k=input.trim();
    if(!k){setErr("API Key를 입력해주세요");return;}
    sessionStorage.setItem("anthropic_key",k);
    setKey(k);
  };

  return(
    <div style={{minHeight:"100vh",background:"#020912",display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Noto Sans KR',system-ui,sans-serif"}}>
      <div style={{maxWidth:400,width:"100%",background:"#070F1C",borderRadius:20,padding:32,border:"1px solid #0D1F38"}}>
        <div style={{fontSize:44,textAlign:"center",marginBottom:16}}>📓</div>
        <h1 style={{fontSize:20,fontWeight:900,color:"#F1F5F9",textAlign:"center",marginBottom:4}}>Diary App</h1>
        <p style={{fontSize:12,color:"#475569",textAlign:"center",marginBottom:28}}>ECHO · DAYLY · MEMOIR · Content Studio</p>

        <div style={{fontSize:11,fontWeight:700,color:"#38BDF8",letterSpacing:1.5,marginBottom:8}}>🔑 ANTHROPIC API KEY</div>
        <input
          value={input}
          onChange={e=>{setInput(e.target.value);setErr("");}}
          onKeyDown={e=>e.key==="Enter"&&save()}
          placeholder="sk-ant-api03-..."
          style={{width:"100%",background:"#020912",border:`1px solid ${err?"#EF4444":"#0D1F38"}`,borderRadius:10,padding:"11px 14px",fontSize:13,color:"#F1F5F9",outline:"none",fontFamily:"monospace",boxSizing:"border-box",marginBottom:8}}
        />
        {err&&<div style={{fontSize:11,color:"#F87171",marginBottom:8}}>❌ {err}</div>}

        <button onClick={save}
          style={{width:"100%",padding:"13px",background:"linear-gradient(135deg,#0369A1,#38BDF8)",border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"'Noto Sans KR',sans-serif"}}>
          🚀 시작하기
        </button>

        <div style={{marginTop:20,background:"#0A1628",borderRadius:10,padding:"12px 14px",border:"1px solid #0D1F38"}}>
          <div style={{fontSize:10,color:"#64748B",lineHeight:1.8}}>
            <div style={{color:"#38BDF8",fontWeight:700,marginBottom:4}}>API Key 발급 방법</div>
            1. <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{color:"#38BDF8"}}>console.anthropic.com</a> 접속<br/>
            2. API Keys → Create Key<br/>
            3. 키를 복사해서 위에 붙여넣기<br/>
            <div style={{marginTop:6,color:"#475569"}}>🔒 키는 이 브라우저에만 저장됩니다</div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ══ ROOT ════════════════════════════════════════ */
export default function App(){
  const[screen,setScreen]=useState("hub");
  return(<ApiKeyGate><div style={{maxWidth:520,margin:"0 auto"}}>
    {screen==="hub"     && <HubScreen     onEnter={setScreen}/>}
    {screen==="echo"    && <EchoApp       onBack={()=>setScreen("hub")}/>}
    {screen==="dayly"   && <DaylyApp      onBack={()=>setScreen("hub")}/>}
    {screen==="memoir"  && <MemoirApp     onBack={()=>setScreen("hub")}/>}
    {screen==="content" && <ContentStudio onBack={()=>setScreen("hub")}/>}
  </div></ApiKeyGate>);
}
