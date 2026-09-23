const form=document.getElementById("loginForm");

form.onsubmit=e=>{
  e.preventDefault();

  const name=document.getElementById("loginName").value.trim();
  const email=document.getElementById("loginEmail").value.trim();

  const db=getDB();

  db.user={
    name,
    email,
    createdAt:db.user?.createdAt||new Date().toISOString()
  };

  setDB(db);

  addActivity("Você entrou no seu espaço","◉");

  toast("Bem-vindo, "+name+"!");

  setTimeout(()=>location.href="progresso.html",500);
};
