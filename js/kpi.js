
"use strict";

window.KPI=(()=>{
  function metrics(data) {
    const total=data.total;
    return {
      conversion:total?data.hired/total*100:0,
      acceptance:data.offers?data.hired/data.offers*100:0,
      days:data.days,
      cost:total?data.budget/total:0
    };
  }

  function page() {
    const applicants=DB.get("applicants");
    const total=applicants.length;
    const hired=applicants.filter(p=>p.stage==="최종 합격").length;
    const rejected=applicants.filter(p=>p.stage==="불합격").length;
    const active=total-hired-rejected;
    const calendar=DB.get("calendar");
    const interviews=calendar.filter(e=>/면접/.test(e.type||e.title||"")).length;
    const conversion=total?hired/total*100:0;

    return `
      <section class="page-header">
        <span class="tag">RECRUITMENT ANALYTICS</span>
        <h1>채용 KPI 분석</h1>
        <p>채용 성과를 수치로 분석하고 향후 운영 결과를 예측합니다.</p>
      </section>

      <div class="stats-grid">
        <article class="card metric-card">
          <span>전체 지원자</span><strong>${total}</strong>
        </article>
        <article class="card metric-card">
          <span>최종 합격자</span><strong>${hired}</strong>
        </article>
        <article class="card metric-card">
          <span>진행 중</span><strong>${active}</strong>
        </article>
        <article class="card metric-card">
          <span>합격 전환율</span><strong>${conversion.toFixed(1)}%</strong>
        </article>
      </div>

      <section class="card">
        <h2>채용 단계별 현황</h2>
        <div class="bar-chart">
          ${[
            ["서류 검토",applicants.filter(p=>p.stage==="서류 검토").length],
            ["면접 진행",applicants.filter(p=>p.stage==="면접 진행").length],
            ["최종 합격",hired],
            ["불합격",rejected]
          ].map(([label,value])=>`
            <div class="bar-item">
              <span>${label}</span>
              <div class="progress"><span style="width:${total?value/total*100:0}%"></span></div>
              <strong>${value}</strong>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="card">
        <h2>채용 운영 현황</h2>
        <div class="simulation-grid">
          <div class="simulation-metric"><span>등록된 면접 일정</span><strong>${interviews}</strong></div>
          <div class="simulation-metric"><span>불합격자</span><strong>${rejected}</strong></div>
          <div class="simulation-metric"><span>진행 중 지원자</span><strong>${active}</strong></div>
        </div>
      </section>

      <section class="card">
        <span class="tag">KPI SIMULATOR</span>
        <h2>채용 KPI 시뮬레이션</h2>
        <p class="muted">예상 지원자와 채용 목표를 입력해 채용 성과를 예측하세요.</p>

        <form id="kpi-simulation-form">
          <div class="form-grid">
            <label class="field"><span>예상 지원자 수</span><input name="total" type="number" min="0" value="100" required></label>
            <label class="field"><span>예상 최종 합격자</span><input name="hired" type="number" min="0" value="5" required></label>
            <label class="field"><span>오퍼 발송 수</span><input name="offers" type="number" min="0" value="8" required></label>
            <label class="field"><span>평균 채용 소요일</span><input name="days" type="number" min="0" value="30" required></label>
            <label class="field"><span>예상 채용 예산</span><input name="budget" type="number" min="0" value="10000000" required></label>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn">시뮬레이션 실행</button>
          </div>
        </form>
        <div id="kpi-simulation-result"></div>
      </section>
    `;
  }

  function bind() {
    document.getElementById("kpi-simulation-form")?.addEventListener("submit",e=>{
      e.preventDefault();
      const fd=new FormData(e.target);
      const d=Object.fromEntries(["total","hired","offers","days","budget"].map(k=>[k,Number(fd.get(k))]));

      const result=document.getElementById("kpi-simulation-result");

      if(d.hired>d.total||d.offers<d.hired||d.total<0){
        result.innerHTML='<div class="validation-error">입력값을 확인하세요. 합격자는 지원자 수를 초과할 수 없으며 오퍼 수는 합격자 수 이상이어야 합니다.</div>';
        return;
      }

      const m=metrics(d);
      result.innerHTML=`
        <div class="simulation-result">
          <h3>시뮬레이션 결과</h3>
          <div class="simulation-grid">
            <div class="simulation-metric"><span>예상 합격 전환율</span><strong>${m.conversion.toFixed(1)}%</strong></div>
            <div class="simulation-metric"><span>오퍼 수락률</span><strong>${m.acceptance.toFixed(1)}%</strong></div>
            <div class="simulation-metric"><span>1인당 채용 비용</span><strong>${Math.round(m.cost).toLocaleString("ko-KR")}원</strong></div>
            <div class="simulation-metric"><span>평균 채용 소요일</span><strong>${m.days}일</strong></div>
          </div>
        </div>
      `;
    });
  }

  return {page,bind};
})();
