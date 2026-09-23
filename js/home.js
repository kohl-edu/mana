const homeVerses=[
["“O Senhor é o meu pastor; nada me faltará.”","Salmos 23:1"],
["“Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.”","Salmos 119:105"],
["“Entrega o teu caminho ao Senhor; confia nele, e ele o fará.”","Salmos 37:5"],
["“Tudo posso naquele que me fortalece.”","Filipenses 4:13"],
["“Não temas, porque eu sou contigo.”","Isaías 41:10"],
["“A minha graça te basta.”","2 Coríntios 12:9"],
["“Sede fortes e corajosos; não temais.”","Deuteronômio 31:6"]
];

let hi=1;

const hv=document.getElementById("homeVerse");
const hr=document.getElementById("homeRef");

document.getElementById("verseDate").textContent=today();

document.getElementById("newHomeVerse").onclick=()=>{
  hi=(hi+1)%homeVerses.length;
  hv.textContent=homeVerses[hi][0];
  hr.textContent=homeVerses[hi][1];
};

document.getElementById("saveVerse").onclick=()=>{
  const db=getDB();
  const v={
    text:hv.textContent,
    ref:hr.textContent
  };

  if(!db.savedVerses.some(x=>x.ref===v.ref)){
    db.savedVerses.push(v);
    setDB(db);
    addActivity("Você salvou "+v.ref,"♡");
    toast("Versículo salvo no seu espaço 🤍");
  }else{
    toast("Esse versículo já está salvo.");
  }
};
