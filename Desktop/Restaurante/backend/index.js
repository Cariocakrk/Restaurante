const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Liberar CORS para acesso do front-end
app.use(express.json()); // Para parsear JSON no body das requisições

// Rota POST /vendas - Recebe uma venda completa e salva no banco
app.post("/vendas", (req, res) => {
  const { id, dataISO, total, tipoPagamento, desconto, itens } = req.body;

  console.log("Recebendo venda:", {
    id,
    dataISO,
    total,
    desconto,
    tipoPagamento,
    itensCount: itens?.length,
  });

  // Validar dados
  if (
    !id ||
    !dataISO ||
    total === undefined ||
    !tipoPagamento ||
    !itens ||
    !Array.isArray(itens)
  ) {
    return res.status(400).json({ error: "Dados de venda inválidos" });
  }

  // Inserir venda na tabela vendas
  const sqlVenda = `INSERT INTO vendas (id, dataISO, total, tipoPagamento, desconto) VALUES (?, ?, ?, ?, ?)`;
  db.run(
    sqlVenda,
    [id, dataISO, total, tipoPagamento, desconto || 0],
    function (err) {
      if (err) {
        console.error("Erro ao salvar venda:", err);
        return res
          .status(500)
          .json({ error: "Erro ao salvar venda: " + err.message });
      }

      console.log("Venda inserida com ID:", id);

      // Inserir itens na tabela itens_venda
      const vendaId = id;
      let completed = 0;
      const totalItens = itens.length;

      if (totalItens === 0) {
        console.log("Venda salva sem itens");
        return res.status(201).json({ message: "Venda salva sem itens." });
      }

      itens.forEach((item) => {
        const sqlItem = `INSERT INTO itens_venda (venda_id, produto, quantidade, preco) VALUES (?, ?, ?, ?)`;
        db.run(
          sqlItem,
          [vendaId, item.produto, item.quantidade, item.preco],
          function (err) {
            if (err) {
              console.error("Erro ao salvar item:", err);
              return res
                .status(500)
                .json({ error: "Erro ao salvar item: " + err.message });
            }
            completed++;
            console.log(`Item inserido (${completed}/${totalItens})`);
            if (completed === totalItens) {
              console.log("Venda completa salva com sucesso");
              res
                .status(201)
                .json({ message: "Venda e itens salvos com sucesso." });
            }
          },
        );
      });
    },
  );
});

// Rota GET /vendas - Retorna apenas as vendas ATIVAS do dia com seus itens
app.get("/vendas", (req, res) => {
  // Obter data de hoje em formato ISO (YYYY-MM-DD)
  const hoje = new Date().toISOString().split("T")[0];

  const sql = `
    SELECT v.id, v.dataISO, v.total, v.tipoPagamento, v.desconto, v.ativo,
           i.produto, i.quantidade, i.preco
    FROM vendas v
    LEFT JOIN itens_venda i ON v.id = i.venda_id
    WHERE DATE(v.dataISO) = ? AND v.ativo = 1
    ORDER BY v.dataISO DESC
  `;

  db.all(sql, [hoje], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Erro ao consultar vendas: " + err.message });
    }

    // Agrupar itens por venda
    const vendas = {};
    rows.forEach((row) => {
      if (!vendas[row.id]) {
        vendas[row.id] = {
          id: row.id,
          dataISO: row.dataISO,
          total: row.total,
          tipoPagamento: row.tipoPagamento,
          desconto: row.desconto || 0,
          itens: [],
        };
      }
      if (row.produto) {
        vendas[row.id].itens.push({
          produto: row.produto,
          quantidade: row.quantidade,
          preco: row.preco,
        });
      }
    });

    res.json(Object.values(vendas));
  });
});

