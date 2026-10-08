async function renderProgress(){
  await window.UTCDReady;

  const cloudMode = window.UTCDCloud?.isConfigured();
  const signedIn = window.UTCDCloud?.isSignedIn();

  const db=getDB();
  const u=cloudMode && !signedIn ? null : db.user;

  if(!u){
    document.getElementById("userName").textContent="Visitante";
    document.getElementById("userSub").textContent=cloudMode
      ? "Entre para acessar seus registros sincronizados."
      : "Você pode entrar para guardar seus registros.";
    document.getElementById("logoutBtn").textContent="Entrar";
    document.getElementById("logoutBtn").onclick=()=>{
      location.href="login.html";
    };
  }else{
    document.getElementById("userName").textContent=u.name;
    document.getElementById("userSub").textContent=u.email;
    document.getElementById("avatar").textContent=u.name.charAt(0).toUpperCase();

    document.getElementById("logoutBtn").onclick=async()=>{
      try{
        if(cloudMode) await UTCDCloud.signOut();
      }catch(err){
        console.error(err);
      }

      const local=getDB();
      local.user=null;
      setDB(local);
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
}

renderProgress();
