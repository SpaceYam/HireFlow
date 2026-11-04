
"use strict";

window.Notes=(()=>{
  let editingId=null;
  let mode="text";
  let canvas=null;
  let ctx=null;
  let drawing=false;
  let last=null;

  function page() {
    const notes=DB.get("notes").sort((a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||""));

    return `
      <section class="page-header">
        <span class="tag">PERSONAL WORKSPACE</span>
        <h1>개인 메모</h1>
        <p>업무 아이디어, 회의 내용 및 손그림을 자유롭게 기록하세요.</p>
      </section>
      <div class="notes-toolbar">
        <input id="note-search" placeholder="메모 검색하기">
        <button class="btn" id="new-note">+ 새 메모 작성</button>
      </div>
      <div class="notes-grid" id="notes-grid">${cards(notes)}</div>
    `;
  }

  function cards(notes) {
    if(!notes.length)return '<div class="card empty">아직 저장된 메모가 없습니다.</div>';
    return notes.map(n=>`
      <article class="note-card">
        <div class="note-card-top">
          <span class="tag">${n.type==="drawing"?"DRAWING":"TEXT NOTE"}</span>
          <span>${new Date(n.updatedAt).toLocaleDateString("ko-KR")}</span>
        </div>
        <h3>${DB.esc(n.title)}</h3>
        <div class="note-preview">${n.type==="drawing"?"손그림 메모":DB.esc((n.content||"").replace(/<[^>]*>/g," ").slice(0,130))}</div>
        <div class="note-card-bottom">
          <button class="btn secondary small" data-edit-note="${n.id}">열기</button>
          <button class="btn danger small" data-delete-note="${n.id}">삭제</button>
        </div>
      </article>
    `).join("");
  }

  function editor(note={}) {
    editingId=note.id||null;
    mode=note.type||"text";

    DB.modal(`
      <div class="note-editor">
        <div class="note-editor-header">
          <div><span class="tag">PERSONAL NOTES</span><h2>메모 작성</h2></div>
          <span id="note-status" class="save-status">편집 중</span>
        </div>

        <input class="note-title-input" id="note-title" placeholder="메모 제목" value="${DB.esc(note.title||"")}">

        <div class="note-mode-tabs">
          <button class="note-mode ${mode==="text"?"active":""}" data-mode="text">✎ 텍스트 작성</button>
          <button class="note-mode ${mode==="drawing"?"active":""}" data-mode="drawing">✏ 직접 그리기</button>
        </div>

        <div id="text-workspace" class="${mode==="text"?"":"hidden"}">
          <div class="wysiwyg-toolbar">
            <button data-command="bold"><b>B</b></button>
            <button data-command="italic"><i>I</i></button>
            <button data-command="underline"><u>U</u></button>
            <button data-command="insertUnorderedList">• 목록</button>
            <button data-command="insertOrderedList">1. 목록</button>
            <button data-block="h2">제목</button>
            <button data-block="blockquote">인용</button>
            <label class="color-tool">A<input type="color" id="font-color" value="#202938"></label>
            <label class="color-tool">▰<input type="color" id="highlight-color" value="#fff0a6"></label>
          </div>
          <div class="wysiwyg-editor" id="note-editor-content" contenteditable="true" data-placeholder="여기에 메모를 작성하세요...">${note.content||""}</div>
        </div>

        <div id="drawing-workspace" class="${mode==="drawing"?"":"hidden"}">
          <div class="drawing-toolbar">
            <label>펜 색상 <input type="color" id="pen-color" value="#4779e8"></label>
            <label>굵기 <input type="range" id="pen-size" min="1" max="20" value="4"></label>
            <button class="btn secondary small" id="eraser">지우개</button>
            <button class="btn secondary small" id="clear-canvas">전체 지우기</button>
          </div>
          <div class="drawing-board"><canvas id="note-canvas" width="1200" height="650"></canvas></div>
        </div>

        <div class="note-editor-footer">
          <span>저장 버튼을 눌러 메모를 보관하세요.</span>
          <div><button class="btn secondary" id="cancel-note">취소</button><button class="btn" id="save-note">메모 저장</button></div>
        </div>
      </div>
    `);

    setup(note);
  }

  function setup(note) {
    const editor=document.getElementById("note-editor-content");

    document.querySelectorAll("[data-mode]").forEach(b=>{
      b.onclick=()=>{
        mode=b.dataset.mode;
        document.querySelectorAll("[data-mode]").forEach(x=>x.classList.toggle("active",x===b));
        document.getElementById("text-workspace").classList.toggle("hidden",mode!=="text");
        document.getElementById("drawing-workspace").classList.toggle("hidden",mode!=="drawing");
        if(mode==="drawing"&&!canvas)setupCanvas(note.drawing);
      };
    });

    document.querySelectorAll("[data-command]").forEach(b=>{
      b.onclick=()=>{
        editor.focus();
        document.execCommand(b.dataset.command,false,null);
      };
    });

    document.querySelectorAll("[data-block]").forEach(b=>{
      b.onclick=()=>{
        editor.focus();
        document.execCommand("formatBlock",false,b.dataset.block);
      };
    });

    document.getElementById("font-color").oninput=e=>{
      editor.focus();document.execCommand("foreColor",false,e.target.value);
    };
    document.getElementById("highlight-color").oninput=e=>{
      editor.focus();document.execCommand("hiliteColor",false,e.target.value);
    };

    document.getElementById("cancel-note").onclick=()=>DB.close();
    document.getElementById("save-note").onclick=save;

    if(mode==="drawing")setupCanvas(note.drawing);
  }

  function setupCanvas(data) {
    canvas=document.getElementById("note-canvas");
    if(!canvas)return;
    ctx=canvas.getContext("2d");
    ctx.lineCap="round";
    ctx.lineJoin="round";
    ctx.lineWidth=4;
    ctx.strokeStyle="#4779e8";

    if(data){
      const img=new Image();
      img.onload=()=>ctx.drawImage(img,0,0,canvas.width,canvas.height);
      img.src=data;
    }

    function point(e) {
      const r=canvas.getBoundingClientRect();
      return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};
    }

    canvas.onpointerdown=e=>{
      drawing=true;last=point(e);canvas.setPointerCapture(e.pointerId);
    };
    canvas.onpointermove=e=>{
      if(!drawing)return;
      const p=point(e);
      ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();
      last=p;
    };
    canvas.onpointerup=()=>{drawing=false;last=null;};
    canvas.onpointercancel=()=>drawing=false;

    document.getElementById("pen-color").oninput=e=>{
      ctx.globalCompositeOperation="source-over";ctx.strokeStyle=e.target.value;
    };
    document.getElementById("pen-size").oninput=e=>ctx.lineWidth=Number(e.target.value);
    document.getElementById("eraser").onclick=()=>ctx.globalCompositeOperation="destination-out";
    document.getElementById("clear-canvas").onclick=()=>{
      if(confirm("그림을 모두 지울까요?"))ctx.clearRect(0,0,canvas.width,canvas.height);
    };
  }

  function save() {
    const title=document.getElementById("note-title").value.trim();
    if(!title){alert("메모 제목을 입력하세요.");return;}

    const list=DB.get("notes");
    const old=list.find(n=>n.id===editingId);
    const item={
      id:editingId||DB.uid(),
      title,
      type:mode,
      content:mode==="text"?document.getElementById("note-editor-content").innerHTML:old?.content||"",
      drawing:canvas?canvas.toDataURL("image/png"):old?.drawing||null,
      updatedAt:new Date().toISOString()
    };

    const idx=list.findIndex(n=>n.id===item.id);
    if(idx>=0)list[idx]=item;else list.unshift(item);
    DB.set("notes",list);
    canvas=null;ctx=null;
    DB.close();App.render();
  }

  function bind() {
    document.getElementById("new-note")?.addEventListener("click",()=>editor());
    document.getElementById("note-search")?.addEventListener("input",e=>{
      const q=e.target.value.toLowerCase();
      const list=DB.get("notes").filter(n=>(n.title+" "+(n.content||"")).toLowerCase().includes(q));
      document.getElementById("notes-grid").innerHTML=cards(list);
      bindCards();
    });
    bindCards();
  }

  function bindCards() {
    document.querySelectorAll("[data-edit-note]").forEach(b=>{
      b.onclick=()=>editor(DB.get("notes").find(n=>n.id===b.dataset.editNote));
    });
    document.querySelectorAll("[data-delete-note]").forEach(b=>{
      b.onclick=()=>{
        if(!DB.confirmDelete("메모를 삭제할까요?"))return;
        DB.set("notes",DB.get("notes").filter(n=>n.id!==b.dataset.deleteNote));
        App.render();
      };
    });
  }

  return {page,bind,editor};
})();
