const reflections=[
{
  title:"O que Deus está tentando me ensinar neste momento?",
  text:"Leia o versículo abaixo devagar. Pense no que ele revela sobre Deus e sobre a forma como você está vivendo hoje.",
  verse:"“Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.”",
  ref:"Provérbios 3:5"
},
{
  title:"Existe algo que eu preciso entregar a Deus?",
  text:"Nem tudo precisa ser resolvido hoje. Pense em uma preocupação que você poderia colocar diante de Deus em oração.",
  verse:"“Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.”",
  ref:"1 Pedro 5:7"
},
{
  title:"Onde preciso exercer mais fé?",
  text:"Fé também aparece nas pequenas decisões. Reflita sobre uma área em que você precisa confiar mais e controlar menos.",
  verse:"“Ora, a fé é a certeza de coisas que se esperam, a convicção de fatos que se não veem.”",
  ref:"Hebreus 11:1"
},
{
  title:"Pelo que posso agradecer hoje?",
  text:"Pare por alguns instantes e reconheça coisas que você normalmente passa rápido demais para perceber.",
  verse:"“Em tudo dai graças, porque esta é a vontade de Deus.”",
  ref:"1 Tessalonicenses 5:18"
}
];

let ri=0;

function loadReflection(){
  const r=reflections[ri];

  document.getElementById("reflectionNumber").textContent=
    String(ri+1).padStart(2,"0");

  document.getElementById("reflectionTitle").textContent=r.title;
  document.getElementById("reflectionText").textContent=r.text;
  document.getElementById("reflectionVerse").textContent=r.verse;
  document.getElementById("reflectionRef").textContent=r.ref;
  document.getElementById("reflectionAnswer").value="";
}

document.getElementById("nextReflection").onclick=()=>{
  ri=(ri+1)%reflections.length;
  loadReflection();
};

document.getElementById("saveReflection").onclick=()=>{
  const a=document.getElementById("reflectionAnswer").value.trim();

  if(!a)
    return toast("Escreva sua reflexão antes de salvar.");

  const db=getDB();

  db.reflections.push({
    title:reflections[ri].title,
    answer:a,
    ref:reflections[ri].ref,
    date:new Date().toISOString()
  });

  setDB(db);

  addActivity("Você registrou uma reflexão","🌿");

  toast("Reflexão guardada 🌿");
};

loadReflection();
