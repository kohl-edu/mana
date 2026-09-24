const db=getDB();
const u=db.user;

if(!u){
  document.getElementById("userName").textContent="Visitante";
  document.getElementById("userSub").textContent="Você pode entrar para guardar seus registros.";
  document.getElementById("logoutBtn").textContent="Entrar";

  document.getElementById("logoutBtn").onclick=()=>{
    location.href="login.html";
  };
}else{
  document.getElementById("userName").textContent=u.name;
  document.getElementById("userSub").textContent=u.email;
  document.getElementById("avatar").textContent=u.name.charAt(0).toUpperCase();

  document.getElementById("logoutBtn").onclick=()=>{
    const db=getDB();

    db.user=null;

    setDB(db);

    location.reload();
  };
}

document.getElementById("statVerses").textContent=db.savedVerses.length;
document.getElementById("statNotes").textContent=db.notes.length;
document.getElementById("statReflections").textContent=db.reflections.length;

const dates=new Set([
  ...db.notes,
  ...db.reflections,
  ...db.activities
].map(x=>new Date(x.date).toLocaleDateString("pt-BR")));

document.getElementById("statDays").textContent=dates.size;

const list=document.getElementById("activityList");

list.innerHTML=db.activities.length
  ? db.activities.slice(0,10).map(a=>`
      <div class="activity-item">
        <span>${a.icon}</span>
        <p>
          ${a.text}
          <small>
            ${new Date(a.date).toLocaleString("pt-BR",{
              day:"2-digit",
              month:"short",
              hour:"2-digit",
              minute:"2-digit"
            })}
          </small>
        </p>
      </div>
    `).join("")
  : '<p style="color:var(--muted)">Ainda não há atividades. Explore o site e seu espaço começará a ganhar vida.</p>';
