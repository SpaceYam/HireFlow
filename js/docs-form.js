
"use strict";

window.DocsForm=(()=>{
  function fields(doc) {
    return Object.entries(doc.sections).flatMap(([section,names])=>
      names.map(name=>({section,name}))
    );
  }

  function createHTML(doc,values) {
    return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>${DB.esc(doc.title)}</title>
<style>
body{font-family:Arial,sans-serif;padding:40px;color:#26334a}
h1{border-bottom:3px solid #4779e8;padding-bottom:15px}
table{width:100%;border-collapse:collapse;margin-top:25px}
th,td{border:1px solid #ddd;padding:12px;text-align:left;white-space:pre-wrap}
th{width:25%;background:#f1f4fa}
</style>
</head>
<body>
<h1>${DB.esc(doc.title)}</h1>
<p>HIREFLOW HR DOCUMENT</p>
<table>${values.map(v=>`<tr><th>${DB.esc(v.name)}</th><td>${DB.esc(v.value||"-")}</td></tr>`).join("")}</table>
</body></html>`;
  }

  return {fields,createHTML};
})();
