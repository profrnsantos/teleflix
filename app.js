// ======= Dados iniciais =======
const {embed, watch} = toEmbed(v.url);
iframeEl.src = embed;
nowTitle.textContent = v.titulo.toUpperCase();
nowAuthor.textContent = v.autor.toUpperCase();
openYT.href = watch;
}


function removeItem(tema, idx){
if(!confirm('Remover este vídeo do tema?')) return;
LIB[tema].splice(idx,1);
saveLibrary(LIB); renderList();
}


function addItem(){
const titulo = fTitulo.value.trim();
const autor = fAutor.value.trim();
const url = fUrl.value.trim();
const tema = fTema.value;


if(!titulo || !autor || !url){
alert('Preencha Título, Autor e URL.');
return;
}
// valida url minimamente
const parsed = toEmbed(url);
if(!/^https:\/\/www\.youtube\.com\/embed\//.test(parsed.embed)){
alert('Informe uma URL válida do YouTube (youtu.be/ID ou youtube.com/watch?v=ID).');
return;
}


LIB[tema] = LIB[tema] || [];
LIB[tema].unshift({titulo, autor, url});
saveLibrary(LIB);


fTitulo.value = fAutor.value = fUrl.value = '';
fTema.value = tema;
if(temaSelect.value === tema) renderList();
else { temaSelect.value = tema; renderList(); }
}


function shufflePlay(){
const tema = temaSelect.value;
const arr = LIB[tema]||[];
if(!arr.length) return;
const i = Math.floor(Math.random()*arr.length);
playVideo(arr[i]);
}


// Eventos
document.getElementById('btnAdd').addEventListener('click', addItem);
q.addEventListener('input', renderList);
document.getElementById('clearSearch').addEventListener('click', ()=>{q.value=''; renderList();});
temaSelect.addEventListener('change', renderList);
document.getElementById('shuffleBtn').addEventListener('click', shufflePlay);


// Inicialização
updateCount(LIB);
renderList();
const first = (LIB[temaSelect.value]||[])[0];
if(first) playVideo(first);
