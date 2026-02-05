const sqlite3 = require("sqlite3").verbose();

const bcrypt = require("bcrypt");
// Conectar ao banco de dados (cria se não existir)
const db = new sqlite3.Database("./restaurante.db", (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("Conectado ao banco de dados SQLite.");
  }
});

// Criar tabelas se não existirem
db.serialize(() => {
  // Tabela vendas
  db.run(`
    CREATE TABLE IF NOT EXISTS vendas (
      id TEXT PRIMARY KEY,
      dataISO TEXT,
      total REAL,
      tipoPagamento TEXT,
      desconto REAL DEFAULT 0,
      ativo INTEGER DEFAULT 1
    )
  `);

  // Adicionar coluna ativo se não existir (para BDs antigos)
  db.run(
    `
    ALTER TABLE vendas ADD COLUMN ativo INTEGER DEFAULT 1
  `,
    (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Erro ao adicionar coluna ativo:", err);
      }
    },
  );

  // Tabela itens_venda
  db.run(`
    CREATE TABLE IF NOT EXISTS itens_venda (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venda_id TEXT,
      produto TEXT,
      quantidade INTEGER,
      preco REAL,
      FOREIGN KEY (venda_id) REFERENCES vendas (id)
    )
  `);

  // Tabela usuarios para autenticação
  db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

  // Tabela estoque
  db.run(`
    CREATE TABLE IF NOT EXISTS estoque (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      unidade TEXT NOT NULL,
      quantidade_atual REAL DEFAULT 0,
      estoque_minimo REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela movimentacoes_estoque (histórico - NUNCA deletar)
  db.run(`
    CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      estoque_id INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      quantidade REAL NOT NULL,
      motivo TEXT,
      data DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (estoque_id) REFERENCES estoque (id)
    )
  `);

  // Tabela produtos (NOVO)
  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      preco REAL NOT NULL,
      categoria TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela promocoes
  db.run(`
    CREATE TABLE IF NOT EXISTS promocoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      desconto REAL DEFAULT 0,
      ativa INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Inserir usuário padrão se não existir
  const users = [
    { username: "admin", password: "31673167" },
    { username: "dev", password: "0078910" } // Senha do usuário Dev
  ];

  users.forEach(u => {
    db.get(
      "SELECT * FROM usuarios WHERE username = ?",
      [u.username],
      (err, row) => {
        if (!row) {
          bcrypt.hash(u.password, 10, (err, hash) => {
            if (err) {
              console.error(`Erro ao fazer hash da senha para ${u.username}:`, err);
            } else {
              db.run(
                "INSERT INTO usuarios (username, password_hash) VALUES (?, ?)",
                [u.username, hash],
                (err) => {
                  if (!err) {
                    console.log(`Usuário ${u.username} criado com sucesso`);
                  }
                },
              );
            }
          });
        }
      },
    );
  });

  // Seed de produtos iniciais (se tabela vazia)
  db.get("SELECT COUNT(*) as count FROM produtos", (err, row) => {
    if (row && row.count === 0) {
      console.log("Seeding inicial de produtos...");
      const MENU_ITEMS = {
        "Pratos": [
          { name: "Feijoada", price: 25.00 },
          { name: "Moqueca", price: 30.00 },
          { name: "Churrasco", price: 35.00 },
          { name: "Lasanha", price: 28.00 },
          { name: "Strogonoff", price: 32.00 },
          { name: "Picanha", price: 40.00 },
          { name: "Frango Grelhado", price: 22.00 },
          { name: "Peixe Assado", price: 38.00 },
        ],
        "Salgados": [
          { name: "Coxinha", price: 5.00 },
          { name: "Empada", price: 6.00 },
          { name: "Pastel", price: 4.50 },
          { name: "Esfiha", price: 5.50 },
          { name: "Kibe", price: 6.50 },
          { name: "Bolinha de Queijo", price: 4.00 },
          { name: "Rissole", price: 5.50 },
          { name: "Enroladinho", price: 4.50 },
        ],
        "Bebidas": [
          { name: "Coca-Cola 350ml", price: 4.00 },
          { name: "Suco de Laranja", price: 5.00 },
          { name: "Água", price: 2.00 },
          { name: "Cerveja 600ml", price: 8.00 },
          { name: "Refrigerante 2L", price: 6.00 },
          { name: "Chá Gelado", price: 4.50 },
          { name: "Vinho Tinto", price: 15.00 },
          { name: "Café", price: 3.00 },
        ],
        "Acompanhantes": [
          { name: "Arroz", price: 3.00 },
          { name: "Feijão", price: 3.00 },
          { name: "Salada", price: 4.00 },
          { name: "Batata Frita", price: 5.00 },
          { name: "Farofa", price: 2.50 },
          { name: "Torradas", price: 3.50 },
          { name: "Molho", price: 2.00 },
          { name: "Queijo Ralado", price: 2.50 },
        ]
      };

      const stmt = db.prepare("INSERT INTO produtos (nome, preco, categoria) VALUES (?, ?, ?)");
      Object.entries(MENU_ITEMS).forEach(([categoria, items]) => {
        items.forEach(item => {
          stmt.run([item.name, item.price, categoria]);
        });
      });
      stmt.finalize(() => console.log("Produtos inseridos com sucesso!"));
    }
  });
});

module.exports = db;
