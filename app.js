// app.js — TELEFLIX (player + biblioteca local por tema)

// ======= Dados iniciais (seed) =======
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

// ======= Seletores =======
const LS_KEY   = 'teleflixLibrary:v1';
const listEl   = document.getElementById('lista');
const temaSel  = document.getElementById('temaSelect');
const q        = document.getElementById('q');
const clearBtn = document.getElementById('clearSearch');
const addBtn   = document.getElementById('btnAdd');
const fTitulo  = document.getElementById('fTitulo');
const fAutor   = document.getElementById('fAutor');
const fUrl     = document.getElementById('fUrl');
const fTema    = document.getElementById('fTema');

const iframeEl = document.querySelector('.video-frame');
const nowTitle = document.getElementById('nowTitle');
const nowAuthor= document.getElementById('nowAuthor');
const openYT   = document.getElementById('openYT');
const shuffle  = document.getElementById('shuffleBtn');
const countChip= document.getElementById('countChip');

// ======= Persistência =======
function loadLibrary() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      saveLibrary(SEED);
      return structuredClone(SEED);
    }
    const parsed = JSON.parse(raw);
    // Se por algum motivo estiver vazio/estranho, regrava seed
    if (!parsed || typeof parsed !== 'object') {
      saveLibrary(SEED);
      return structuredClone(SEED);
    }
    // Garante que todos os temas existam
    for (const k of Object.keys(SEED)) {
      if (!Array.isArray(parsed[k])) parsed[k] = [];
    }
    return parsed;
  } catch {
    saveLibrary(SEED);
    return structuredClone(SEED);
  }
}
function saveLibrary(lib) {
  localStorage.setItem(LS_KEY, JSON.stringify(lib));
  updateCount(lib);
}
function updateCount(lib) {
  const total = Object.values(lib).reduce((s, arr) => s + arr.length, 0);
  countChip.textContent = `${total} vídeo${total !== 1 ? 's' : ''}`;
}

let LIB = loadLibrary();
updateCount(LIB);

// ======= Util =======
function toEmbed(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.slice(1);
      return { embed: `https://www.youtube.com/embed/${id}`, watch: `https://www.youtube.com/watch?v=${id}` };
    }
    const id = u.searchParams.get('v');
    if (id) {
      return { embed: `https://www.youtube.com/embed/${id}`, watch: `https://www.youtube.com/watch?v=${id}` };
    }
  } catch {}
  return { embed: url, watch: url };
}

// ======= Render =======
function renderList() {
  const tema = temaSel.value;
  const term = q.value.trim().toLowerCase();
  const items = (LIB[tema] || []).filter(v =>
    !term ||
    v.titulo.toLowerCase().includes(term) ||
    v.autor.toLowerCase().includes(term)
  );

  listEl.innerHTML = '';
  items.forEach((v, idx) => {
    const li = document.createElement('li');
    li.className = 'item';

    const meta = document.createElement('div');
    meta.className = 'meta';
    const tt = document.createElement('div');
    tt.className = 'title';
    tt.textContent = v.titulo.toUpperCase();
    const au = document.createElement('div');
    au.className = 'author';
    au.textContent = v.autor.toUpperCase();
    meta.append(tt, au);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const playBtn = document.createElement('button');
    playBtn.className = 'btn flat';
    playBtn.textContent = '▶️ Tocar';
    playBtn.addEventListener('click', () => playVideo(v));

    const delBtn = document.createElement('button');
    delBtn.className = 'btn danger';
    delBtn.textContent = '🗑️';
    delBtn.title = 'Remover';
    delBtn.addEventListener('click', () => removeItem(tema, idx));

    actions.append(playBtn, delBtn);
    li.append(meta, actions);
    listEl.appendChild(li);
  });
}

function playVideo(v) {
  const { embed, watch } = toEmbed(v.url);
  iframeEl.src = embed;
  nowTitle.textContent = v.titulo.toUpperCase();
  nowAuthor.textContent = v.autor.toUpperCase();
  openYT.href = watch;
}

function removeItem(tema, idx) {
  if (!confirm('Remover este vídeo do tema?')) return;
  LIB[tema].splice(idx, 1);
  saveLibrary(LIB);
  renderList();
}

function addItem() {
  const titulo = (fTitulo.value || '').trim();
  const autor  = (fAutor.value  || '').trim();
  const url    = (fUrl.value    || '').trim();
  const tema   = fTema.value;

  if (!titulo || !autor || !url) {
    alert('Preencha Título, Autor e URL.');
    return;
  }

  const parsed = toEmbed(url);
  if (!/^https:\/\/www\.youtube\.com\/embed\//.test(parsed.embed)) {
    alert('Informe uma URL válida do YouTube (youtu.be/ID ou youtube.com/watch?v=ID).');
    return;
  }

  LIB[tema] = LIB[tema] || [];
  LIB[tema].unshift({ titulo, autor, url });
  saveLibrary(LIB);

  fTitulo.value = '';
  fAutor.value  = '';
  fUrl.value    = '';
  fTema.value   = tema;

  // Atualiza a lista do tema atual
  if (temaSel.value !== tema) {
    temaSel.value = tema;
  }
  renderList();
}

// ======= Eventos =======
addBtn.addEventListener('click', addItem);
q.addEventListener('input', renderList);
clearBtn.addEventListener('click', () => { q.value = ''; renderList(); });
temaSel.addEventListener('change', renderList);
shuffle.addEventListener('click', () => {
  const arr = LIB[temaSel.value] || [];
  if (!arr.length) return;
  const i = Math.floor(Math.random() * arr.length);
  playVideo(arr[i]);
});

// ======= Inicialização =======
renderList();
// Toca o primeiro do tema atual (se houver)
const first = (LIB[temaSel.value] || [])[0];
if (first) playVideo(first);
