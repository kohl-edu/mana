const form = document.getElementById("loginForm");
const loginMode = document.getElementById("modeLogin");
const signupMode = document.getElementById("modeSignup");
const nameField = document.getElementById("nameField");
const nameInput = document.getElementById("loginName");
const title = document.getElementById("loginTitle");
const intro = document.getElementById("loginIntro");
const submit = document.getElementById("submitLogin");
const note = document.getElementById("loginNote");
const forgotPassword = document.getElementById("forgotPassword");

let mode = "login";

function friendlyError(err) {
  const message = String(err?.message || err);
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (lower.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (lower.includes("already registered") || lower.includes("already been registered")) return "Esse e-mail já possui uma conta. Entre ou use 'Esqueci minha senha'.";
  if (lower.includes("password") && (lower.includes("weak") || lower.includes("short") || lower.includes("at least"))) return "A senha é muito fraca ou curta. Use uma senha mais forte.";
  if (lower.includes("rate limit") || lower.includes("too many requests")) return "Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.";
  if (lower.includes("email address") && (lower.includes("invalid") || lower.includes("not valid"))) return "Confira se o endereço de e-mail está escrito corretamente.";
  if (lower.includes("signup is disabled") || lower.includes("signups not allowed")) return "O cadastro está desativado nas configurações do serviço.";
  if (lower.includes("network") || lower.includes("fetch")) return "Falha de conexão. Confira a internet e tente novamente.";
  return "O serviço retornou este erro: " + message;
}

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

forgotPassword.onclick = async () => {
  const email = document.getElementById("loginEmail").value.trim();
  if (!email) {
    toast("Digite seu Gmail no campo de e-mail primeiro.");
    document.getElementById("loginEmail").focus();
    return;
  }
  if (!UTCDCloud.isConfigured()) {
    toast("A recuperação online ainda não está configurada.");
    return;
  }
  forgotPassword.disabled = true;
  forgotPassword.textContent = "Enviando e-mail...";
  try {
    await UTCDReady;
    await UTCDCloud.sendPasswordReset(email);
    toast("Se esse e-mail estiver cadastrado, enviaremos um link de recuperação. Confira também o spam.");
  } catch (err) {
    console.error("Erro ao solicitar recuperação de senha:", err);
    toast(friendlyError(err));
  } finally {
    forgotPassword.disabled = false;
    forgotPassword.textContent = "Esqueci minha senha";
  }
};

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
        toast("Solicitação recebida. Confira seu e-mail para confirmar o cadastro.");
        submit.textContent = "Confira seu e-mail";
      }
    } else {
      await UTCDCloud.signIn(email, password);
      toast("Bem-vindo de volta!");
      setTimeout(() => location.href = "progresso.html", 400);
    }
  } catch (err) {
    console.error("Erro de autenticação:", err);
    toast(friendlyError(err));
  } finally {
    submit.disabled = false;
    if (submit.textContent !== "Confira seu e-mail") {
      submit.textContent = mode === "signup" ? "Criar minha conta" : "Entrar no meu espaço";
    }
  }
};

setMode("login");
