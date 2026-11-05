
"use strict";

/* =========================================
   HIREFLOW - CORE CONFIGURATION
========================================= */

window.HF = {
  steps: [
    {
      id: "planning",
      name: "채용 기획",
      description: "인력 수요 분석 및 채용 계획 수립"
    },
    {
      id: "posting",
      name: "채용 공고",
      description: "직무기술서 작성 및 채용 채널 운영"
    },
    {
      id: "screening",
      name: "서류 전형",
      description: "지원자 서류 검토 및 평가"
    },
    {
      id: "interview",
      name: "면접 전형",
      description: "구조화 면접 및 직무 역량 평가"
    },
    {
      id: "assessment",
      name: "역량 평가",
      description: "직무 과제 및 실무 역량 검증"
    },
    {
      id: "decision",
      name: "최종 합격",
      description: "최종 평가 및 입사 조건 협의"
    },
    {
      id: "onboarding",
      name: "온보딩",
      description: "신규 입사자 적응 및 정착 지원"
    }
  ],

  channels: [
    {
      name: "사람인",
      category: "종합 채용 플랫폼",
      url: "https://www.saramin.co.kr"
    },
    {
      name: "잡코리아",
      category: "종합 채용 플랫폼",
      url: "https://www.jobkorea.co.kr"
    },
    {
      name: "원티드",
      category: "IT 및 전문직 채용",
      url: "https://www.wanted.co.kr"
    },
    {
      name: "LinkedIn",
      category: "글로벌 인재 채용",
      url: "https://www.linkedin.com"
    },
    {
      name: "로켓펀치",
      category: "스타트업 및 IT 채용",
      url: "https://www.rocketpunch.com"
    }
  ]
};


/* =========================================
   DATABASE
========================================= */

window.DB = (() => {

  const PREFIX = "hireflow_";

   const DEFAULT_DATA = {
     applicants: [],
     calendar: [],
     onboarding: [],
     notes: [],
   
     // 업무 양식 저장
     taskForms: {},
   
     // 업무 진행 상태 저장
     taskProgress: {},
   
     tasks: {},
   
     kpi: {
       target: 10,
       applicants: 0,
       interviews: 0,
       hired: 0,
       budget: 0,
       actualCost: 0
     }
   };

  let initialized = false;


  /* -----------------------------------------
     STORAGE
  ----------------------------------------- */

  function get(key) {
    try {
      const value = localStorage.getItem(PREFIX + key);

      if (value === null) {
        return structuredClone(
          DEFAULT_DATA[key] ?? []
        );
      }

      return JSON.parse(value);

    } catch (error) {
      console.error("DB GET ERROR:", key, error);

      return structuredClone(
        DEFAULT_DATA[key] ?? []
      );
    }
  }


  function set(key, value) {
    try {
      localStorage.setItem(
        PREFIX + key,
        JSON.stringify(value)
      );

      return true;

    } catch (error) {
      console.error("DB SAVE ERROR:", error);

      alert(
        "데이터 저장에 실패했습니다. 저장 공간을 확인해주세요."
      );

      return false;
    }
  }


  function remove(key) {
    localStorage.removeItem(PREFIX + key);
  }


  function has(key) {
    return localStorage.getItem(PREFIX + key) !== null;
  }


  /* -----------------------------------------
     INITIALIZE
  ----------------------------------------- */

  function initialize() {

    if (initialized) return;

    Object.keys(DEFAULT_DATA).forEach(key => {

      if (!has(key)) {
        set(
          key,
          structuredClone(DEFAULT_DATA[key])
        );
      }

    });

    initialized = true;

    console.log("HIREFLOW DATABASE INITIALIZED");
  }


  /* -----------------------------------------
     UTILITIES
  ----------------------------------------- */

  function esc(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function today() {

    const date = new Date();

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }


  function uid() {

    return (
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 9)
    );
  }


  /* -----------------------------------------
     MODAL
  ----------------------------------------- */

  function modal(content) {

    const modalElement =
      document.getElementById("modal");

    const contentElement =
      document.getElementById("modal-content");

    if (!modalElement || !contentElement) {
      console.error("MODAL ELEMENT NOT FOUND");
      return;
    }

    contentElement.innerHTML = content;

    modalElement.classList.remove("hidden");

    document.body.classList.add("modal-open");
  }


  function close() {

    const modalElement =
      document.getElementById("modal");

    const contentElement =
      document.getElementById("modal-content");

    if (modalElement) {
      modalElement.classList.add("hidden");
    }

    if (contentElement) {
      contentElement.innerHTML = "";
    }

    document.body.classList.remove("modal-open");
  }


  /* -----------------------------------------
     DOWNLOAD
  ----------------------------------------- */

  function download(filename, content) {

    const blob = new Blob(
      [content],
      {
        type: "text/html;charset=utf-8"
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }


  /* -----------------------------------------
     JSON BACKUP
  ----------------------------------------- */

  function exportData() {

    const data = {};

    Object.keys(DEFAULT_DATA).forEach(key => {
      data[key] = get(key);
    });

    data.exportedAt = new Date().toISOString();
    data.application = "HIREFLOW";

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      {
        type: "application/json"
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `hireflow-backup-${today()}.json`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }


  async function importData(file) {

    if (!file) return false;

    try {

      const text = await file.text();

      const data = JSON.parse(text);

      if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data) ||
        data.application !== "HIREFLOW"
      ) {
        throw new Error("올바른 HIREFLOW 백업 파일이 아닙니다.");
      }

      const keys = Object.keys(DEFAULT_DATA);

      keys.forEach(key => {

        if (
          Object.prototype.hasOwnProperty.call(data, key)
        ) {
          set(key, data[key]);
        }

      });

      alert("데이터 복원이 완료되었습니다.");

      location.reload();

      return true;

    } catch (error) {

      console.error(error);

      alert(
        "데이터 복원에 실패했습니다.\n" +
        error.message
      );

      return false;
    }
  }


  /* -----------------------------------------
     STORAGE STATUS
  ----------------------------------------- */

  function storageStatus() {

    const keys = Object.keys(DEFAULT_DATA);

    const result = {};

    let total = 0;

    keys.forEach(key => {

      const value = get(key);

      const size = new Blob([
        JSON.stringify(value)
      ]).size;

      result[key] = {
        count: Array.isArray(value)
          ? value.length
          : Object.keys(value || {}).length,

        size
      };

      total += size;

    });

    return {
      items: result,
      totalBytes: total,
      totalKB: (total / 1024).toFixed(2)
    };
  }


  /* -----------------------------------------
     CLEAR DATA
  ----------------------------------------- */

  function reset() {

    const confirmed = confirm(
      "정말 모든 HIREFLOW 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다."
    );

    if (!confirmed) return false;

    Object.keys(DEFAULT_DATA).forEach(key => {
      remove(key);
    });

    initialize();

    location.reload();

    return true;
  }


  /* -----------------------------------------
     RETURN
  ----------------------------------------- */

  return {

    initialize,

    get,
    set,
    remove,
    has,

    esc,
    today,
    uid,

    modal,
    close,

    download,

    exportData,
    importData,
    storageStatus,

    reset

  };

})();


/* =========================================
   GLOBAL INITIALIZATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  DB.initialize();

  console.log("HIREFLOW CORE READY");

});
