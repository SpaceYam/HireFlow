
"use strict";

window.Applicants=(()=>{
  const skills=[
    "협업능력","전문지식","문제해결능력","의사소통","책임감"
  ];

  function page() {
    const list=DB.get("applicants");

    return `
      <section class="page-header">
        <span class="tag">TALENT MANAGEMENT</span>
        <h1>지원자 관리</h1>
        <p>지원자 정보와 평가자 의견 및 직무 역량을 통합 관리합니다.</p>
      </section>

      <div class="section-heading">
        <h2>지원자 목록 (${list.length})</h2>
        <button class="btn" id="add-applicant">+ 지원자 등록</button>
      </div>

      <div class="card">
        <div class="filter-bar">
          <input id="applicant-search" placeholder="이름 또는 직무 검색">
          <select id="applicant-filter">
            <option value="">전체 전형</option>
            ${["서류 검토","면접 진행","최종 합격","불합격"].map(x=>`<option>${x}</option>`).join("")}
          </select>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>이름</th><th>지원 직무</th><th>전형 단계</th>
              <th>평가자</th><th>종합 점수</th><th>관리</th>
            </tr></thead>
            <tbody id="applicant-rows">${rows(list)}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  function rows(list) {
    if(!list.length)return '<tr><td colspan="6" class="empty">등록된 지원자가 없습니다.</td></tr>';

    return list.map(p=>`
      <tr>
        <td><strong>${DB.esc(p.name)}</strong></td>
        <td>${DB.esc(p.position)}</td>
        <td><span class="status">${DB.esc(p.stage)}</span></td>
        <td>${DB.esc(p.evaluator||"-")}</td>
        <td>${score(p)}점</td>
        <td>
          <button class="btn secondary small" data-profile="${p.id}">상세</button>
          <button class="btn secondary small" data-edit-applicant="${p.id}">수정</button>
          <button class="btn danger small" data-delete-applicant="${p.id}">삭제</button>
        </td>
      </tr>
    `).join("");
  }

  function score(p) {
    const values=Object.values(p.skills||{});
    return values.length?Math.round(values.reduce((a,b)=>a+Number(b||0),0)/values.length):0;
  }

  function radar(p) {
    const values=skills.map(s=>Number(p.skills?.[s]||0));
    const cx=175,cy=155,r=105;
    const angles=skills.map((_,i)=>-Math.PI/2+i*2*Math.PI/skills.length);
    const point=(v,i)=>{
      const radius=r*v/100;
      return `${cx+radius*Math.cos(angles[i])},${cy+radius*Math.sin(angles[i])}`;
    };

    const polygon=values.map(point).join(" ");

    return `
      <div class="radar-card">
        <svg viewBox="0 0 350 310" role="img" aria-label="지원자 역량 레이더 차트">
          ${[20,40,60,80,100].map(v=>`
            <polygon points="${angles.map((a)=>`${cx+r*v/100*Math.cos(a)},${cy+r*v/100*Math.sin(a)}`).join(" ")}"
              fill="none" stroke="#e5eaf1" stroke-width="1"/>
          `).join("")}
          ${angles.map((a,i)=>`
            <line x1="${cx}" y1="${cy}" x2="${cx+r*Math.cos(a)}" y2="${cy+r*Math.sin(a)}" stroke="#e5eaf1"/>
            <text x="${cx+(r+25)*Math.cos(a)}" y="${cy+(r+25)*Math.sin(a)}"
              text-anchor="middle" dominant-baseline="middle" font-size="10" fill="#667085">${skills[i]}</text>
          `).join("")}
          <polygon points="${polygon}" fill="rgba(71,121,232,.2)" stroke="#4779e8" stroke-width="2"/>
          ${values.map((v,i)=>`
            <circle cx="${cx+(r*v/100)*Math.cos(angles[i])}" cy="${cy+(r*v/100)*Math.sin(angles[i])}" r="4" fill="#4779e8"/>
          `).join("")}
        </svg>
      </div>
    `;
  }

  function form(p={}) {
    DB.modal(`
      <span class="tag">APPLICANT PROFILE</span>
      <h2>${p.id?"지원자 정보 수정":"지원자 등록"}</h2>
      <form id="applicant-form">
        <div class="form-grid">
          <label class="field"><span>이름</span><input name="name" required value="${DB.esc(p.name||"")}"></label>
          <label class="field"><span>지원 직무</span><input name="position" required value="${DB.esc(p.position||"")}"></label>
          <label class="field"><span>이메일</span><input name="email" type="email" value="${DB.esc(p.email||"")}"></label>
          <label class="field"><span>연락처</span><input name="phone" value="${DB.esc(p.phone||"")}"></label>
          <label class="field"><span>전형 단계</span>
            <select name="stage">
              ${["서류 검토","면접 진행","최종 합격","불합격"].map(s=>`<option ${p.stage===s?"selected":""}>${s}</option>`).join("")}
            </select>
          </label>
          <label class="field"><span>담당 평가자</span><input name="evaluator" value="${DB.esc(p.evaluator||"")}" placeholder="예: 김OO 팀장"></label>
        </div>

        <h3>직무 역량 능력치</h3>
        <p class="muted">각 역량을 0~100점으로 평가하세요.</p>
        <div class="skill-input-grid">
          ${skills.map(s=>`
            <label class="skill-input">
              <span>${s}</span>
              <div class="skill-control">
                <input type="range" min="0" max="100" name="skill_${s}" value="${p.skills?.[s]??50}">
                <output>${p.skills?.[s]??50}</output>
              </div>
            </label>
          `).join("")}
        </div>

        <label class="field" style="margin-top:18px">
          <span>평가 의견</span>
          <textarea name="comment" rows="3">${DB.esc(p.comment||"")}</textarea>
        </label>
        <div class="form-actions"><button class="btn" type="submit">저장</button></div>
      </form>
    `);

    document.querySelectorAll(".skill-control input").forEach(input=>{
      input.oninput=()=>input.nextElementSibling.value=input.value;
    });

    document.getElementById("applicant-form").onsubmit=e=>{
      e.preventDefault();
      const fd=new FormData(e.target);
      const applicants=DB.get("applicants");
      const item={
        ...p,
        id:p.id||DB.uid(),
        name:fd.get("name"),
        position:fd.get("position"),
        email:fd.get("email"),
        phone:fd.get("phone"),
        stage:fd.get("stage"),
        evaluator:fd.get("evaluator"),
        skills:Object.fromEntries(skills.map(s=>[s,Number(fd.get("skill_"+s))])),
        comment:fd.get("comment"),
        updatedAt:new Date().toISOString(),
        createdAt:p.createdAt||new Date().toISOString()
      };

      const idx=applicants.findIndex(x=>x.id===item.id);
      if(idx>=0)applicants[idx]=item;
      else applicants.unshift(item);

      DB.set("applicants",applicants);
      DB.close();
      App.render();
    };
  }

  function profile(id) {
    const p=DB.get("applicants").find(x=>x.id===id);
    if(!p)return;

    DB.modal(`
      <span class="tag">CANDIDATE PROFILE</span>
      <div class="profile-header">
        <div><h2>${DB.esc(p.name)}</h2><p>${DB.esc(p.position)} · ${DB.esc(p.stage)}</p><p>평가자: ${DB.esc(p.evaluator||"-")}</p></div>
        <div class="profile-score"><strong>${score(p)}</strong><span>AVERAGE</span></div>
      </div>
      ${radar(p)}
      <div class="skill-detail-grid">
        ${skills.map(s=>`
          <div class="skill-detail"><span>${s}</span><strong>${p.skills?.[s]??0}</strong></div>
        `).join("")}
      </div>
      <section class="form-section">
        <h3>평가 의견</h3><p>${DB.esc(p.comment||"등록된 의견 없음")}</p>
      </section>
      <section class="form-section">
        <h3>평가 이력</h3>
        ${(p.evaluationHistory||[]).map(h=>`
          <div class="event-row"><strong>${DB.esc(h.evaluator)}</strong><span>${DB.esc(h.date)}</span></div>
        `).join("")||'<p class="muted">기록된 평가 이력이 없습니다.</p>'}
      </section>
      <button class="btn" id="edit-from-profile">지원자 수정</button>
    `);

    document.getElementById("edit-from-profile").onclick=()=>form(p);
  }

  function bind() {
    document.getElementById("add-applicant")?.addEventListener("click",()=>form());

    document.getElementById("applicant-search")?.addEventListener("input",filter);
    document.getElementById("applicant-filter")?.addEventListener("change",filter);

    document.querySelectorAll("[data-profile]").forEach(b=>b.onclick=()=>profile(b.dataset.profile));
    document.querySelectorAll("[data-edit-applicant]").forEach(b=>{
      b.onclick=()=>form(DB.get("applicants").find(p=>p.id===b.dataset.editApplicant));
    });
    document.querySelectorAll("[data-delete-applicant]").forEach(b=>{
      b.onclick=()=>{
        if(!DB.confirmDelete("지원자를 삭제할까요?"))return;
        DB.set("applicants",DB.get("applicants").filter(p=>p.id!==b.dataset.deleteApplicant));
        App.render();
      };
    });
  }

  function filter() {
    const q=(document.getElementById("applicant-search")?.value||"").toLowerCase();
    const stage=document.getElementById("applicant-filter")?.value||"";
    const list=DB.get("applicants").filter(p=>
      (p.name+" "+p.position).toLowerCase().includes(q)&&(!stage||p.stage===stage)
    );
    document.getElementById("applicant-rows").innerHTML=rows(list);
    document.querySelectorAll("[data-profile]").forEach(b=>b.onclick=()=>profile(b.dataset.profile));
    document.querySelectorAll("[data-edit-applicant]").forEach(b=>b.onclick=()=>form(DB.get("applicants").find(p=>p.id===b.dataset.editApplicant)));
    document.querySelectorAll("[data-delete-applicant]").forEach(b=>b.onclick=()=>{
      if(DB.confirmDelete("지원자를 삭제할까요?")){
        DB.set("applicants",DB.get("applicants").filter(p=>p.id!==b.dataset.deleteApplicant));
        App.render();
      }
    });
  }

  return {page,bind,form,profile};
})();
