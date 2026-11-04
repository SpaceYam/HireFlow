
"use strict";

window.App=(()=>{
  const routes={
    "/":dashboard,
    "/documents":()=>Docs.catalog(),
    "/calendar":()=>CalendarTool.page(),
    "/kpi":()=>KPI.page(),
    "/applicants":()=>Applicants.page(),
    "/onboarding":()=>Onboarding.page(),
    "/backup":()=>Backup.page(),
    "/notes":()=>Notes.page(),
    "/trends":trends
  };

  HF.steps.forEach(s=>routes["/"+s.id]=()=>Process.page(s.id));

  function dashboard() {
    const applicants=DB.get("applicants");
    const events=DB.get("calendar");
    const onboarding=DB.get("onboarding");
    const notes=DB.get("notes");

    const total=applicants.length;
    const hired=applicants.filter(p=>p.stage==="최종 합격").length;
    const active=applicants.filter(p=>!["최종 합격","불합격"].includes(p.stage)).length;
    const interviews=events.filter(e=>/면접/.test(e.type||e.title||"")).length;
    const today=events.filter(e=>e.date===DB.today());

    return `
      <section class="page-header">
        <span class="tag">HR MANAGEMENT WORKSPACE</span>
        <h1>HR Dashboard</h1>
        <p>채용 현황과 인재 확보 업무를 통합 관리합니다.</p>
      </section>

      <div class="stats-grid">
        <a href="#/applicants" class="card stat-link">
          <span class="stat-label">전체 지원자</span>
          <div class="stat-value">${total}</div>
          <span class="stat-hint">지원자 관리 →</span>
        </a>
        <a href="#/applicants" class="card stat-link">
          <span class="stat-label">진행 중 지원자</span>
          <div class="stat-value">${active}</div>
          <span class="stat-hint">전형 현황 확인 →</span>
        </a>
        <a href="#/kpi" class="card stat-link">
          <span class="stat-label">합격 전환율</span>
          <div class="stat-value">${total?(hired/total*100).toFixed(1):"0.0"}%</div>
          <span class="stat-hint">KPI 분석 →</span>
        </a>
        <a href="#/calendar" class="card stat-link">
          <span class="stat-label">등록된 면접</span>
          <div class="stat-value">${interviews}</div>
          <span class="stat-hint">채용 캘린더 →</span>
        </a>
      </div>

      <div class="dashboard-grid">
        <section class="card">
          <div class="section-heading">
            <h2>오늘의 채용 일정</h2>
            <a href="#/calendar">전체 보기 →</a>
          </div>
          ${today.map(e=>`
            <div class="event-row">
              <strong>${DB.esc(e.title)}</strong>
              <span>${DB.esc(e.time||"")}</span>
            </div>
          `).join("")||'<div class="empty">오늘 예정된 일정이 없습니다.</div>'}
          <a href="#/calendar" class="btn secondary">캘린더 열기</a>
        </section>

        <section class="card">
          <div class="section-heading">
            <h2>개인 메모</h2>
            <a href="#/notes">전체 보기 →</a>
          </div>
          ${notes.slice(0,3).map(n=>`
            <div class="event-row">
              <strong>${DB.esc(n.title)}</strong>
              <span>${new Date(n.updatedAt).toLocaleDateString("ko-KR")}</span>
            </div>
          `).join("")||'<div class="empty">아직 작성한 메모가 없습니다.</div>'}
          <a href="#/notes" class="btn secondary">+ 메모 작성</a>
        </section>
      </div>

      <section class="card">
        <h2>빠른 업무</h2>
        <div class="quick-links">
          <a href="#/applicants">+ 지원자 등록</a>
          <a href="#/calendar">+ 일정 등록</a>
          <a href="#/documents">+ 표준 문서 작성</a>
          <a href="#/onboarding">+ 입사자 등록</a>
        </div>
      </section>

      <section>
        <div class="section-heading"><h2>채용 프로세스</h2><span class="muted">RECRUITMENT FLOW</span></div>
        <div class="process-grid">
          ${HF.steps.map((s,i)=>{
            const tasks=Process.tasks[s.id]||[];
            const done=tasks.filter((_,j)=>DB.get("taskProgress")[s.id+"_"+j]).length;
            return `
              <a href="#/${s.id}" class="process-card">
                <span class="process-number">STEP ${String(i+1).padStart(2,"0")}</span>
                <h3>${DB.esc(s.name)}</h3>
                <p>${DB.esc(s.description)}</p>
                <div class="progress"><span style="width:${tasks.length?done/tasks.length*100:0}%"></span></div>
                <span class="card-arrow">${done}/${tasks.length} 업무 완료 →</span>
              </a>
            `;
          }).join("")}
        </div>
      </section>

      <section class="card">
        <h2>HR 업무 도구</h2>
        <div class="tool-grid">
          ${[
            ["documents","문서 자료실","표준 HR 문서"],
            ["calendar","채용 캘린더","채용 일정 관리"],
            ["kpi","KPI 분석","채용 성과 및 시뮬레이션"],
            ["applicants","지원자 관리","지원자 및 평가자 관리"],
            ["onboarding","온보딩 관리","신규 입사자 관리"],
            ["notes","개인 메모","텍스트 및 드로잉"],
            ["trends","HR 트렌드","HR 운영 인사이트"],
            ["backup","데이터 백업","저장 현황 및 복원"]
          ].map(([id,title,desc])=>`
            <a href="#/${id}" class="tool-card">
              <h3>${title}</h3><p>${desc}</p><span>열기 →</span>
            </a>
          `).join("")}
        </div>
      </section>
    `;
  }

  function trends() {
    const items=[
      ["AI 기반 채용 자동화","공고 작성 및 일정 조율 등 반복 업무를 보조합니다.","최종 평가와 의사결정은 담당자가 검토합니다."],
      ["스킬 기반 채용","실제 직무 역량을 중심으로 평가합니다.","직무 과제와 구조화 면접을 활용합니다."],
      ["후보자 경험 개선","지원부터 결과 안내까지 경험을 관리합니다.","전형별 안내와 피드백 기준을 수립합니다."],
      ["구조화 면접","공통 질문과 평가 척도를 적용합니다.","평가 근거를 기록합니다."],
      ["채용 데이터 분석","채용 소요일과 전환율을 분석합니다.","직무별·채널별 데이터를 비교합니다."],
      ["공정한 채용","직무 관련 기준으로 지원자를 평가합니다.","불필요한 개인정보 활용을 제한합니다."]
    ];

    return `
      <section class="page-header">
        <span class="tag">HR TREND REPORT</span>
        <h1>HR 트렌드 분석</h1>
        <p>HR 업무에 적용할 주요 운영 방향입니다.</p>
      </section>
      <div class="trend-grid">
        ${items.map(([t,d,a])=>`
          <article class="card"><h3>${t}</h3><p>${d}</p>
            <div class="guide-box"><strong>실무 적용</strong><p>${a}</p></div>
          </article>
        `).join("")}
      </div>
    `;
  }

  function shell() {
    const groups=[
      {label:"WORKSPACE",items:[["/","대시보드"]]},
      {label:"RECRUITMENT",items:HF.steps.map(s=>["/"+s.id,s.name])},
      {label:"HR TOOLS",items:[
        ["/documents","문서 자료실"],
        ["/calendar","채용 캘린더"],
        ["/kpi","KPI 분석"],
        ["/applicants","지원자 관리"],
        ["/onboarding","온보딩 관리"],
        ["/notes","개인 메모"],
        ["/trends","HR 트렌드"],
        ["/backup","데이터 백업"]
      ]}
    ];

    document.getElementById("app").innerHTML=`
      <div class="layout">
        <aside class="sidebar" id="sidebar">
          <a href="#/" class="logo">HIRE<span>FLOW</span></a>
          <div class="sidebar-caption">HUMAN RESOURCE PLATFORM</div>
          ${groups.map(g=>`
            <div class="nav-label">${g.label}</div>
            ${g.items.map(([path,label])=>`
              <a href="#${path}" class="nav-link" data-link>${label}</a>
            `).join("")}
          `).join("")}
          <div class="sidebar-bottom"><span class="status-dot"></span> Workspace Active</div>
        </aside>

        <main class="main">
          <header class="topbar">
            <button id="menu" class="icon-button">☰</button>
            <span>HIREFLOW / HR WORKSPACE</span>
            <span class="topbar-right">HR MANAGER</span>
          </header>
          <div id="content"></div>
          <footer class="footer">HIREFLOW · HR Recruitment Workspace</footer>
        </main>
      </div>
    `;
  }

  function bind() {
    document.getElementById("menu")?.addEventListener("click",()=>{
      document.getElementById("sidebar").classList.toggle("open");
    });

    document.querySelectorAll("[data-doc]").forEach(b=>{
      b.onclick=()=>Docs.open(b.dataset.doc);
    });

    Process.bind();
    CalendarTool.bind();
    KPI.bind();
    Applicants.bind();
    Onboarding.bind();
    Backup.bind();
    Notes.bind();
  }

  function render() {
    const path=location.hash.slice(1).split("?")[0]||"/";
    const content=document.getElementById("content");

    content.innerHTML=routes[path]
      ?routes[path]()
      :"<h1>404</h1><a href='#/'>대시보드로 이동</a>";

    document.querySelectorAll("[data-link]").forEach(link=>{
      link.classList.toggle("active",link.getAttribute("href")==="#"+path);
    });

    bind();
  }

  function init() {
    shell();

    document.addEventListener("click",e=>{
      if(e.target.closest("[data-close]"))DB.close();
      if(e.target.id==="modal")DB.close();
    });

    window.addEventListener("hashchange",render);

    if(!location.hash)location.hash="#/";
    else render();
  }

  return {init,render};
})();

App.init();