// Rota GET /vendas com filtros de data - Retorna vendas filtradas
app.get("/vendas/filtro", (req, res) => {
  let { dataInicio, dataFim } = req.query;

  // Se não houver filtros, usar padrão do mês atual
  if (!dataInicio || !dataFim) {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(
      hoje.getFullYear(),
      hoje.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    dataInicio = dataInicio || primeiroDia.toISOString();
    dataFim = dataFim || ultimoDia.toISOString();
  }

  let sql = `
    SELECT v.id, v.dataISO, v.total, v.tipoPagamento,
           i.produto, i.quantidade, i.preco
    FROM vendas v
    LEFT JOIN itens_venda i ON v.id = i.venda_id
    WHERE 1=1
  `;
  const params = [];

  // Aplicar filtros de data
  if (dataInicio) {
    sql += ` AND v.dataISO >= ?`;
    params.push(dataInicio);
  }
  if (dataFim) {
    sql += ` AND v.dataISO <= ?`;
    params.push(dataFim);
  }

  sql += ` ORDER BY v.dataISO DESC LIMIT 1000`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Erro ao consultar vendas: " + err.message });
    }

    // Agrupar itens por venda
    const vendas = {};
    rows.forEach((row) => {
      if (!vendas[row.id]) {
        vendas[row.id] = {
          id: row.id,
          dataISO: row.dataISO,
          total: row.total,
          tipoPagamento: row.tipoPagamento,
          itens: [],
        };
      }
      if (row.produto) {
        vendas[row.id].itens.push({
          produto: row.produto,
          quantidade: row.quantidade,
          preco: row.preco,
        });
      }
    });

    res.json(Object.values(vendas));
  });
});

// Rota GET /relatorios/produtos - Retorna agregação de produtos com filtro de data
app.get("/relatorios/produtos", (req, res) => {
  const { dataInicio, dataFim } = req.query;

  let sql = `
    SELECT 
      i.produto,
      SUM(i.quantidade) as quantidade_total,
      SUM(i.quantidade * i.preco) as valor_total,
      COUNT(DISTINCT v.id) as num_vendas
    FROM itens_venda i
    JOIN vendas v ON i.venda_id = v.id
    WHERE 1=1
  `;
  const params = [];

  // Aplicar filtros de data se fornecidos
  if (dataInicio) {
    sql += ` AND v.dataISO >= ?`;
    params.push(dataInicio);
  }
  if (dataFim) {
    sql += ` AND v.dataISO <= ?`;
    params.push(dataFim);
  }

  sql += ` GROUP BY i.produto ORDER BY quantidade_total DESC`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Erro ao consultar produtos: " + err.message });
    }

    res.json(rows);
  });
});

// Rota GET /relatorios/resumo - Retorna resumo financeiro com filtro de data
app.get("/relatorios/resumo", (req, res) => {
  const { dataInicio, dataFim } = req.query;

  let sql = `
    SELECT 
      COUNT(DISTINCT v.id) as total_vendas,
      SUM(v.total) as faturamento_total,
      AVG(v.total) as ticket_medio,
      COUNT(DISTINCT CASE WHEN v.tipoPagamento = 'dinheiro' THEN v.id END) as vendas_dinheiro,
      SUM(CASE WHEN v.tipoPagamento = 'dinheiro' THEN v.total ELSE 0 END) as total_dinheiro,
      COUNT(DISTINCT CASE WHEN v.tipoPagamento = 'cartao' THEN v.id END) as vendas_cartao,
      SUM(CASE WHEN v.tipoPagamento = 'cartao' THEN v.total ELSE 0 END) as total_cartao,
      COUNT(DISTINCT CASE WHEN v.tipoPagamento = 'credito' THEN v.id END) as vendas_credito,
      SUM(CASE WHEN v.tipoPagamento = 'credito' THEN v.total ELSE 0 END) as total_credito
    FROM vendas v
    WHERE 1=1
  `;
  const params = [];

  // Aplicar filtros de data se fornecidos
  if (dataInicio) {
    sql += ` AND v.dataISO >= ?`;
    params.push(dataInicio);
  }
  if (dataFim) {
    sql += ` AND v.dataISO <= ?`;
    params.push(dataFim);
  }

  db.get(sql, params, (err, row) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Erro ao consultar resumo: " + err.message });
    }

    res.json(
      row || {
        total_vendas: 0,
        faturamento_total: 0,
        ticket_medio: 0,
        vendas_dinheiro: 0,
        total_dinheiro: 0,
        vendas_cartao: 0,
        total_cartao: 0,
        vendas_credito: 0,
        total_credito: 0,
      },
    );
  });
});

