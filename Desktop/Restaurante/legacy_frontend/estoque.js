// Array global para armazenar itens de estoque
let itensEstoque = [];
let movimentacoes = [];

// ========================================
// VERIFICAÇÃO DE AUTENTICAÇÃO
// ========================================

function verificarAutenticacaoEstoque() {
  const sessao = localStorage.getItem("auth_sessao");
  if (!sessao) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// Executar verificação ao carregar a página
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", verificarAutenticacaoEstoque);
} else {
  verificarAutenticacaoEstoque();
}

// Carregar dados ao inicializar
window.addEventListener("load", () => {
  exibirUsuarioLogado();
  carregarEstoque();
  carregarMovimentacoes();

  // Recarregar a cada 30 segundos
  setInterval(carregarEstoque, 30000);
  setInterval(carregarMovimentacoes, 30000);

  // Event listener para logout
  document.getElementById("logoutBtn").addEventListener("click", fazerLogout);
});

// Fechar modal ao clicar fora
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });
});

// ===========================
// FUNÇÃO: Carregar lista de estoque
// ===========================
async function carregarEstoque() {
  try {
    console.log("📦 Carregando estoque...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch("http://localhost:3000/estoque", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("Erro ao carregar estoque");

    itensEstoque = await response.json();
    console.log("✅ Estoque carregado:", itensEstoque.length);
    renderizarEstoque();
  } catch (error) {
    console.error("❌ Erro ao carregar estoque:", error);
    if (error.name === "AbortError") {
      console.warn("⏱️ Timeout ao carregar estoque");
    }
    mostrarAlerta("Erro ao carregar estoque", "erro");
  }
}

// ===========================
// FUNÇÃO: Renderizar lista de estoque
// ===========================
function renderizarEstoque() {
  const container = document.getElementById("itensEstoque");

  if (itensEstoque.length === 0) {
    container.innerHTML =
      '<div class="lista-vazia">Nenhum item de estoque cadastrado</div>';
    return;
  }

  let html = "";

  itensEstoque.forEach((item) => {
    const estoqueBaixo = item.quantidade_atual <= item.estoque_minimo;
    const classBaixo = estoqueBaixo ? "baixo" : "";

    html += `
      <div class="item-estoque ${classBaixo}">
        <div class="info-item">
          <div class="nome-item">${item.nome}</div>
          <div class="quantidade-item ${classBaixo ? "baixo" : ""}">
            ${item.quantidade_atual.toFixed(2)} ${item.unidade}
            ${estoqueBaixo ? `<br><strong>⚠️ Estoque mínimo: ${item.estoque_minimo.toFixed(2)} ${item.unidade}</strong>` : ""}
          </div>
        </div>
        <div class="botoes-item">
          <button class="btn-entrada" onclick="abrirModalEntrada(${item.id}, '${item.nome}')">Entrada</button>
          <button class="btn-saida" onclick="abrirModalSaida(${item.id}, '${item.nome}', ${item.quantidade_atual})">Saída</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ===========================
// FUNÇÃO: Carregar movimentações
// ===========================
async function carregarMovimentacoes() {
  try {
    console.log("📋 Carregando movimentações de estoque...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout

    const response = await fetch(
      "http://localhost:3000/estoque/movimentacoes",
      {
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("Erro ao carregar movimentações");

    movimentacoes = await response.json();
    console.log("✅ Movimentações carregadas:", movimentacoes.length);
    console.log("📊 Dados de movimentações:", movimentacoes);
    renderizarHistorico();
  } catch (error) {
    console.error("❌ Erro ao carregar movimentações:", error);
    if (error.name === "AbortError") {
      console.warn("⏱️ Timeout ao carregar movimentações");
    }
  }
}

// ===========================
// FUNÇÃO: Renderizar histórico de movimentações
// ===========================
function renderizarHistorico() {
  console.log("🎨 Renderizando histórico...");
  const container = document.getElementById("historico");

  if (movimentacoes.length === 0) {
    container.innerHTML =
      '<div class="lista-vazia">Nenhuma movimentação registrada</div>';
    console.log("✅ Histórico renderizado (vazio)");
    return;
  }

  let html = "";

  // Mostrar apenas as últimas 50 movimentações
  movimentacoes.slice(0, 50).forEach((mov) => {
    const data = new Date(mov.data).toLocaleString("pt-BR");
    const tipo = mov.tipo === "entrada" ? "Entrada" : "Saída";
    const classTipo = mov.tipo;

    html += `
      <div class="historico-item ${classTipo}">
        <div>
          <span class="historico-tipo ${classTipo}">${tipo}</span>
          <strong>${mov.nome}</strong>
        </div>
        <div>
          Quantidade: <strong>${mov.quantidade.toFixed(2)}</strong>
        </div>
        ${mov.motivo ? `<div>Motivo: ${mov.motivo}</div>` : ""}
        <div class="historico-data">${data}</div>
      </div>
    `;
  });

  container.innerHTML = html;
  console.log("✅ Histórico renderizado:", movimentacoes.slice(0, 50).length);
}

// ===========================
// FUNÇÕES: Modais
// ===========================

function abrirModalNovo() {
  document.getElementById("modalNovo").classList.add("active");
  document.getElementById("formNovoItem").reset();
}

function abrirModalEntrada(itemId, itemNome) {
  document.getElementById("modalEntrada").classList.add("active");
  document.getElementById("entradaItemId").value = itemId;
  document.getElementById("entradaItemNome").textContent = itemNome;
  document.getElementById("formEntrada").reset();
}

function abrirModalSaida(itemId, itemNome, quantidadeDisponivel) {
  document.getElementById("modalSaida").classList.add("active");
  document.getElementById("saidaItemId").value = itemId;
  document.getElementById("saidaItemNome").textContent = itemNome;
  document.getElementById("saidaQuantidadeDisponivel").textContent =
    quantidadeDisponivel.toFixed(2);
  document.getElementById("formSaida").reset();
}

function fecharModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

// ===========================
// FUNÇÃO: Criar novo item
// ===========================
async function criarNovoItem(event) {
  event.preventDefault();

  const nome = document.getElementById("novoNome").value.trim();
  const unidade = document.getElementById("novoUnidade").value;
  const quantidade_inicial =
    parseFloat(document.getElementById("novoQuantidade").value) || 0;
  const estoque_minimo =
    parseFloat(document.getElementById("novoMinimo").value) || 0;

  if (!nome || !unidade) {
    mostrarAlerta("Preencha todos os campos obrigatórios", "aviso");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/estoque", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        unidade,
        quantidade_inicial,
        estoque_minimo,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    mostrarAlerta(`Item "${nome}" criado com sucesso!`, "sucesso");
    fecharModal("modalNovo");
    carregarEstoque();
    carregarMovimentacoes();
  } catch (error) {
    console.error("Erro:", error);
    mostrarAlerta("Erro ao criar item: " + error.message, "erro");
  }
}

// ===========================
// FUNÇÃO: Registrar entrada
// ===========================
async function registrarEntrada(event) {
  event.preventDefault();

  const id = document.getElementById("entradaItemId").value;
  const quantidade = parseFloat(
    document.getElementById("entradaQuantidade").value,
  );
  const motivo = document.getElementById("entradaMotivo").value;
  const observacao = document.getElementById("entradaObservacao").value.trim();

  if (!quantidade || quantidade <= 0 || !motivo) {
    mostrarAlerta("Preencha todos os campos obrigatórios", "aviso");
    return;
  }

  const motivoCompleto = observacao ? `${motivo} - ${observacao}` : motivo;

  try {
    const response = await fetch(
      `http://localhost:3000/estoque/${id}/entrada`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade, motivo: motivoCompleto }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    mostrarAlerta(
      `Entrada de ${quantidade} registrada com sucesso!`,
      "sucesso",
    );
    fecharModal("modalEntrada");
    carregarEstoque();
    carregarMovimentacoes();
  } catch (error) {
    console.error("Erro:", error);
    mostrarAlerta("Erro ao registrar entrada: " + error.message, "erro");
  }
}

// ===========================
// FUNÇÃO: Registrar saída
// ===========================
async function registrarSaida(event) {
  event.preventDefault();

  const id = document.getElementById("saidaItemId").value;
  const quantidade = parseFloat(
    document.getElementById("saidaQuantidade").value,
  );
  const motivo = document.getElementById("saidaMotivo").value;
  const observacao = document.getElementById("saidaObservacao").value.trim();

  if (!quantidade || quantidade <= 0 || !motivo) {
    mostrarAlerta("Preencha todos os campos obrigatórios", "aviso");
    return;
  }

  const quantidadeDisponivel = parseFloat(
    document.getElementById("saidaQuantidadeDisponivel").textContent,
  );

  if (quantidade > quantidadeDisponivel) {
    mostrarAlerta(
      `Quantidade insuficiente. Disponível: ${quantidadeDisponivel.toFixed(2)}`,
      "aviso",
    );
    return;
  }

  const motivoCompleto = observacao ? `${motivo} - ${observacao}` : motivo;

  try {
    const response = await fetch(`http://localhost:3000/estoque/${id}/saida`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantidade, motivo: motivoCompleto }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    mostrarAlerta(`Saída de ${quantidade} registrada com sucesso!`, "sucesso");
    fecharModal("modalSaida");
    carregarEstoque();
    carregarMovimentacoes();
  } catch (error) {
    console.error("Erro:", error);
    mostrarAlerta("Erro ao registrar saída: " + error.message, "erro");
  }
}

// ===========================
// FUNÇÃO: Mostrar alerta
// ===========================
function mostrarAlerta(mensagem, tipo = "info") {
  const container = document.getElementById("itensEstoque");
  const alerta = document.createElement("div");
  alerta.className = `alerta alerta-${tipo}`;
  alerta.textContent = mensagem;

  if (container) {
    container.insertBefore(alerta, container.firstChild);

    setTimeout(() => {
      alerta.remove();
    }, 5000);
  }
}

// ===========================
// FUNÇÃO: Voltar para home
// ===========================
function voltarHome() {
  window.location.href = "index.html";
}

// ===========================
// FUNÇÃO: Exibir usuário logado
// ===========================
function exibirUsuarioLogado() {
  const sessao = localStorage.getItem("auth_sessao");
  if (sessao) {
    try {
      const dados = JSON.parse(sessao);
      const usuarioDiv = document.getElementById("usuarioLogado");
      if (usuarioDiv) {
        usuarioDiv.textContent = `Logado como: ${dados.usuario.username}`;
      }
    } catch (e) {
      console.error("Erro ao obter usuário:", e);
    }
  }
}

// ===========================
// FUNÇÃO: Fazer logout
// ===========================
function fazerLogout() {
  localStorage.removeItem("auth_sessao");
  window.location.href = "index.html";
}
