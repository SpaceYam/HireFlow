
"use strict";

window.Backup=(()=>{
  const keys=[
    ["applicants","지원자"],
    ["calendar","채용 일정"],
    ["onboarding","온보딩"],
    ["notes","개인 메모"],
    ["taskForms","업무 양식"],
    ["taskProgress","업무 진행 현황"]
  ];

  function page() {
    const total=keys.reduce((sum,[key])=>{
      const data=DB.get(key);
      return sum+(Array.isArray(data)?data.length:Object.keys(data||{}).length);
    },0);

    return `
      <section class="page-header">
        <span class="tag">DATA MANAGEMENT</span>
        <h1>데이터 백업 및 관리</h1>
        <p>현재 브라우저에 저장된 HR 데이터를 확인하고 안전하게 백업하세요.</p>
      </section>

      <div class="stats-grid">
        <article class="card metric-card"><span>저장 데이터 종류</span><strong>${keys.length}</strong></article>
        <article class="card metric-card"><span>전체 저장 항목</span><strong>${total}</strong></article>
        <article class="card metric-card"><span>저장 방식</span><strong>LOCAL</strong></article>
        <article class="card metric-card"><span>백업 상태</span><strong>READY</strong></article>
      </div>

      <section class="card">
        <h2>데이터 저장 현황</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>데이터</th><th>저장 항목</th><th>상태</th></tr></thead>
            <tbody>
              ${keys.map(([key,label])=>{
                const data=DB.get(key);
                const count=Array.isArray(data)?data.length:Object.keys(data||{}).length;
                return `<tr><td>${label}</td><td>${count}건</td><td><span class="status">저장됨</span></td></tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>데이터 백업</h2>
        <p class="muted">현재 HIREFLOW 데이터를 JSON 파일로 다운로드합니다.</p>
        <button class="btn" id="export-backup">전체 데이터 내보내기</button>
      </section>

      <section class="card">
        <h2>데이터 복원</h2>
        <p class="muted">이전에 저장한 HIREFLOW JSON 백업 파일을 선택하세요.</p>
        <label class="field">
          <span>백업 파일 선택</span>
          <input type="file" id="import-backup" accept=".json,application/json">
        </label>
        <p class="muted">복원하면 현재 저장 데이터가 백업 파일 내용으로 교체됩니다.</p>
        <button class="btn secondary" id="restore-backup">데이터 복원</button>
      </section>
    `;
  }

  function bind() {
    document.getElementById("export-backup")?.addEventListener("click",()=>{
      const output={version:"2.0",createdAt:new Date().toISOString(),data:{}};
      keys.forEach(([key])=>output.data[key]=DB.get(key));
      DB.download("hireflow-backup-"+DB.today()+".json",JSON.stringify(output,null,2),"application/json");
    });

    document.getElementById("restore-backup")?.addEventListener("click",()=>{
      const file=document.getElementById("import-backup").files[0];
      if(!file){alert("백업 파일을 선택하세요.");return;}

      const reader=new FileReader();
      reader.onload=()=>{
        try{
          const parsed=JSON.parse(reader.result);
          if(!parsed.data||typeof parsed.data!=="object")throw new Error("잘못된 백업 형식");
          if(!confirm("현재 데이터가 백업 파일 내용으로 교체됩니다. 계속할까요?"))return;

          keys.forEach(([key])=>{
            if(Object.hasOwn(parsed.data,key))DB.set(key,parsed.data[key]);
          });

          alert("데이터 복원이 완료되었습니다.");
          App.render();
        }catch(error){
          alert("백업 파일을 읽을 수 없습니다: "+error.message);
        }
      };
      reader.readAsText(file);
    });
  }

  return {page,bind};
})();