// ========================================
// AUTENTICAÇÃO
// ========================================

// Rota POST /login - Valida usuário e retorna sucesso
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Usuário e senha são obrigatórios" });
  }

  // Buscar usuário no banco
  db.get(
    "SELECT * FROM usuarios WHERE username = ?",
    [username],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao consultar usuário" });
      }

      if (!user) {
        return res.status(401).json({ error: "Usuário ou senha inválidos" });
      }

      // Comparar senha com hash
      bcrypt.compare(password, user.password_hash, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ error: "Erro ao validar senha" });
        }

        if (!isMatch) {
          return res.status(401).json({ error: "Usuário ou senha inválidos" });
        }

        // Login bem-sucedido
        res.json({
          success: true,
          message: "Login realizado com sucesso",
          user: {
            id: user.id,
            username: user.username,
          },
        });
      });
    },
  );
});

// Rota DELETE /limpar-vendas - Marca vendas do dia como inativas (sem deletar)
app.delete("/limpar-vendas", (req, res) => {
  const { senha } = req.body;

  // Validar senha
  if (!senha || senha !== "DOOMSDAY") {
    console.error("Tentativa de limpeza com senha inválida:", senha);
    return res.status(401).json({ error: "Senha incorreta" });
  }

  // Obter data de hoje em formato ISO (YYYY-MM-DD)
  const hoje = new Date().toISOString().split("T")[0];
  console.log("Marcando vendas de hoje como inativas:", hoje);

  // Marcar vendas do dia como inativas (não deleta, apenas marca)
  db.run(
    `UPDATE vendas SET ativo = 0 WHERE DATE(dataISO) = ?`,
    [hoje],
    function (err) {
      if (err) {
        console.error("Erro ao marcar vendas como inativas:", err);
        return res.status(500).json({
          error: "Erro ao limpar vendas: " + err.message,
        });
      }

      console.log("Vendas do dia marcadas como inativas com sucesso");
      res.status(200).json({
        message:
          "Vendas do dia limpas da visualização. Os dados permanecem no banco para relatórios.",
      });
    },
  );
});

// Rota GET /relatorios/produtos-categorias - Retorna produtos agrupados por categoria
app.get("/relatorios/produtos-categorias", (req, res) => {
  // Desabilitar cache para garantir que sempre retorna dados atualizados
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  const { dataInicio, dataFim } = req.query;

  let sql = `
    SELECT 
      produto,
      SUM(quantidade) as total_quantidade,
      ROUND(SUM(quantidade * preco), 2) as total_vendas,
      COUNT(DISTINCT venda_id) as num_vendas
    FROM itens_venda
    JOIN vendas ON itens_venda.venda_id = vendas.id
    WHERE produto IS NOT NULL
  `;

  const params = [];

  if (dataInicio) {
    sql += ` AND vendas.dataISO >= ?`;
    params.push(dataInicio);
  }

  if (dataFim) {
    sql += ` AND vendas.dataISO <= ?`;
    params.push(dataFim);
  }

  sql += ` GROUP BY produto ORDER BY total_quantidade DESC`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error("Erro ao consultar produtos:", err);
      return res.status(500).json({
        error: "Erro ao consultar produtos: " + err.message,
      });
    }

    // Se não há dados, retornar categorias vazias
    if (!rows || rows.length === 0) {
      return res.status(200).json({
        Bebidas: [],
        Acompanhantes: [],
        "Pratos Principais": [],
        Sobremesas: [],
        Outros: [],
      });
    }

    // Agrupar produtos por categoria baseado no padrão de nomenclatura
    const categorias = {
      Bebidas: [],
      Acompanhantes: [],
      "Pratos Principais": [],
      Sobremesas: [],
      Outros: [],
    };

    rows.forEach((produto) => {
      const nome = produto.produto ? produto.produto.toLowerCase() : "";

      if (
        nome.includes("suco") ||
        nome.includes("refrigerante") ||
        nome.includes("cerveja") ||
        nome.includes("vinho") ||
        nome.includes("água") ||
        nome.includes("chá") ||
        nome.includes("café") ||
        nome.includes("bebida")
      ) {
        categorias["Bebidas"].push(produto);
      } else if (
        nome.includes("batata") ||
        nome.includes("fritas") ||
        nome.includes("acompanhante") ||
        nome.includes("arroz") ||
        nome.includes("feijão") ||
        nome.includes("pão")
      ) {
        categorias["Acompanhantes"].push(produto);
      } else if (
        nome.includes("prato") ||
        nome.includes("carne") ||
        nome.includes("frango") ||
        nome.includes("peixe") ||
        nome.includes("macarrão") ||
        nome.includes("risoto")
      ) {
        categorias["Pratos Principais"].push(produto);
      } else if (
        nome.includes("sobremesa") ||
        nome.includes("bolo") ||
        nome.includes("sorvete") ||
        nome.includes("pudim") ||
        nome.includes("mousse")
      ) {
        categorias["Sobremesas"].push(produto);
      } else {
        categorias["Outros"].push(produto);
      }
    });

    res.status(200).json(categorias);
  });
});

