
"use strict";

window.Process = (() => {
  const tasks = {
    planning: [
      ["인력 수요 분석","현재 인력과 사업 계획을 비교합니다.",["부서명","직무명","현재인원","필요인원","충원인원","예산","요청일","충원사유"],"request"],
      ["채용 요청 승인","현업 부서와 HR의 채용 요청을 승인합니다.",["요청부서","요청자","직무명","채용인원","예산","승인자","승인일","승인결과"],"request"],
      ["직무 분석","직무 역할과 필수 역량을 정의합니다.",["직무명","직무목적","주요업무","필수역량","우대역량","성과기준"],"jd"]
    ],
    posting: [
      ["채용 공고 작성","지원자에게 직무 정보를 전달합니다.",["공고명","직무명","모집인원","근무형태","근무지역","지원시작일","지원마감일","자격요건"],"posting"],
      ["채용 채널 선정","직무에 맞는 모집 채널을 선택합니다.",["직무명","채널명","게시일","마감일","예상지원자","실제지원자","채널비용"],"posting"]
    ],
    screening: [
      ["서류 검토 기준 수립","공정하고 일관된 평가 기준을 정의합니다.",["직무명","평가기준","필수자격","우대자격","평가자","평가일"],"interview"],
      ["지원자 서류 평가","직무 관련 경험과 성과를 검토합니다.",["지원자명","지원직무","평가자","전문지식점수","경력적합도","종합의견","평가결과"],"interview"]
    ],
    interview: [
      ["면접 질문 설계","핵심 역량을 확인할 질문을 설계합니다.",["직무명","면접유형","평가역량","공통질문","면접관","면접일"],"interview"],
      ["면접 진행","구조화된 면접을 진행하고 평가합니다.",["지원자명","면접관","면접일","협업능력","전문지식","문제해결능력","의사소통","종합평가"],"interview"]
    ],
    assessment: [
      ["직무 과제 평가","실무 과제로 직무 수행 능력을 검증합니다.",["지원자명","과제명","제출일","평가자","전문지식","문제해결능력","평가의견"],"interview"]
    ],
    decision: [
      ["최종 평가","전형별 결과를 종합합니다.",["지원자명","평가자","서류점수","면접점수","과제점수","최종점수","최종의견","결정일"],"final"],
      ["오퍼 및 입사 확정","근로 조건과 입사 일정을 확정합니다.",["지원자명","직무명","제안연봉","입사예정일","오퍼발송일","수락여부","담당자"],"final"]
    ],
    onboarding: [
      ["입사 준비","계정, 장비 및 입사 서류를 준비합니다.",["입사자명","부서명","직무명","입사일","담당자","장비준비","계정발급","서류확인"],"onboarding"],
      ["30·60·90일 적응 관리","신규 입사자의 적응을 관리합니다.",["입사자명","30일평가","60일평가","90일평가","멘토","교육현황","종합의견"],"onboarding"]
    ]
  };

  const KEY="hireflow_taskForms";
  const PROGRESS="hireflow_taskProgress";

  function saved(id,index) {
    return DB.get("taskForms")[id+"_"+index]||{};
  }

  function progress(id,index) {
    return DB.get("taskProgress")[id+"_"+index]||false;
  }

  function cardValue(task,index,id) {
    const data=saved(id,index);
    const fields=task[2];
    const important=fields.filter(f=>
      ["현재인원","필요인원","충원인원","예산","채용인원","직무명","부서명"].includes(f)
    );

    return important.filter(f=>data[f]).map(f=>`
      <div class="task-data-item">
        <span>${DB.esc(f)}</span>
        <strong>${DB.esc(data[f])}${f.includes("인원")?"명":""}</strong>
      </div>
    `).join("");
  }

  function page(id) {
    const step=HF.steps.find(s=>s.id===id);
    if(!step)return "<h1>페이지를 찾을 수 없습니다.</h1>";

    const list=tasks[id]||[];
    const completed=list.filter((_,i)=>progress(id,i)).length;
    const percent=list.length?Math.round(completed/list.length*100):0;

    return `
      <div class="breadcrumb">
        <a href="#/">대시보드</a>
        <span>›</span>
        <span>채용 프로세스</span>
        <span>›</span>
        <strong>${DB.esc(step.name)}</strong>
      </div>

      <section class="page-header">
        <span class="tag">RECRUITMENT PROCESS</span>
        <h1>${DB.esc(step.name)}</h1>
        <p>${DB.esc(step.description)}</p>
      </section>

      <div class="process-overview">
        ${HF.steps.map((s,i)=>`
          <a href="#/${s.id}" class="step-item ${s.id===id?"selected":""}">
            <span>${String(i+1).padStart(2,"0")}</span>
            <strong>${DB.esc(s.name)}</strong>
          </a>
        `).join("")}
      </div>

      <section class="card process-summary">
        <div class="section-heading">
          <div>
            <span class="tag">PROCESS PROGRESS</span>
            <h2>업무 진행 현황</h2>
          </div>
          <strong>${percent}%</strong>
        </div>
        <div class="progress process-progress">
          <span style="width:${percent}%"></span>
        </div>
        <p>${completed}개 완료 / 전체 ${list.length}개 업무</p>
      </section>

      <section class="card">
        <div class="section-heading">
          <div>
            <span class="tag">TASK MANAGEMENT</span>
            <h2>실무 업무 체크리스트</h2>
          </div>
          <span class="muted">${list.length}개 업무</span>
        </div>

        <div class="task-grid">
          ${list.map((task,i)=>{
            const done=progress(id,i);
            return `
              <article class="task-card ${done?"task-done":""}">
                <div class="task-card-heading">
                  <span class="task-number">TASK ${String(i+1).padStart(2,"0")}</span>
                  <label class="task-status">
                    <input type="checkbox" data-task-complete="${id}" data-index="${i}" ${done?"checked":""}>
                    ${done?"완료":"진행 중"}
                  </label>
                </div>
                <h3>${DB.esc(task[0])}</h3>
                <p>${DB.esc(task[1])}</p>

                <div class="task-data-grid">
                  ${cardValue(task,i,id)||'<span class="muted">등록된 업무 정보가 없습니다.</span>'}
                </div>

                <div class="task-card-actions">
                  <button class="btn secondary" data-task="${id}" data-index="${i}">
                    업무 양식 열기 →
                  </button>
                </div>
              </article>
            `;
          }).join("")}
        </div>
      </section>

      <section class="card">
        <h2>HR 도구 바로 가기</h2>
        <div class="quick-links">
          <a href="#/documents">표준 문서 자료실 →</a>
          <a href="#/calendar">채용 일정 캘린더 →</a>
          <a href="#/applicants">지원자 관리 →</a>
          <a href="#/kpi">채용 KPI 분석 →</a>
        </div>
      </section>
    `;
  }

  function open(id,index) {
    const task=tasks[id]?.[index];
    if(!task)return;

    const key=id+"_"+index;
    const savedData=saved(id,index);

    DB.modal(`
      <span class="tag">HR WORK FORM</span>
      <h2>${DB.esc(task[0])}</h2>
      <p class="muted">${DB.esc(task[1])}</p>

      <form id="task-form">
        <div class="form-grid">
          ${task[2].map((field,i)=>{
            const value=DB.esc(savedData[field]||"");
            const date=/일$/.test(field);
            const number=/인원|점수|예산|연봉/.test(field);
            return `
              <label class="field">
                <span>${DB.esc(field)}</span>
                ${date
                  ?`<input type="date" name="f${i}" value="${value}">`
                  :number
                    ?`<input type="number" min="0" name="f${i}" value="${value}">`
                    :field.includes("의견")||field.includes("사유")||field.includes("업무")||field.includes("역량")||field.includes("질문")
                      ?`<textarea name="f${i}" rows="3">${value}</textarea>`
                      :`<input type="text" name="f${i}" value="${value}">`
                }
              </label>
            `;
          }).join("")}
        </div>

        <div class="form-actions">
          <button type="button" class="btn secondary" data-close>취소</button>
          <button type="submit" class="btn">업무 내용 저장</button>
        </div>
      </form>

      <div class="modal-shortcuts">
        <h3>관련 업무 도구</h3>
        <a class="btn secondary" href="#/documents" data-close>문서 자료실</a>
        <a class="btn secondary" href="#/calendar" data-close>채용 캘린더</a>
        ${task[3]?`
          <button class="btn secondary" id="related-document">관련 표준양식 열기</button>
        `:""}
      </div>
    `);

    document.getElementById("task-form").onsubmit=e=>{
      e.preventDefault();
      const values={};
      task[2].forEach((field,i)=>{
        values[field]=new FormData(e.target).get("f"+i)||"";
      });

      const all=DB.get("taskForms");
      all[key]=values;
      DB.set("taskForms",all);
      DB.close();
      App.render();
    };

    document.getElementById("related-document")?.addEventListener("click",()=>{
      Docs.open(task[3]);
    });
  }

  function bind() {
    document.querySelectorAll("[data-task]").forEach(button=>{
      button.onclick=()=>open(button.dataset.task,Number(button.dataset.index));
    });

    document.querySelectorAll("[data-task-complete]").forEach(input=>{
      input.onchange=()=>{
        const all=DB.get("taskProgress");
        all[input.dataset.task+"_"+input.dataset.index]=input.checked;
        DB.set("taskProgress",all);
        App.render();
      };
    });
  }

  return {page,open,bind,tasks};
})();
