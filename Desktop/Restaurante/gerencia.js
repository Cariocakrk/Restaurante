// ========================================
// GERÊNCIA DO RESTAURANTE - Sistema de Análise e Relatórios
// ========================================

// ========================================
// VERIFICAÇÃO DE AUTENTICAÇÃO
// ========================================

function verificarAutenticacaoGerencia() {
  const sessao = localStorage.getItem("auth_sessao");
  if (!sessao) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// Executar verificação ao carregar a página
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", verificarAutenticacaoGerencia);
} else {
  verificarAutenticacaoGerencia();
}

// Estado da aplicação
let estadoFiltros = {
  dataInicio: null,
  dataFim: null,
};

let dadosCache = {
  vendas: [],
  resumo: {},
  produtos: [],
};

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================

/**
 * Formata um número como moeda brasileira
 */
function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor || 0);
}

/**
 * Formata uma data ISO para formato brasileiro
 */
function formatarData(dataISO) {
  const data = new Date(dataISO);
  return data.toLocaleString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Converte uma data em formato brasileiro para ISO
 */
function dataParaISO(dataBR) {
  if (!dataBR) return null;
  const [ano, mes, dia] = dataBR.split("-");
  return new Date(`${ano}-${mes}-${dia}T00:00:00Z`).toISOString();
}

/**
 * Obtém as datas para os filtros rápidos
 */
function obterDatasRapidas(tipo) {
  const hoje = new Date();
  const inicio = new Date();
  let fim = new Date();
  fim.setHours(23, 59, 59, 999);

  switch (tipo) {
    case "hoje":
      inicio.setHours(0, 0, 0, 0);
      break;
    case "semana":
      inicio.setDate(hoje.getDate() - 7);
      inicio.setHours(0, 0, 0, 0);
      break;
    case "mes":
      inicio.setDate(1);
      inicio.setHours(0, 0, 0, 0);
      break;
    case "mes-anterior":
      inicio.setMonth(hoje.getMonth() - 1);
      inicio.setDate(1);
      fim.setDate(0); // Último dia do mês anterior
      fim.setHours(23, 59, 59, 999);
      break;
    case "ano":
      inicio.setMonth(0);
      inicio.setDate(1);
      inicio.setHours(0, 0, 0, 0);
      break;
    case "todos":
      return { dataInicio: null, dataFim: null };
    default:
      return { dataInicio: null, dataFim: null };
  }

  return {
    dataInicio: inicio.toISOString(),
    dataFim: fim.toISOString(),
  };
}

// ========================================
// REQUISIÇÕES AO BACKEND
// ========================================

/**
 * Carrega vendas filtradas do backend
 */
async function carregarVendas() {
  try {
    console.log("📝 Carregando vendas...");
    let url = "http://localhost:3000/vendas/filtro?";

    if (estadoFiltros.dataInicio) {
      url += `dataInicio=${encodeURIComponent(estadoFiltros.dataInicio)}&`;
    }
    if (estadoFiltros.dataFim) {
      url += `dataFim=${encodeURIComponent(estadoFiltros.dataFim)}&`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout

    console.log("📡 Fazendo requisição para:", url);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("Erro ao carregar vendas");

    dadosCache.vendas = await response.json();
    console.log("✅ Vendas carregadas:", dadosCache.vendas.length);
    return true;
  } catch (error) {
    console.error("❌ Erro ao carregar vendas:", error);
    if (error.name === "AbortError") {
      alert(
        "Timeout ao carregar vendas. Tente novamente com um período menor.",
      );
    } else {
      alert("Erro ao carregar vendas. Verifique se o backend está rodando.");
    }
    return false;
  }
}

/**
 * Carrega relatório de produtos do backend
 */
async function carregarProdutos() {
  try {
    let url = "http://localhost:3000/relatorios/produtos?";

    if (estadoFiltros.dataInicio) {
      url += `dataInicio=${encodeURIComponent(estadoFiltros.dataInicio)}&`;
    }
    if (estadoFiltros.dataFim) {
      url += `dataFim=${encodeURIComponent(estadoFiltros.dataFim)}&`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("Erro ao carregar produtos");

    dadosCache.produtos = await response.json();
    return true;
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    return false;
  }
}

/**
 * Carrega resumo financeiro do backend
 */
async function carregarResumo() {
  try {
    let url = "http://localhost:3000/relatorios/resumo?";

    if (estadoFiltros.dataInicio) {
      url += `dataInicio=${encodeURIComponent(estadoFiltros.dataInicio)}&`;
    }
    if (estadoFiltros.dataFim) {
      url += `dataFim=${encodeURIComponent(estadoFiltros.dataFim)}&`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("Erro ao carregar resumo");

    dadosCache.resumo = await response.json();
    return true;
  } catch (error) {
    console.error("Erro ao carregar resumo:", error);
    return false;
  }
}

/**
 * Carrega todos os dados em paralelo
 */
async function carregarTodosDados() {
  console.log("🔄 Iniciando carregamento de dados...");
  const carregandoElements = document.querySelectorAll(".carregando");
  carregandoElements.forEach((el) => (el.textContent = "Carregando dados..."));

  try {
    console.log("📊 Carregando vendas, produtos e resumo em paralelo...");
    const resultados = await Promise.all([
      carregarVendas(),
      carregarProdutos(),
      carregarResumo(),
    ]);

    console.log("✅ Dados carregados:", resultados);

    const sucesso = resultados.every((r) => r);
    if (sucesso) {
      console.log("🎨 Renderizando dados...");
      renderizarTodosDados();
      console.log("✨ Carregamento concluído!");
    } else {
      console.error("❌ Alguns dados falharam ao carregar");
    }
  } catch (error) {
    console.error("❌ Erro ao carregar dados:", error);
  }
}

// ========================================
// RENDERIZAÇÃO DE DADOS
// ========================================

/**
 * Renderiza o resumo financeiro
 */
function renderizarResumo() {
  console.log("💰 Renderizando resumo financeiro...");
  const resumo = dadosCache.resumo;

  document.getElementById("faturamentoTotal").textContent = formatarMoeda(
    resumo.faturamento_total,
  );
  document.getElementById("totalVendas").textContent = resumo.total_vendas || 0;
  document.getElementById("ticketMedio").textContent = formatarMoeda(
    resumo.ticket_medio,
  );

  document.getElementById("totalDinheiro").textContent = formatarMoeda(
    resumo.total_dinheiro,
  );
  document.getElementById("vendasDinheiro").textContent =
    `${resumo.vendas_dinheiro || 0} vendas`;

  document.getElementById("totalCartao").textContent = formatarMoeda(
    resumo.total_cartao,
  );
  document.getElementById("vendasCartao").textContent =
    `${resumo.vendas_cartao || 0} vendas`;

  document.getElementById("totalCredito").textContent = formatarMoeda(
    resumo.total_credito,
  );
  document.getElementById("vendasCredito").textContent =
    `${resumo.vendas_credito || 0} vendas`;

  console.log("✅ Resumo renderizado");
}

/**
 * Renderiza o ranking de produtos mais vendidos
 */
function renderizarProdutosRanking() {
  console.log("🏆 Renderizando ranking de produtos...");
  const container = document.getElementById("produtosRanking");
  const produtos = dadosCache.produtos;

  if (!produtos || produtos.length === 0) {
    container.innerHTML =
      '<p class="sem-dados">Nenhum produto vendido no período.</p>';
    return;
  }

  const top10 = produtos.slice(0, 10);
  const maxQuantidade = top10[0].quantidade_total || 1;

  let html = '<div class="ranking-list">';

  top10.forEach((produto, index) => {
    const percentual = (produto.quantidade_total / maxQuantidade) * 100;
    html += `
            <div class="ranking-item">
                <div class="ranking-numero">#${index + 1}</div>
                <div class="ranking-info">
                    <div class="ranking-produto">${produto.produto}</div>
                    <div class="ranking-stats">
                        Quantidade: ${produto.quantidade_total} | 
                        Faturamento: ${formatarMoeda(produto.valor_total)} | 
                        Vendas: ${produto.num_vendas}
                    </div>
                </div>
                <div class="ranking-barra">
                    <div class="ranking-barra-preenchida" style="width: ${percentual}%"></div>
                </div>
            </div>
        `;
  });

  html += "</div>";
  container.innerHTML = html;
  console.log("✅ Ranking renderizado");
}

/**
 * Renderiza produtos por categoria
 */
function renderizarProdutosCategorias() {
  const container = document.getElementById("produtosCategorias");
  container.innerHTML = '<p class="sem-dados">Carregando...</p>';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout

  let url = "http://localhost:3000/relatorios/produtos-categorias?";

  if (estadoFiltros.dataInicio) {
    url += `dataInicio=${encodeURIComponent(estadoFiltros.dataInicio)}&`;
  }
  if (estadoFiltros.dataFim) {
    url += `dataFim=${encodeURIComponent(estadoFiltros.dataFim)}&`;
  }

  fetch(url, {
    signal: controller.signal,
  })
    .then((response) => {
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((categorias) => {
      let html = '<div class="categorias-grid">';
      let temDados = false;

      for (const [categoria, produtos] of Object.entries(categorias)) {
        if (!Array.isArray(produtos) || produtos.length === 0) {
          continue;
        }

        temDados = true;
        html += `
          <div class="categoria-card">
            <div class="categoria-titulo">${categoria}</div>
            <div class="categoria-produtos">
        `;

        // Top 5 produtos da categoria
        const top5 = produtos.slice(0, 5);
        const maxQtd = top5[0]?.total_quantidade || 1;

        top5.forEach((produto, index) => {
          const percentual =
            maxQtd > 0 ? (produto.total_quantidade / maxQtd) * 100 : 0;
          html += `
            <div class="categoria-item">
              <div class="item-posicao">${index + 1}º</div>
              <div class="item-detalhes">
                <div class="item-nome">${produto.produto || "N/A"}</div>
                <div class="item-stats">
                  <span class="item-qtd">${produto.total_quantidade || 0} un</span>
                  <span class="item-vendas">${produto.num_vendas || 0} vendas</span>
                </div>
                <div class="item-barra">
                  <div class="item-barra-fill" style="width: ${percentual}%"></div>
                </div>
              </div>
              <div class="item-valor">${formatarMoeda(produto.total_vendas || 0)}</div>
            </div>
          `;
        });

        html += `
            </div>
          </div>
        `;
      }

      html += "</div>";

      if (!temDados) {
        container.innerHTML =
          '<p class="sem-dados">Nenhum produto vendido ainda.</p>';
      } else {
        container.innerHTML = html;
      }
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      console.error("Erro ao carregar produtos por categoria:", error);
      container.innerHTML =
        '<p class="sem-dados">Nenhum produto vendido ainda.</p>';
    });
}

/**
 * Renderiza a tabela de análise de produtos
 */
function renderizarAnaliseProdutos() {
  console.log("📈 Renderizando análise de produtos...");
  const container = document.getElementById("todasVendas");
  const produtos = dadosCache.produtos;

  if (!produtos || produtos.length === 0) {
    container.innerHTML =
      '<p class="sem-dados">Nenhum produto vendido no período.</p>';
    return;
  }

  let html = `
        <table class="tabela-produtos">
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Valor Total</th>
                    <th>Preço Médio</th>
                    <th>Nº de Vendas</th>
                </tr>
            </thead>
            <tbody>
    `;

  produtos.forEach((produto) => {
    const precoMedio =
      produto.quantidade_total > 0
        ? produto.valor_total / produto.quantidade_total
        : 0;

    html += `
            <tr>
                <td>${produto.produto}</td>
                <td>${produto.quantidade_total}</td>
                <td>${formatarMoeda(produto.valor_total)}</td>
                <td>${formatarMoeda(precoMedio)}</td>
                <td>${produto.num_vendas}</td>
            </tr>
        `;
  });

  html += `
            </tbody>
        </table>
    `;

  container.innerHTML = html;
  console.log("✅ Análise de produtos renderizada");
}

/**
 * Renderiza detalhes de cada venda
 */
function renderizarDetalhesVendas() {
  console.log("📊 Renderizando detalhes de vendas...");
  const container = document.getElementById("vendasDetails");
  const vendas = dadosCache.vendas;

  if (!vendas || vendas.length === 0) {
    container.innerHTML = '<p class="sem-dados">Nenhuma venda no período.</p>';
    return;
  }

  // Limitar para as primeiras 50 vendas para melhor desempenho
  const vendasLimitadas = vendas.slice(0, 50);
  let html = '<div class="vendas-detalhes-lista">';

  vendasLimitadas.forEach((venda) => {
    const dataFormatada = formatarData(venda.dataISO);
    const tipoPagamento = venda.tipoPagamento || "desconhecido";
    const desconto = venda.desconto || 0;
    let itensHtml = '<ul class="items-venda">';

    if (venda.itens && venda.itens.length > 0) {
      venda.itens.forEach((item) => {
        itensHtml += `
                    <li>
                        ${item.produto} - Qtd: ${item.quantidade} x ${formatarMoeda(item.preco)} 
                        = ${formatarMoeda(item.quantidade * item.preco)}
                    </li>
                `;
      });
    }

    itensHtml += "</ul>";

    const descontoHtml =
      desconto > 0
        ? `<div class="venda-desconto">Desconto: ${desconto}%</div>`
        : "";

    html += `
            <div class="venda-detalhada">
                <div class="venda-cabecalho">
                    <div class="venda-info">
                        <span class="venda-data">${dataFormatada}</span>
                        <span class="venda-pagamento ${tipoPagamento}">${tipoPagamento.toUpperCase()}</span>
                    </div>
                    <div class="venda-total">${formatarMoeda(venda.total)}</div>
                </div>
                ${descontoHtml}
                ${itensHtml}
            </div>
        `;
  });

  if (vendas.length > 50) {
    html += `<p class="info-texto">Mostrando últimas 50 vendas de ${vendas.length}</p>`;
  }

  html += "</div>";
  container.innerHTML = html;
  console.log("✅ Detalhes de vendas renderizados:", vendasLimitadas.length);
}

/**
 * Renderiza todos os dados
 */
function renderizarTodosDados() {
  console.log("🎨 Iniciando renderização de dados...");
  renderizarResumo();
  renderizarProdutosRanking();
  renderizarAnaliseProdutos();
  renderizarDetalhesVendas();
  renderizarProdutosCategorias();
  console.log("✨ Renderização concluída!");
}

// ========================================
// EVENTOS E FILTROS
// ========================================

/**
 * Aplica os filtros de data
 */
async function aplicarFiltros() {
  const dataInicio = document.getElementById("dataInicio").value;
  const dataFim = document.getElementById("dataFim").value;

  if (!dataInicio && !dataFim) {
    alert("Por favor, selecione pelo menos uma data.");
    return;
  }

  estadoFiltros.dataInicio = dataInicio
    ? new Date(`${dataInicio}T00:00:00Z`).toISOString()
    : null;
  estadoFiltros.dataFim = dataFim
    ? new Date(`${dataFim}T23:59:59Z`).toISOString()
    : null;

  await carregarTodosDados();
}

/**
 * Aplica filtro rápido
 */
async function aplicarFiltroRapido() {
  const filtro = document.getElementById("filtroRapido").value;

  if (!filtro) {
    alert("Selecione um período.");
    return;
  }

  const datas = obterDatasRapidas(filtro);
  estadoFiltros.dataInicio = datas.dataInicio;
  estadoFiltros.dataFim = datas.dataFim;

  // Atualizar inputs de data visualmente
  if (datas.dataInicio) {
    document.getElementById("dataInicio").value =
      datas.dataInicio.split("T")[0];
  }
  if (datas.dataFim) {
    document.getElementById("dataFim").value = datas.dataFim.split("T")[0];
  }

  await carregarTodosDados();
}

/**
 * Limpa os filtros
 */
async function limparFiltros() {
  estadoFiltros.dataInicio = null;
  estadoFiltros.dataFim = null;

  document.getElementById("dataInicio").value = "";
  document.getElementById("dataFim").value = "";
  document.getElementById("filtroRapido").value = "";

  await carregarTodosDados();
}

/**
 * Volta para a página anterior
 */
function voltar() {
  if (window.opener) {
    window.close();
  } else {
    window.history.back();
  }
}

/**
 * Faz logout
 */
function fazerLogout() {
  localStorage.removeItem("auth_sessao");
  window.location.href = "index.html";
}

/**
 * Obtém e exibe usuário logado
 */
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

// ========================================
// INICIALIZAÇÃO
// ========================================

window.addEventListener("load", () => {
  // Exibir usuário logado
  exibirUsuarioLogado();

  // Configurar data padrão para hoje
  const hoje = new Date().toISOString().split("T")[0];
  document.getElementById("dataInicio").value = hoje;
  document.getElementById("dataFim").value = hoje;

  // Carregar dados iniciais (do dia)
  estadoFiltros.dataInicio = new Date(`${hoje}T00:00:00Z`).toISOString();
  estadoFiltros.dataFim = new Date(`${hoje}T23:59:59Z`).toISOString();

  // Carregar dados com await
  (async () => {
    await carregarTodosDados();
  })();

  // Event listeners
  document
    .getElementById("aplicarFiltrosBtn")
    .addEventListener("click", aplicarFiltros);
  document
    .getElementById("limparFiltrosBtn")
    .addEventListener("click", limparFiltros);
  document
    .getElementById("filtroRapido")
    .addEventListener("change", aplicarFiltroRapido);
  document.getElementById("voltarBtn").addEventListener("click", voltar);
  document.getElementById("logoutBtn").addEventListener("click", fazerLogout);

  // Event listeners para modal de limpar BD
  document
    .getElementById("limparBDBtn")
    .addEventListener("click", abrirModalLimparBD);
  document
    .getElementById("cancelarLimparBtn")
    .addEventListener("click", fecharModalLimparBD);
  document
    .getElementById("confirmarLimparBtn")
    .addEventListener("click", confirmarLimparBD);

  // Fechar modal ao clicar fora dele
  document.getElementById("modalLimparBD").addEventListener("click", (e) => {
    if (e.target.id === "modalLimparBD") {
      fecharModalLimparBD();
    }
  });
});

// ========================================
// FUNÇÕES PARA LIMPAR BD
// ========================================

/**
 * Abre o modal para limpar o banco de dados
 */
function abrirModalLimparBD() {
  const modal = document.getElementById("modalLimparBD");
  modal.classList.add("ativo");
  document.getElementById("senhaLimparBD").focus();
  document.getElementById("mensagemModal").textContent = "";
}

/**
 * Fecha o modal
 */
function fecharModalLimparBD() {
  const modal = document.getElementById("modalLimparBD");
  modal.classList.remove("ativo");
  document.getElementById("senhaLimparBD").value = "";
  document.getElementById("mensagemModal").textContent = "";
}

/**
 * Confirma limpeza do BD com validação de senha
 */
async function confirmarLimparBD() {
  const senha = document.getElementById("senhaLimparBD").value;
  const mensagemEl = document.getElementById("mensagemModal");
  const SENHA_CORRETA = "DOOMSDAY";

  // Validar senha
  if (senha !== SENHA_CORRETA) {
    mensagemEl.textContent = "❌ Senha incorreta!";
    mensagemEl.className = "mensagem-modal erro";
    document.getElementById("senhaLimparBD").value = "";
    return;
  }

  // Pedir confirmação adicional
  if (
    !confirm(
      "⚠️ ATENÇÃO! Isso vai deletar TODAS as vendas do banco de dados permanentemente. Tem certeza?",
    )
  ) {
    return;
  }

  // Fazer requisição DELETE
  try {
    mensagemEl.textContent = "Limpando banco de dados...";
    const response = await fetch("http://localhost:3000/limpar-vendas", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ senha: SENHA_CORRETA }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao limpar banco de dados");
    }

    mensagemEl.textContent = "✅ Banco de dados limpo com sucesso!";
    mensagemEl.className = "mensagem-modal sucesso";

    // Fechar modal após 2 segundos
    setTimeout(() => {
      fecharModalLimparBD();
      // Recarregar dados da página
      location.reload();
    }, 2000);
  } catch (error) {
    console.error("Erro ao limpar BD:", error);
    mensagemEl.textContent = "❌ Erro: " + error.message;
    mensagemEl.className = "mensagem-modal erro";
  }
}
