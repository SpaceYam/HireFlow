
"use strict";

window.HF = {
  steps: [
    {id:"planning",name:"채용 계획",description:"인력 수요 분석 및 채용 계획 수립"},
    {id:"posting",name:"채용 공고",description:"채용 공고 작성 및 모집 채널 운영"},
    {id:"screening",name:"서류 전형",description:"지원자 서류 검토 및 평가"},
    {id:"interview",name:"면접 전형",description:"구조화 면접 및 역량 평가"},
    {id:"assessment",name:"역량 평가",description:"직무 과제 및 실무 역량 검증"},
    {id:"decision",name:"최종 결정",description:"최종 평가 및 입사 제안"},
    {id:"onboarding",name:"온보딩",description:"신규 입사자 적응 및 정착"}
  ],
  channels: [
    {name:"사람인",category:"종합 채용",url:"https://www.saramin.co.kr"},
    {name:"잡코리아",category:"종합 채용",url:"https://www.jobkorea.co.kr"},
    {name:"LinkedIn",category:"글로벌 채용",url:"https://www.linkedin.com"},
    {name:"원티드",category:"IT 및 전문직",url:"https://www.wanted.co.kr"}
  ]
};

window.DB = (() => {
  const PREFIX="hireflow_";

  const defaults={
    applicants:[],
    calendar:[],
    onboarding:[],
    notes:[],
    taskProgress:{},
    taskForms:{},
    settings:{version:"2.0"}
  };

  function get(key) {
    try {
      const value=localStorage.getItem(PREFIX+key);
      return value===null
        ?structuredClone(defaults[key]??[])
        :JSON.parse(value);
    } catch {
      return structuredClone(defaults[key]??[]);
    }
  }

  function set(key,value) {
    localStorage.setItem(PREFIX+key,JSON.stringify(value));
  }

  function uid() {
    return "HF-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8);
  }

  function esc(value) {
    return String(value??"").replace(/[&<>"']/g,char=>({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    })[char]);
  }

  function today() {
    const d=new Date();
    return [
      d.getFullYear(),
      String(d.getMonth()+1).padStart(2,"0"),
      String(d.getDate()).padStart(2,"0")
    ].join("-");
  }

  function modal(html) {
    document.getElementById("modal-content").innerHTML=html;
    document.getElementById("modal").classList.remove("hidden");
  }

  function close() {
    document.getElementById("modal").classList.add("hidden");
    document.getElementById("modal-content").innerHTML="";
  }

  function download(filename,content,type="text/html;charset=utf-8") {
    const blob=new Blob([content],{type});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function confirmDelete(message) {
    return confirm(message||"삭제하시겠습니까?");
  }

  function initialize() {
    Object.keys(defaults).forEach(key=>{
      if(localStorage.getItem(PREFIX+key)===null)set(key,defaults[key]);
    });

    // 기존 버전에서 사용하던 키를 새 저장 구조로 이전
    Object.keys(defaults).forEach(key=>{
      if(localStorage.getItem(PREFIX+key)===null){
        const old=localStorage.getItem(key);
        if(old!==null){
          try{set(key,JSON.parse(old));}catch{}
        }
      }
    });
  }

  initialize();

  return {
    get,set,uid,esc,today,modal,close,download,confirmDelete,
    prefix:PREFIX
  };
})();
