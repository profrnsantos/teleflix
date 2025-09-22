// app.js — TELEFLIX (player + biblioteca local por tema)
// Versão: cartões do vídeo são clicáveis (sem botão de play)

//////////////////////////////
// 1) Dados iniciais (SEED) //
//////////////////////////////
const SEED = {
  LOUVOR: [
    { titulo: "EU SOU TEU PAI", autor: "VALESCA MAYSSA", url: "https://www.youtube.com/watch?v=kNJPalON82E" },
    { titulo: "DEUS DE PROMESSAS", autor: "MINISTÉRIO APASCENTAR", url: "https://youtu.be/93XkdakMp00?si=-S0mta76Kc_GxWhd" },
    { titulo: "NINGUÉM EXPLICA DEUS", autor: "PRETO NO BRANCO", url: "https://youtu.be/LYsaKn8FRhc?si=R7yN3htfuafehfSw" }
  ],
  MENSAGENS: [
    { titulo: "O TEMPO É CURTO; FAÇA O MELHOR USO DO SEU TEMPO", autor: "BILLY GRAHAM EM PORTUGUÊS", url: "https://youtu.be/fmsAqGy2pCM?si=u8aCy5Lwjoj80xAB" },
    { titulo: "QUEM É JESUS CRISTO?", autor: "BILLY GRAHAM EM PORTUGUÊS", url: "https://youtu.be/6ATJ6avomUg?si=4_qlxZGejDlxVyz5" }
  ],
  INFANTIL: [
    { titulo: "SOY UNA TAZA", autor: "CANTA JUEGO", url: "https://youtu.be/cgEnBkmcpuQ?si=paA3pkAIp3lgAmjQ" },
    { titulo: "PEDRO, TIAGO, JOÃO NO BARQUINHO", autor: "3 PALAVRINHAS", url: "https://youtu.be/Tdwy3BZe61s?si=As38T49IC695wKE0" }
  ],
  AULAS: [
    { titulo: "INTRODUÇÃO A JAVASCRIPT", autor: "TIGER CODES", url: "https://youtu.be/WRlfwBof66s?si=0o80ULtCNqjj-lU2" },
    { titulo: "HTML E CSS BÁSICO EM 5 MINUTOS", autor: "TIGER CODES", url: "https://www.youtube.com/watch?v=5Hn58p-hYC0" }
  ]
};

//////////////////////////
// 2) Seletores globais //
//////////////////////////
const LS_KEY    = "teleflixLibrary:v1";

const listEl    = document.getElementById("lista");
const temaSel   = document.getElementById("temaSelect");
const q         = document.getElementById("q");
const clearBtn  = document.getElementById("clearSearch");

const addBtn    = document.getElementById("btnAdd");
const fTitulo   = document.getElementById("fTitulo");
const fAutor    = document.getElementById("fAutor");
const fUrl      = document.getElementById("fUrl");
const fTema     = document.getElementById("fTema");

const iframeEl  = document.querySelector(".video-frame");
const nowTitle  = document.getElementById("nowTitle");
const nowAuthor = document.getElementById("nowAuthor");
const openYT    = document.getElementById("openYT");
const shuffle   = document.getElementById("shuffleBtn");
const countChip = document.getElementById("countChip");

//////////////////////////////////
// 3) Persistência (localStorage)
//////////////////////////////////
function deepClone(obj){ return JSON.parse(JSON.stringify(obj)); }

function loadLibrary() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      const seed = deepClone(SEED);
      saveLibrary(seed);
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      const seed = deepClone(SEED);
      saveLibrary(seed);
      return seed;
    }
    // garante chaves dos temas
    for (const k of Object.keys(SEED)) {
      if (!Array.isArray(parsed[k])) parsed[k] = [];
    }
    return parsed;
  } catch {
    const seed = deepClone(SEED);
    saveLibrary(seed);
    return seed;
  }
}

function saveLibrary(lib) {
  localStorage.setItem(LS_KEY, JSON.stringify(lib));
  updateCount(lib);
}

function updateCount(lib) {
  const total = Object.values(lib).reduce((acc, arr) => acc + arr.length, 0);
  if (countChip) countChip.textContent = `${total} vídeo${total !== 1 ? "s" : ""}`;
}

let LIB = loadLibrary();
updateCount(LIB);

