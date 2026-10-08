const form = document.getElementById("loginForm");
const loginMode = document.getElementById("modeLogin");
const signupMode = document.getElementById("modeSignup");
const nameField = document.getElementById("nameField");
const nameInput = document.getElementById("loginName");
const title = document.getElementById("loginTitle");
const intro = document.getElementById("loginIntro");
const submit = document.getElementById("submitLogin");
const note = document.getElementById("loginNote");

let mode = "login";

function setMode(next) {
  mode = next;
  const signup = mode === "signup";

  loginMode.classList.toggle("active", !signup);
  signupMode.classList.toggle("active", signup);
  nameField.style.display = signup ? "block" : "none";
  nameInput.required = signup;

  title.textContent = signup ? "Crie seu espaço." : "Bem-vindo de volta.";
  intro.textContent = signup
    ? "Crie sua conta para guardar sua caminhada e sincronizar seus registros."
    : "Entre para acessar seus registros em qualquer dispositivo.";
  submit.textContent = signup ? "Criar minha conta" : "Entrar no meu espaço";
  note.textContent = signup
    ? "Depois do cadastro, pode ser necessário confirmar o e-mail antes do primeiro acesso."
    : "Seus registros sincronizados ficam associados à sua conta.";
}

loginMode.onclick = () => setMode("login");
signupMode.onclick = () => setMode("signup");

form.onsubmit = async e => {
  e.preventDefault();

  if (!UTCDCloud.isConfigured()) {
    toast("O armazenamento online ainda não foi configurado.");
    return;
  }

  const name = nameInput.value.trim();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (mode === "signup" && !name) {
    toast("Informe seu nome.");
    return;
  }

  submit.disabled = true;
  submit.textContent = mode === "signup" ? "Criando..." : "Entrando...";

  try {
    await UTCDReady;

    if (mode === "signup") {
      const result = await UTCDCloud.signUp(name, email, password);

      if (result.session) {
        toast("Conta criada. Sincronizando seus registros...");
        setTimeout(() => location.href = "progresso.html", 500);
      } else {
        toast("Conta criada. Confira seu e-mail para confirmar o cadastro.");
        submit.textContent = "Conta criada";
      }
    } else {
      await UTCDCloud.signIn(email, password);
      toast("Bem-vindo de volta!");
      setTimeout(() => location.href = "progresso.html", 400);
    }
  } catch (err) {
    console.error(err);
    const message = String(err?.message || err);

    if (message.toLowerCase().includes("invalid login credentials")) {
      toast("E-mail ou senha incorretos.");
    } else if (message.toLowerCase().includes("email not confirmed")) {
      toast("Confirme seu e-mail antes de entrar.");
    } else if (message.toLowerCase().includes("already registered")) {
      toast("Esse e-mail já possui uma conta. Entre em vez de criar outra.");
    } else {
      toast("Não foi possível concluir. Verifique os dados e tente novamente.");
    }
  } finally {
    submit.disabled = false;
    if (submit.textContent !== "Conta criada") {
      submit.textContent = mode === "signup" ? "Criar minha conta" : "Entrar no meu espaço";
    }
  }
};

setMode("login");
