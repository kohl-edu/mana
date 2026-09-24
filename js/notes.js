document.getElementById("noteDate").textContent=today();

function renderNotes(){
  const db=getDB();
  const list=document.getElementById("notesList");

  document.getElementById("noteCount").textContent=db.notes.length;

  if(!db.notes.length){
    list.innerHTML='<div class="side-card"><p>Você ainda não tem anotações. Comece escrevendo algo que deseja guardar.</p></div>';
    return;
  }

  list.innerHTML=db.notes.slice().reverse().map((n,i)=>`
    <article class="note-item">
      <div class="notes-list-head">
        <div>
          <h3>${escapeHTML(n.title||"Sem título")}</h3>
          <time>${new Date(n.date).toLocaleDateString("pt-BR")}</time>
        </div>
        <button class="delete-note" data-id="${n.id}">Excluir</button>
      </div>
      <p>${escapeHTML(n.body)}</p>
    </article>
  `).join("");

  document.querySelectorAll(".delete-note").forEach(b=>b.onclick=()=>{
    const db=getDB();

    db.notes=db.notes.filter(n=>n.id!==b.dataset.id);

    setDB(db);

    renderNotes();

    toast("Anotação excluída.");
  });
}

function escapeHTML(s){
  return String(s).replace(
    /[&<>"']/g,
    c=>({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    }[c])
  );
}

document.getElementById("saveNote").onclick=()=>{
  const title=document.getElementById("noteTitle").value.trim();
  const body=document.getElementById("noteBody").value.trim();

  if(!body)
    return toast("Escreva alguma coisa antes de guardar.");

  const db=getDB();

  db.notes.push({
    id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),
    title,
    body,
    date:new Date().toISOString()
  });

  setDB(db);

  addActivity("Você criou uma nova anotação","✎");

  document.getElementById("noteTitle").value="";
  document.getElementById("noteBody").value="";

  renderNotes();

  toast("Anotação guardada ✎");
};

renderNotes();
