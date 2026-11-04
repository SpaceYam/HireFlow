
"use strict";

window.Docs=(()=>{
  function catalog() {
    return `
      <section class="page-header">
        <span class="tag">HR DOCUMENT CENTER</span>
        <h1>HR 표준 문서 자료실</h1>
        <p>채용 업무에 필요한 표준 양식을 작성하고 다운로드하세요.</p>
      </section>

      <div class="document-grid">
        ${Object.entries(DOC_DATA).map(([id,doc])=>`
          <article class="document-card">
            <span class="tag">${DB.esc(doc.category)}</span>
            <h3>${DB.esc(doc.title)}</h3>
            <p>${DB.esc(doc.guide)}</p>
            <button class="btn" data-doc="${id}">양식 열기</button>
          </article>
        `).join("")}
      </div>

      <section class="card">
        <h2>채용 공고 게시 채널</h2>
        ${HF.channels.map(c=>`
          <div class="channel-row">
            <div><strong>${DB.esc(c.name)}</strong><p>${DB.esc(c.category)}</p></div>
            <a href="${DB.esc(c.url)}" target="_blank" rel="noopener">사이트 방문 →</a>
          </div>
        `).join("")}
      </section>
    `;
  }

  function open(id) {
    const doc=DOC_DATA[id];
    if(!doc)return;

    const fields=DocsForm.fields(doc);

    DB.modal(`
      <span class="tag">${DB.esc(doc.category)}</span>
      <h2>${DB.esc(doc.title)}</h2>
      <p class="muted">${DB.esc(doc.guide)}</p>
      <form id="document-form">
        ${Object.entries(doc.sections).map(([section,names])=>`
          <section class="form-section">
            <h3>${DB.esc(section)}</h3>
            <div class="form-grid">
              ${names.map(name=>{
                const i=fields.findIndex(f=>f.name===name);
                const date=/일$/.test(name);
                const number=/인원|점수|예산|연봉/.test(name);
                return `
                  <label class="field">
                    <span>${DB.esc(name)}</span>
                    ${date?`<input type="date" name="f${i}">`
                      :number?`<input type="number" min="0" name="f${i}">`
                      :`<textarea name="f${i}" rows="2"></textarea>`}
                  </label>
                `;
              }).join("")}
            </div>
          </section>
        `).join("")}
        <button class="btn" type="submit">문서 미리보기</button>
      </form>
    `);

    document.getElementById("document-form").onsubmit=e=>{
      e.preventDefault();
      const fd=new FormData(e.target);
      const values=fields.map((f,i)=>({name:f.name,value:fd.get("f"+i)}));
      const html=DocsForm.createHTML(doc,values);

      DB.modal(`
        <h2>문서 미리보기</h2>
        <div class="preview-frame">
          <iframe title="문서 미리보기" sandbox srcdoc="${DB.esc(html).replace(/"/g,"&quot;")}"></iframe>
        </div>
        <button class="btn" id="download-document">HTML 다운로드</button>
      `);

      document.getElementById("download-document").onclick=()=>{
        DB.download(doc.title+".html",html);
      };
    };
  }

  return {catalog,open};
})();
