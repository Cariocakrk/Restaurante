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

  // Inserir usuário padrão se não existir
  const username = "admin";
  const password = "31673167";

  db.get(
    "SELECT * FROM usuarios WHERE username = ?",
    [username],
    (err, row) => {
      if (!row) {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            console.error("Erro ao fazer hash da senha:", err);
          } else {
            db.run(
              "INSERT INTO usuarios (username, password_hash) VALUES (?, ?)",
              [username, hash],
              (err) => {
                if (!err) {
                  console.log("Usuário admin criado com sucesso");
                }
              },
            );
          }
        });
      }
    },
  );
});

module.exports = db;
