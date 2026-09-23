const DB_KEY = "utcd_db_v1";

const defaultDB = {
  user:null,
  savedVerses:[],
  notes:[],
  reflections:[],
  activities:[]
};

function getDB(){
  try{
    return {
      ...defaultDB,
      ...JSON.parse(localStorage.getItem(DB_KEY)||"{}")
    };
  }catch(e){
    return {...defaultDB};
  }
}

function setDB(db){
  localStorage.setItem(DB_KEY,JSON.stringify(db));
}

function toast(msg){
  const el=document.createElement("div");
  el.className="toast";
  el.textContent=msg;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),2600);
}

function today(){
  return new Date().toLocaleDateString("pt-BR",{
    day:"2-digit",
    month:"2-digit",
    year:"numeric"
  });
}

function addActivity(text,icon="✦"){
  const db=getDB();
  db.activities.unshift({
    text,
    icon,
    date:new Date().toISOString()
  });
  db.activities=db.activities.slice(0,30);
  setDB(db);
}

function currentUser(){
  return getDB().user;
}

document.querySelector(".menu-toggle")?.addEventListener(
  "click",
  ()=>document.querySelector(".nav")?.classList.toggle("open")
);
