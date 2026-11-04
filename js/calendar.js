
"use strict";

window.CalendarTool=(()=>{
  let current=new Date();
  let selected=DB.today();

  const types=[
    ["서류 전형","blue"],
    ["면접","purple"],
    ["과제 평가","orange"],
    ["최종 면접","green"],
    ["입사","teal"],
    ["기타","gray"]
  ];

  function page() {
    const year=current.getFullYear();
    const month=current.getMonth();
    const first=new Date(year,month,1);
    const start=new Date(year,month,1-first.getDay());
    const events=DB.get("calendar");
    const days=Array.from({length:42},(_,i)=>{
      const d=new Date(start);
      d.setDate(start.getDate()+i);
      return d;
    });

    return `
      <section class="page-header">
        <span class="tag">RECRUITMENT SCHEDULE</span>
        <h1>채용 캘린더</h1>
        <p>채용 단계별 일정을 월간 달력으로 관리합니다.</p>
      </section>

      <section class="card calendar-card">
        <div class="calendar-toolbar">
          <div>
            <h2>${year}년 ${month+1}월</h2>
            <p>MONTHLY RECRUITMENT CALENDAR</p>
          </div>
          <div class="calendar-controls">
            <button class="btn secondary" id="cal-prev">←</button>
            <button class="btn secondary" id="cal-today">오늘</button>
            <button class="btn secondary" id="cal-next">→</button>
            <button class="btn" id="add-event">+ 일정 등록</button>
          </div>
        </div>

        <div class="calendar-legend">
          ${types.map(([name,color])=>`<span><i class="legend-${color}"></i>${name}</span>`).join("")}
        </div>

        <div class="calendar-grid">
          ${["일","월","화","수","목","금","토"].map(d=>`<div class="calendar-weekday">${d}</div>`).join("")}
          ${days.map(d=>{
            const date=localDate(d);
            const items=events.filter(e=>e.date===date);
            return `
              <div class="calendar-day ${d.getMonth()!==month?"other-month":""} ${date===DB.today()?"today":""} ${date===selected?"selected-day":""}" data-date="${date}">
                <button class="calendar-date" data-select-date="${date}">${d.getDate()}</button>
                <div class="calendar-events">
                  ${items.slice(0,3).map(e=>`
                    <button class="calendar-event event-${color(e.type)}" data-event="${e.id}">
                      ${DB.esc(e.time||"")} ${DB.esc(e.title)}
                    </button>
                  `).join("")}
                  ${items.length>3?`<span class="more-events">+${items.length-3}개 더보기</span>`:""}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </section>

      <section class="card">
        <div class="section-heading">
          <h2>${selected} 일정</h2>
          <button class="btn secondary small" id="add-selected-event">+ 일정 추가</button>
        </div>
        <div id="selected-events">${eventList(events.filter(e=>e.date===selected))}</div>
      </section>
    `;
  }

  function localDate(d) {
    return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
  }

  function color(type) {
    return types.find(t=>t[0]===type)?.[1]||"gray";
  }

  function eventList(items) {
    if(!items.length)return '<div class="empty">등록된 일정이 없습니다.</div>';

    return items.sort((a,b)=>(a.time||"").localeCompare(b.time||"")).map(e=>`
      <div class="calendar-list-item">
        <i class="event-dot dot-${color(e.type)}"></i>
        <div class="event-info">
          <strong>${DB.esc(e.title)}</strong>
          <p>${DB.esc(e.type)} · ${DB.esc(e.description||"")}</p>
        </div>
        <strong>${DB.esc(e.time||"시간 미정")}</strong>
        <button class="btn secondary small" data-event="${e.id}">수정</button>
        <button class="btn danger small" data-delete-event="${e.id}">삭제</button>
      </div>
    `).join("");
  }

  function form(e={}) {
    DB.modal(`
      <span class="tag">SCHEDULE MANAGEMENT</span>
      <h2>${e.id?"일정 수정":"채용 일정 등록"}</h2>
      <form id="calendar-form">
        <label class="field"><span>일정명</span><input name="title" required value="${DB.esc(e.title||"")}"></label>
        <div class="form-grid">
          <label class="field"><span>날짜</span><input type="date" name="date" required value="${DB.esc(e.date||selected)}"></label>
          <label class="field"><span>시간</span><input type="time" name="time" value="${DB.esc(e.time||"")}"></label>
          <label class="field"><span>일정 유형</span>
            <select name="type">${types.map(([t])=>`<option ${e.type===t?"selected":""}>${t}</option>`).join("")}</select>
          </label>
          <label class="field"><span>담당자</span><input name="manager" value="${DB.esc(e.manager||"")}"></label>
        </div>
        <label class="field"><span>상세 내용</span><textarea name="description" rows="3">${DB.esc(e.description||"")}</textarea></label>
        <div class="form-actions"><button class="btn" type="submit">일정 저장</button></div>
      </form>
    `);

    document.getElementById("calendar-form").onsubmit=ev=>{
      ev.preventDefault();
      const fd=new FormData(ev.target);
      const list=DB.get("calendar");
      const item={
        ...e,id:e.id||DB.uid(),
        title:fd.get("title"),date:fd.get("date"),
        time:fd.get("time"),type:fd.get("type"),
        manager:fd.get("manager"),description:fd.get("description")
      };
      const i=list.findIndex(x=>x.id===item.id);
      if(i>=0)list[i]=item;else list.push(item);
      DB.set("calendar",list);
      selected=item.date;
      current=new Date(item.date+"T12:00:00");
      DB.close();
      App.render();
    };
  }

  function bind() {
    document.getElementById("cal-prev")?.addEventListener("click",()=>{
      current.setMonth(current.getMonth()-1);App.render();
    });
    document.getElementById("cal-next")?.addEventListener("click",()=>{
      current.setMonth(current.getMonth()+1);App.render();
    });
    document.getElementById("cal-today")?.addEventListener("click",()=>{
      current=new Date();selected=DB.today();App.render();
    });

    document.querySelectorAll("[data-select-date]").forEach(b=>{
      b.onclick=()=>{selected=b.dataset.selectDate;App.render();};
    });
    document.querySelectorAll(".calendar-day[data-date]").forEach(b=>{
      b.onclick=e=>{
        if(e.target.closest("[data-event]"))return;
        selected=b.dataset.date;App.render();
      };
    });

    document.getElementById("add-event")?.addEventListener("click",()=>form());
    document.getElementById("add-selected-event")?.addEventListener("click",()=>form());

    document.querySelectorAll("[data-event]").forEach(b=>{
      b.onclick=e=>{
        e.stopPropagation();
        const item=DB.get("calendar").find(x=>x.id===b.dataset.event);
        if(item)form(item);
      };
    });

    document.querySelectorAll("[data-delete-event]").forEach(b=>{
      b.onclick=()=>{
        if(!DB.confirmDelete("일정을 삭제할까요?"))return;
        DB.set("calendar",DB.get("calendar").filter(x=>x.id!==b.dataset.deleteEvent));
        App.render();
      };
    });
  }

  return {page,bind,form};
})();