/////////////////////////////
// 4) Util: montar embed YT
/////////////////////////////
function toEmbed(url) {
  try {
    const u = new URL(url);
    // youtu.be/VIDEOID?...  (curto)
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "").trim();
      if (id) {
        return {
          embed: `https://www.youtube.com/embed/${id}`,
          watch: `https://www.youtube.com/watch?v=${id}`
        };
      }
    }
    // youtube.com/watch?v=VIDEOID
    const id = u.searchParams.get("v");
    if (id) {
      return {
        embed: `https://www.youtube.com/embed/${id}`,
        watch: `https://www.youtube.com/watch?v=${id}`
      };
    }
  } catch {}
  // fallback: devolve a URL original
  return { embed: url, watch: url };
}

/////////////////////
// 5) Renderização //
/////////////////////
function renderList() {
  const tema = temaSel.value;
  const term = (q.value || "").trim().toLowerCase();
  const items = (LIB[tema] || []).filter(v =>
    !term ||
    v.titulo.toLowerCase().includes(term) ||
    v.autor.toLowerCase().includes(term)
  );

  listEl.innerHTML = "";
  items.forEach((v, idx) => {
    const li = document.createElement("li");
    li.className = "item";

    // Área clicável (cartão do vídeo)
    const meta = document.createElement("div");
    meta.className = "meta";
    const tt = document.createElement("div");
    tt.className = "title";
    tt.textContent = v.titulo.toUpperCase();
    const au = document.createElement("div");
    au.className = "author";
    au.textContent = v.autor.toUpperCase();
    meta.append(tt, au);

    // Clique no cartão toca o vídeo
    meta.addEventListener("click", () => playVideo(v));

    // Ações (apenas excluir)
    const actions = document.createElement("div");
    actions.className = "actions";

    const delBtn = document.createElement("button");
    delBtn.className = "btn danger";
    delBtn.textContent = "🗑️";
    delBtn.title = "Remover";
    delBtn.addEventListener("click", (ev) => {
      ev.stopPropagation(); // não aciona o clique do cartão
      removeItem(tema, idx);
    });

    actions.append(delBtn);
    li.append(meta, actions);
    listEl.appendChild(li);
  });
}

////////////////////
// 6) Player logic //
////////////////////
function playVideo(v) {
  const { embed, watch } = toEmbed(v.url);
  iframeEl.src = embed;
  nowTitle.textContent = v.titulo.toUpperCase();
  nowAuthor.textContent = v.autor.toUpperCase();
  openYT.href = watch;
}

function shufflePlay() {
  const arr = LIB[temaSel.value] || [];
  if (!arr.length) return;
  const i = Math.floor(Math.random() * arr.length);
  playVideo(arr[i]);
}

///////////////////////////
// 7) CRUD na biblioteca //
///////////////////////////
function removeItem(tema, idx) {
  if (!confirm("Remover este vídeo do tema?")) return;
  LIB[tema].splice(idx, 1);
  saveLibrary(LIB);
  renderList();
}

function addItem() {
  const titulo = (fTitulo.value || "").trim();
  const autor  = (fAutor.value  || "").trim();
  const url    = (fUrl.value    || "").trim();
  const tema   = fTema.value;

  if (!titulo || !autor || !url) {
    alert("Preencha Título, Autor e URL.");
    return;
  }

  const parsed = toEmbed(url);
  if (!/^https:\/\/www\.youtube\.com\/embed\//.test(parsed.embed)) {
    alert("Informe uma URL válida do YouTube (youtu.be/ID ou youtube.com/watch?v=ID).");
    return;
  }

  LIB[tema] = LIB[tema] || [];
  LIB[tema].unshift({ titulo, autor, url });
  saveLibrary(LIB);

  fTitulo.value = "";
  fAutor.value  = "";
  fUrl.value    = "";
  fTema.value   = tema;

  if (temaSel.value !== tema) temaSel.value = tema;
  renderList();
}

/////////////////
// 8) Eventos  //
/////////////////
if (addBtn)   addBtn.addEventListener("click", addItem);
if (q)        q.addEventListener("input", renderList);
if (clearBtn) clearBtn.addEventListener("click", () => { q.value = ""; renderList(); });
if (temaSel)  temaSel.addEventListener("change", renderList);
if (shuffle)  shuffle.addEventListener("click", shufflePlay);

/////////////////////////
// 9) Inicialização    //
/////////////////////////
renderList();
const first = (LIB[temaSel.value] || [])[0];
if (first) playVideo(first);