// ===========================
// ROTAS DE ESTOQUE
// ===========================

// POST /estoque - Criar novo item de estoque
app.post("/estoque", (req, res) => {
  const { nome, unidade, quantidade_inicial, estoque_minimo } = req.body;

  if (!nome || !unidade) {
    return res.status(400).json({ error: "Nome e unidade são obrigatórios" });
  }

  const sql = `
    INSERT INTO estoque (nome, unidade, quantidade_atual, estoque_minimo)
    VALUES (?, ?, ?, ?)
  `;

  db.run(
    sql,
    [nome, unidade, quantidade_inicial || 0, estoque_minimo || 0],
    function (err) {
      if (err) {
        console.error("Erro ao criar item de estoque:", err);
        return res
          .status(500)
          .json({ error: "Erro ao criar item: " + err.message });
      }

      const novoId = this.lastID;

      // Se houver quantidade inicial, registrar movimentação
      if (quantidade_inicial && quantidade_inicial > 0) {
        db.run(
          `INSERT INTO movimentacoes_estoque (estoque_id, tipo, quantidade, motivo)
           VALUES (?, ?, ?, ?)`,
          [novoId, "entrada", quantidade_inicial, "Estoque inicial"],
          (err) => {
            if (err) console.error("Erro ao registrar movimentação:", err);
          },
        );
      }

      console.log("Item de estoque criado:", novoId);
      res.status(201).json({ id: novoId, nome, unidade });
    },
  );
});

// GET /estoque - Listar todos os itens
app.get("/estoque", (req, res) => {
  const sql = `
    SELECT id, nome, unidade, quantidade_atual, estoque_minimo, created_at
    FROM estoque
    ORDER BY nome ASC
  `;

  db.all(sql, (err, rows) => {
    if (err) {
      console.error("Erro ao listar estoque:", err);
      return res.status(500).json({ error: "Erro ao listar estoque" });
    }

    res.json(rows);
  });
});

// GET /estoque/movimentacoes - Histórico completo de movimentações (DEVE VIR ANTES de /estoque/:id)
app.get("/estoque/movimentacoes", (req, res) => {
  console.log("📋 Requisição para /estoque/movimentacoes");
  const { estoque_id } = req.query;

  let sql = `
    SELECT m.id, m.estoque_id, e.nome, m.tipo, m.quantidade, m.motivo, m.data
    FROM movimentacoes_estoque m
    JOIN estoque e ON m.estoque_id = e.id
    WHERE 1=1
  `;

  const params = [];

  if (estoque_id) {
    sql += ` AND m.estoque_id = ?`;
    params.push(estoque_id);
  }

  sql += ` ORDER BY m.data DESC LIMIT 1000`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error("❌ Erro ao listar movimentações:", err);
      return res.status(500).json({ error: "Erro ao listar movimentações" });
    }

    console.log("✅ Retornando", rows ? rows.length : 0, "movimentações");
    if (rows && rows.length > 0) {
      console.log("📊 Primeiras 3 movimentações:", rows.slice(0, 3));
    }
    res.json(rows || []);
  });
});

