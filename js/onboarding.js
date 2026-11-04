
"use strict";

window.Onboarding=(()=>{
  const checks=[
    "근로계약서 작성","입사 서류 제출","사내 계정 발급",
    "업무 장비 지급","조직 및 업무 소개","멘토 지정",
    "보안 교육","직무 교육"
  ];

  function page() {
    const list=DB.get("onboarding");

    return `
      <section class="page-header">
        <span class="tag">EMPLOYEE EXPERIENCE</span>
        <h1>온보딩 관리</h1>
        <p>신규 입사자의 입사 준비와 조직 적응을 관리합니다.</p>
      </section>

      <div class="section-heading">
        <h2>온보딩 대상자 (${list.length})</h2>
        <button class="btn" id="add-onboarding">+ 입사자 등록</button>
      </div>

      <div class="notes-grid">
        ${list.map(p=>{
          const done=(p.checks||[]).filter(Boolean).length;
          return `
            <article class="card">
              <span class="tag">${DB.esc(p.department||"신규 입사자")}</span>
              <h3>${DB.esc(p.name)}</h3>
              <p>${DB.esc(p.position)} · ${DB.esc(p.joinDate)}</p>
              <div class="progress"><span style="width:${done/checks.length*100}%"></span></div>
              <p>${done}/${checks.length}개 완료</p>
              <button class="btn secondary" data-onboarding="${p.id}">관리하기</button>
            </article>
          `;
        }).join("")||'<div class="card empty">등록된 온보딩 대상자가 없습니다.</div>'}
      </div>
    `;
  }

  function form(p={}) {
    DB.modal(`
      <h2>${p.id?"입사자 수정":"신규 입사자 등록"}</h2>
      <form id="onboarding-form">
        <div class="form-grid">
          <label class="field"><span>이름</span><input name="name" required value="${DB.esc(p.name||"")}"></label>
          <label class="field"><span>부서</span><input name="department" value="${DB.esc(p.department||"")}"></label>
          <label class="field"><span>직무</span><input name="position" value="${DB.esc(p.position||"")}"></label>
          <label class="field"><span>입사일</span><input name="joinDate" type="date" value="${DB.esc(p.joinDate||"")}"></label>
        </div>
        <button class="btn" type="submit">저장</button>
      </form>
    `);

    document.getElementById("onboarding-form").onsubmit=e=>{
      e.preventDefault();
      const fd=new FormData(e.target);
      const list=DB.get("onboarding");
      const item={
        ...p,id:p.id||DB.uid(),
        name:fd.get("name"),department:fd.get("department"),
        position:fd.get("position"),joinDate:fd.get("joinDate"),
        checks:p.checks||[]
      };
      const i=list.findIndex(x=>x.id===item.id);
      if(i>=0)list[i]=item;else list.push(item);
      DB.set("onboarding",list);
      DB.close();App.render();
    };
  }

  function detail(id) {
    const p=DB.get("onboarding").find(x=>x.id===id);
    if(!p)return;

    DB.modal(`
      <span class="tag">ONBOARDING CHECKLIST</span>
      <h2>${DB.esc(p.name)}</h2>
      <p>${DB.esc(p.department)} · ${DB.esc(p.position)}</p>
      <div class="check-grid">
        ${checks.map((c,i)=>`
          <label class="check-card">
            <input type="checkbox" data-onboard-check="${i}" ${(p.checks||[])[i]?"checked":""}>
            ${c}
          </label>
        `).join("")}
      </div>
      <div class="form-actions">
        <button class="btn secondary" id="edit-onboarding">정보 수정</button>
        <button class="btn" id="save-onboarding">체크리스트 저장</button>
      </div>
    `);

    document.getElementById("save-onboarding").onclick=()=>{
      p.checks=checks.map((_,i)=>document.querySelector(`[data-onboard-check="${i}"]`).checked);
      const list=DB.get("onboarding");
      const idx=list.findIndex(x=>x.id===id);
      list[idx]=p;DB.set("onboarding",list);
      DB.close();App.render();
    };
    document.getElementById("edit-onboarding").onclick=()=>form(p);
  }

  function bind() {
    document.getElementById("add-onboarding")?.addEventListener("click",()=>form());
    document.querySelectorAll("[data-onboarding]").forEach(b=>b.onclick=()=>detail(b.dataset.onboarding));
  }

  return {page,bind,form,detail};
})();
