// Array para armazenar o pedido atual
let pedido = [];

// Carregar ao iniciar
window.addEventListener("load", () => {
  toggleValorPago();

  // Event listeners
  document
    .getElementById("calcularBtn")
    .addEventListener("click", calcularTroco);
  document
    .getElementById("finalizarBtn")
    .addEventListener("click", finalizarVenda);
  document.getElementById("limparBtn").addEventListener("click", limparCampos);
  document
    .getElementById("tipoPagamento")
    .addEventListener("change", toggleValorPago);
  document
    .getElementById("desconto")
    .addEventListener("input", atualizarPedido);
});

// Função para validar entrada
function validarEntrada(valor) {
  return valor !== null && valor !== "" && !isNaN(valor) && valor >= 0;
}

// Função para formatar valores em Real (R$)
function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

// Função para mostrar/ocultar campo valor pago
function toggleValorPago() {
  const tipo = document.getElementById("tipoPagamento").value;
  const group = document.getElementById("valorPagoGroup");
  if (tipo === "cartao" || tipo === "credito") {
    group.style.display = "none";
  } else {
    group.style.display = "block";
  }
}

// Função para calcular troco
function calcularTroco() {
  console.log("Calculando troco");
  const tipoPagamento = document.getElementById("tipoPagamento").value;
  const totalConta = parseFloat(document.getElementById("totalConta").value);
  const resultadoDiv = document.getElementById("resultado");

  console.log("Tipo:", tipoPagamento, "Total:", totalConta);

  if (!validarEntrada(totalConta)) {
    resultadoDiv.innerHTML =
      '<span class="insuficiente">Por favor, insira um total válido.</span>';
    return;
  }

  if (tipoPagamento === "cartao" || tipoPagamento === "credito") {
    resultadoDiv.innerHTML = '<span class="troco">Pagamento aprovado.</span>';
    return;
  }

  const valorPago = parseFloat(document.getElementById("valorPago").value);
  console.log("Valor pago:", valorPago);

  if (!validarEntrada(valorPago)) {
    resultadoDiv.innerHTML =
      '<span class="insuficiente">Por favor, insira o valor pago.</span>';
    return;
  }

  // Cálculo
  const troco = valorPago - totalConta;
  console.log("Troco:", troco);

  if (troco < 0) {
    resultadoDiv.innerHTML = `<span class="insuficiente">Valor insuficiente. Faltam ${formatarMoeda(Math.abs(troco))}.</span>`;
  } else {
    resultadoDiv.innerHTML = `<span class="troco">Troco: ${formatarMoeda(troco)}</span>`;
  }
}

// Função para adicionar item ao pedido
function adicionarAoPedido(nome, preco) {
  const itemExistente = pedido.find((item) => item.nome === nome);
  if (itemExistente) {
    itemExistente.quantidade++;
  } else {
    pedido.push({ nome, preco: parseFloat(preco), quantidade: 1 });
  }
  atualizarPedido();
}

// Função para remover item do pedido
function removerDoPedido(index) {
  if (pedido[index].quantidade > 1) {
    pedido[index].quantidade--;
  } else {
    pedido.splice(index, 1);
  }
  atualizarPedido();
}

// Função para atualizar a lista do pedido e o total
function atualizarPedido() {
  const listaPedido = document.getElementById("listaPedido");
  const subtotalEl = document.getElementById("subtotal");
  const totalContaEl = document.getElementById("totalConta");
  const descontoEl = document.getElementById("desconto");
  const totalComDescontoEl = document.getElementById("totalComDesconto");

  listaPedido.innerHTML = "";
  let subtotal = 0;

  pedido.forEach((item, index) => {
    const li = document.createElement("li");
    const itemTotal = item.preco * item.quantidade;
    subtotal += itemTotal;

    li.innerHTML = `
            <span>${item.nome} x${item.quantidade} - ${formatarMoeda(itemTotal)}</span>
            <button class="remove-btn" onclick="removerDoPedido(${index})">Remover</button>
        `;
    listaPedido.appendChild(li);
  });

  subtotalEl.textContent = `Subtotal: ${formatarMoeda(subtotal)}`;

  const descontoPercent = parseFloat(descontoEl.value) || 0;
  const descontoValor = subtotal * (descontoPercent / 100);
  const totalComDesconto = subtotal - descontoValor;

  totalComDescontoEl.textContent = `Total com Desconto: ${formatarMoeda(totalComDesconto)}`;
  totalContaEl.value = totalComDesconto.toFixed(2);
}

// Função para atualizar lista de vendas e total bruto
function atualizarVendas() {
  const listaVendas = document.getElementById("listaVendas");
  const totalBrutoEl = document.getElementById("totalBruto");

  listaVendas.innerHTML = "";
  let totalBruto = 0;

  vendasDia.forEach((venda, index) => {
    totalBruto += venda.total;
    const li = document.createElement("li");
    li.textContent = `${venda.data} - ${formatarMoeda(venda.total)} (${venda.tipoPagamento})`;
    listaVendas.appendChild(li);
  });

  totalBrutoEl.textContent = `Total Bruto: ${formatarMoeda(totalBruto)}`;
}

// Função para finalizar venda
function finalizarVenda() {
  console.log("Finalizando venda");
  if (pedido.length === 0) {
    alert("Adicione itens ao pedido antes de finalizar.");
    return;
  }

  const total = parseFloat(document.getElementById("totalConta").value);
  const desconto = parseFloat(document.getElementById("desconto").value) || 0;
  const tipoPagamento = document.getElementById("tipoPagamento").value;
  const dataISO = new Date().toISOString();
  const id = Date.now().toString(); // Gerar ID único

  const venda = {
    id,
    dataISO,
    total,
    desconto,
    tipoPagamento,
    itens: pedido.map((item) => ({
      produto: item.nome,
      quantidade: item.quantidade,
      preco: item.preco,
    })),
  };

  console.log("Enviando venda para o servidor:", venda);

  // Enviar para o backend
  fetch("http://localhost:3000/vendas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(venda),
  })
    .then((response) => {
      console.log("Resposta do servidor:", response.status);
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Venda salva com sucesso:", data);
      alert("Venda finalizada com sucesso!");
      // Limpar pedido e campos
      limparCampos();
      document.getElementById("tipoPagamento").value = "dinheiro";
      toggleValorPago();
      document.getElementById("resultado").innerHTML =
        '<span class="troco">Venda finalizada!</span>';
    })
    .catch((error) => {
      console.error("Erro ao finalizar venda:", error);
      alert(
        "Erro ao finalizar venda: " +
          error.message +
          "\n\nVerifique se o backend está rodando em http://localhost:3000",
      );
    });
}

// Função para limpar campos
function limparCampos() {
  pedido = [];
  atualizarPedido();
  document.getElementById("valorPago").value = "";
  document.getElementById("resultado").innerHTML = "";
  document.getElementById("tipoPagamento").value = "dinheiro";
  document.getElementById("desconto").value = "";
  toggleValorPago();
}

// Função para fechar modal de vendas
function fecharModalVendas() {
  document.getElementById("modalVendas").style.display = "none";
}

// Event listeners para botões de adicionar
document.querySelectorAll(".add-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const li = this.parentElement;
    const nome = li.textContent.split(" - ")[0].trim();
    const preco = this.getAttribute("data-preco");
    adicionarAoPedido(nome, preco);
  });
});

// Permitir calcular com Enter
document.getElementById("calcForm").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    calcularTroco();
  }
});
