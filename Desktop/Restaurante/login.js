// ========================================
// LOGIN - Sistema de Autenticação
// ========================================

// Estado de autenticação
let estadoAuth = {
  logado: false,
  usuario: null,
};

// ========================================
// FUNÇÕES DE AUTENTICAÇÃO
// ========================================

/**
 * Verifica se o usuário está autenticado
 */
function verificarAutenticacao() {
  const sessao = localStorage.getItem("auth_sessao");
  if (sessao) {
    try {
      const dados = JSON.parse(sessao);
      estadoAuth.logado = true;
      estadoAuth.usuario = dados.usuario;
      return true;
    } catch (e) {
      localStorage.removeItem("auth_sessao");
      return false;
    }
  }
  return false;
}

/**
 * Salva a sessão no localStorage
 */
function salvarSessao(usuario) {
  const sessao = {
    usuario: usuario,
    timestamp: Date.now(),
  };
  localStorage.setItem("auth_sessao", JSON.stringify(sessao));
  estadoAuth.logado = true;
  estadoAuth.usuario = usuario;
}

/**
 * Remove a sessão
 */
function removerSessao() {
  localStorage.removeItem("auth_sessao");
  estadoAuth.logado = false;
  estadoAuth.usuario = null;
}

/**
 * Faz login no backend
 */
async function fazerLogin(username, password) {
  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        sucesso: false,
        erro: data.error || "Erro ao fazer login",
      };
    }

    if (data.success) {
      salvarSessao(data.user);
      return {
        sucesso: true,
        usuario: data.user,
      };
    }

    return {
      sucesso: false,
      erro: data.error || "Erro desconhecido",
    };
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return {
      sucesso: false,
      erro: "Erro ao conectar com o servidor. Verifique se o backend está rodando.",
    };
  }
}

// ========================================
// MANIPULAÇÃO DO DOM
// ========================================

/**
 * Exibe mensagem de erro
 */
function exibirErro(mensagem) {
  const erroDiv = document.getElementById("erro");
  const sucessoDiv = document.getElementById("sucesso");

  erroDiv.textContent = mensagem;
  erroDiv.classList.add("show");
  sucessoDiv.classList.remove("show");
}

/**
 * Exibe mensagem de sucesso
 */
function exibirSucesso(mensagem) {
  const erroDiv = document.getElementById("erro");
  const sucessoDiv = document.getElementById("sucesso");

  sucessoDiv.textContent = mensagem;
  sucessoDiv.classList.add("show");
  erroDiv.classList.remove("show");
}

/**
 * Limpa mensagens
 */
function limparMensagens() {
  const erroDiv = document.getElementById("erro");
  const sucessoDiv = document.getElementById("sucesso");

  erroDiv.classList.remove("show");
  sucessoDiv.classList.remove("show");
}

/**
 * Desabilita o formulário
 */
function desabilitarFormulario(desabilitar) {
  const btn = document.querySelector(".btn-login");
  const inputs = document.querySelectorAll(".form-group input");

  if (desabilitar) {
    btn.disabled = true;
    btn.classList.add("loading");
    inputs.forEach((input) => (input.disabled = true));
  } else {
    btn.disabled = false;
    btn.classList.remove("loading");
    inputs.forEach((input) => (input.disabled = false));
  }
}

/**
 * Redireciona para gerência após login bem-sucedido
 */
function redirecionarParaGerencia() {
  setTimeout(() => {
    window.location.href = "gerencia.html";
  }, 500);
}

// ========================================
// EVENT LISTENERS
// ========================================

window.addEventListener("load", () => {
  // Se já está logado, redireciona para gerência
  if (verificarAutenticacao()) {
    window.location.href = "gerencia.html";
    return;
  }

  // Formulário de login
  const loginForm = document.getElementById("loginForm");
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
      exibirErro("Por favor, preencha todos os campos");
      return;
    }

    limparMensagens();
    desabilitarFormulario(true);

    const resultado = await fazerLogin(username, password);

    if (resultado.sucesso) {
      exibirSucesso(`Bem-vindo, ${resultado.usuario.username}!`);
      redirecionarParaGerencia();
    } else {
      exibirErro(resultado.erro);
      desabilitarFormulario(false);
    }
  });

  // Botão voltar
  const voltarBtn = document.getElementById("voltarBtn");
  voltarBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // Fechar mensagem ao digitar
  const inputs = document.querySelectorAll(".form-group input");
  inputs.forEach((input) => {
    input.addEventListener("focus", limparMensagens);
  });
});

// ========================================
// EXPORT PARA USO EM OUTRAS PÁGINAS
// ========================================

// Função para verificar autenticação em páginas protegidas
function verificarAcesso() {
  if (!verificarAutenticacao()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// Função para fazer logout
function fazerLogout() {
  removerSessao();
  window.location.href = "index.html";
}

// Função para obter usuário logado
function obterUsuarioLogado() {
  if (verificarAutenticacao()) {
    return estadoAuth.usuario;
  }
  return null;
}
