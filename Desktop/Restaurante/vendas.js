// Array para vendas
let vendas = [];

// Função para formatar valores em Real (R$)
function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

// Carregar vendas do backend ao iniciar
window.addEventListener("load", () => {
  console.log("📊 Carregando vendas do dia...");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos de timeout

  fetch("http://localhost:3000/vendas", { signal: controller.signal })
    .then((response) => {
      clearTimeout(timeoutId);
      console.log("📡 Resposta recebida:", response.status);
      return response.json();
    })
    .then((data) => {
      console.log("✅ Vendas carregadas:", data.length);
      // Carregar vendas do backend (ignora a flag de limpeza visual)
      vendas = data;
      atualizarVendas();
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      console.error("❌ Erro ao carregar vendas:", error);
      if (error.name === "AbortError") {
        alert("Timeout ao carregar vendas. Tente novamente mais tarde.");
      } else {
        alert("Erro ao carregar vendas. Verifique se o backend está rodando.");
      }
    });
});

// Função para atualizar lista de vendas e total bruto
function atualizarVendas() {
  console.log("🔄 Atualizando lista de vendas...", vendas.length, "vendas");
  const listaVendas = document.getElementById("listaVendas");
  const totalBrutoEl = document.getElementById("totalBruto");
  const totalDinheiroEl = document.getElementById("totalDinheiro");
  const totalCartaoEl = document.getElementById("totalCartao");
  const totalCreditoEl = document.getElementById("totalCredito");
  const contDinheiroEl = document.getElementById("contDinheiro");
  const contCartaoEl = document.getElementById("contCartao");
  const contCreditoEl = document.getElementById("contCredito");

  listaVendas.innerHTML = "";
  let totalBruto = 0;
  let contDinheiro = 0,
    totalDinheiro = 0;
  let contCartao = 0,
    totalCartao = 0;
  let contCredito = 0,
    totalCredito = 0;

  vendas.forEach((venda, index) => {
    totalBruto += venda.total;
    const dataFormatada = new Date(venda.dataISO).toLocaleString();
    const descricaoDesconto =
      venda.desconto > 0 ? ` (Desc: ${venda.desconto}%)` : "";
    const li = document.createElement("li");
    li.textContent = `${dataFormatada} - ${formatarMoeda(venda.total)} (${venda.tipoPagamento})${descricaoDesconto}`;
    listaVendas.appendChild(li);

    if (venda.tipoPagamento === "dinheiro") {
      contDinheiro++;
      totalDinheiro += venda.total;
    } else if (venda.tipoPagamento === "cartao") {
      contCartao++;
      totalCartao += venda.total;
    } else if (venda.tipoPagamento === "credito") {
      contCredito++;
      totalCredito += venda.total;
    }
  });

  // Atualizar os elementos individuais
  totalBrutoEl.textContent = formatarMoeda(totalBruto);
  totalDinheiroEl.textContent = formatarMoeda(totalDinheiro);
  totalCartaoEl.textContent = formatarMoeda(totalCartao);
  totalCreditoEl.textContent = formatarMoeda(totalCredito);

  contDinheiroEl.textContent = `${contDinheiro} ${contDinheiro === 1 ? "venda" : "vendas"}`;
  contCartaoEl.textContent = `${contCartao} ${contCartao === 1 ? "venda" : "vendas"}`;
  contCreditoEl.textContent = `${contCredito} ${contCredito === 1 ? "venda" : "vendas"}`;

  console.log("✅ Vendas atualizadas na tela");
}

// Função para voltar
function voltar() {
  if (window.opener) {
    window.close();
  } else {
    window.history.back();
  }
}

// Função para limpar vendas do dia
async function limparVendasDia() {
  if (
    !confirm(
      "Tem certeza que deseja limpar as vendas do dia dessa tela? (Os dados continuarão disponíveis na gerência)",
    )
  ) {
    return;
  }

  // Solicitar senha para segurança
  const senha = prompt("Digite a senha para confirmar a limpeza das vendas:");
  if (!senha) {
    alert("Limpeza cancelada.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/limpar-vendas", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ senha }),
    });

    if (!response.ok) {
      const error = await response.json();
      alert(`Erro: ${error.error}`);
      return;
    }

    const data = await response.json();
    vendas = [];
    atualizarVendas();
    alert(
      "Vendas limpas da tela! Os dados permanecem na gerência para relatórios.",
    );
  } catch (error) {
    console.error("Erro ao limpar vendas:", error);
    alert(
      "Erro ao limpar vendas: " +
        error.message +
        "\n\nVerifique se o backend está rodando em http://localhost:3000",
    );
  }
}

// Event listeners
document
  .getElementById("limparVendasBtn")
  .addEventListener("click", limparVendasDia);
document.getElementById("voltarBtn").addEventListener("click", voltar);