// GET /estoque/:id - Obter detalhes de um item
app.get("/estoque/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT id, nome, unidade, quantidade_atual, estoque_minimo, created_at
    FROM estoque
    WHERE id = ?
  `;

  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao consultar estoque" });
    }

    if (!row) {
      return res.status(404).json({ error: "Item não encontrado" });
    }

    res.json(row);
  });
});

// PUT /estoque/:id/entrada - Adicionar quantidade (entrada)
app.put("/estoque/:id/entrada", (req, res) => {
  const { id } = req.params;
  const { quantidade, motivo } = req.body;

  if (!quantidade || quantidade <= 0) {
    return res.status(400).json({ error: "Quantidade deve ser maior que 0" });
  }

  // Atualizar quantidade_atual
  const sqlUpdate = `UPDATE estoque SET quantidade_atual = quantidade_atual + ? WHERE id = ?`;

  db.run(sqlUpdate, [quantidade, id], function (err) {
    if (err) {
      console.error("Erro ao atualizar estoque:", err);
      return res.status(500).json({ error: "Erro ao atualizar estoque" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Item não encontrado" });
    }

    // Registrar movimentação
    const sqlMov = `
      INSERT INTO movimentacoes_estoque (estoque_id, tipo, quantidade, motivo)
      VALUES (?, ?, ?, ?)
    `;

    db.run(sqlMov, [id, "entrada", quantidade, motivo || ""], (err) => {
      if (err) console.error("Erro ao registrar movimentação:", err);
    });

    console.log(`Entrada de ${quantidade} registrada para item ${id}`);
    res.json({ success: true, message: "Entrada registrada com sucesso" });
  });
});

// PUT /estoque/:id/saida - Remover quantidade (saída)
app.put("/estoque/:id/saida", (req, res) => {
  const { id } = req.params;
  const { quantidade, motivo } = req.body;

  if (!quantidade || quantidade <= 0) {
    return res.status(400).json({ error: "Quantidade deve ser maior que 0" });
  }

  // Verificar se há quantidade suficiente
  const sqlCheck = `SELECT quantidade_atual FROM estoque WHERE id = ?`;

  db.get(sqlCheck, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao consultar estoque" });
    }

    if (!row) {
      return res.status(404).json({ error: "Item não encontrado" });
    }

    if (row.quantidade_atual - quantidade < 0) {
      return res.status(400).json({
        error: `Quantidade insuficiente. Disponível: ${row.quantidade_atual}`,
      });
    }

    // Atualizar quantidade_atual
    const sqlUpdate = `UPDATE estoque SET quantidade_atual = quantidade_atual - ? WHERE id = ?`;

    db.run(sqlUpdate, [quantidade, id], function (err) {
      if (err) {
        console.error("Erro ao atualizar estoque:", err);
        return res.status(500).json({ error: "Erro ao atualizar estoque" });
      }

      // Registrar movimentação
      const sqlMov = `
        INSERT INTO movimentacoes_estoque (estoque_id, tipo, quantidade, motivo)
        VALUES (?, ?, ?, ?)
      `;

      db.run(sqlMov, [id, "saida", quantidade, motivo || ""], (err) => {
        if (err) console.error("Erro ao registrar movimentação:", err);
      });

      console.log(`Saída de ${quantidade} registrada para item ${id}`);
      res.json({ success: true, message: "Saída registrada com sucesso" });
    });
  });
});

// Rota raiz
app.get("/", (req, res) => {
  res.json({ message: "Servidor do Restaurante rodando", status: "ok" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
