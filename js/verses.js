const verses=[
{
  text:"“Entrega o teu caminho ao Senhor; confia nele, e ele o fará.”",
  ref:"Salmos 37:5",
  topic:"esperança"
},
{
  text:"“Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus.”",
  ref:"Isaías 41:10",
  topic:"coragem"
},
{
  text:"“Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.”",
  ref:"Provérbios 3:5",
  topic:"sabedoria"
},
{
  text:"“O Senhor é o meu pastor; nada me faltará.”",
  ref:"Salmos 23:1",
  topic:"fé"
},
{
  text:"“Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.”",
  ref:"1 Pedro 5:7",
  topic:"ansiedade"
},
{
  text:"“A esperança não traz confusão, porquanto o amor de Deus está derramado em nossos corações.”",
  ref:"Romanos 5:5",
  topic:"esperança"
},
{
  text:"“Sede fortes e corajosos; não temais.”",
  ref:"Deuteronômio 31:6",
  topic:"coragem"
},
{
  text:"“Em tudo dai graças, porque esta é a vontade de Deus.”",
  ref:"1 Tessalonicenses 5:18",
  topic:"gratidão"
},
{
  text:"“Ensina-nos a contar os nossos dias, para que alcancemos corações sábios.”",
  ref:"Salmos 90:12",
  topic:"sabedoria"
},
{
  text:"“Acima de tudo, porém, revistam-se do amor, que é o elo perfeito.”",
  ref:"Colossenses 3:14",
  topic:"amor"
},
{
  text:"“Tudo posso naquele que me fortalece.”",
  ref:"Filipenses 4:13",
  topic:"fé"
},
{
  text:"“A minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza.”",
  ref:"2 Coríntios 12:9",
  topic:"coragem"
}
];

let filtered=[...verses];
let idx=0;

const bigVerse=document.getElementById("bigVerse");
const bigRef=document.getElementById("bigRef");
const bigTopic=document.getElementById("verseTopic");
const bigCount=document.getElementById("bigCount");

function showVerse(i){
  idx=(i+filtered.length)%filtered.length;

  const v=filtered[idx];

  bigVerse.textContent=v.text;
  bigRef.textContent=v.ref;
  bigTopic.textContent="• "+v.topic;
  bigCount.textContent=(idx+1)+" de "+filtered.length;
}

function renderGrid(){
  document.getElementById("verseGrid").innerHTML=
    filtered.map((v,i)=>`
      <article class="verse-tile" data-i="${i}">
        <small>${v.topic.toUpperCase()}</small>
        <p>${v.text}</p>
        <strong>${v.ref}</strong>
      </article>
    `).join("");

  document.querySelectorAll(".verse-tile").forEach(
    e=>e.onclick=()=>showVerse(+e.dataset.i)
  );
}

document.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{
  document.querySelector(".chip.active").classList.remove("active");

  c.classList.add("active");

  const t=c.dataset.topic;

  filtered=t==="todos"
    ? [...verses]
    : verses.filter(v=>v.topic===t);

  idx=0;

  showVerse(0);
  renderGrid();
});

document.getElementById("randomVerse").onclick=()=>{
  showVerse(Math.floor(Math.random()*filtered.length));
};

document.getElementById("saveBig").onclick=()=>{
  const db=getDB();
  const v=filtered[idx];

  if(!db.savedVerses.some(x=>x.ref===v.ref)){
    db.savedVerses.push({
      text:v.text,
      ref:v.ref
    });

    setDB(db);

    addActivity("Você salvou "+v.ref,"♡");

    toast("Salvo no seu espaço 🤍");
  }else{
    toast("Esse versículo já está salvo.");
  }
};

showVerse(0);
renderGrid();
