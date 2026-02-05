# 📊 Sistema de Gerência do Restaurante

## Visão Geral

A expansão do sistema agora inclui uma **aba de Gerência** completa, separada do Caixa. Esta seção permite análise histórica completa das vendas com filtros avançados, sem permitir apagamento de dados.

## 🏗️ Estrutura

### Frontend

```
.
├── index.html              # Página principal (Caixa) - Não alterada
├── gerencia.html           # Nova página de gerência
├── gerencia.js             # Lógica de análise e relatórios
├── gerencia.css            # Estilos da gerência
├── style.css               # Estilos globais (atualizado)
├── script.js               # Script do caixa (não alterado)
├── vendas.html             # Página de vendas do dia (não alterada)
└── vendas.js               # Script de vendas (atualizado)

backend/
├── index.js                # Backend (expandido com novas rotas)
├── database.js             # Banco de dados
└── package.json
```

## 🚀 Novas Funcionalidades

### 1. **Aba de Gerência** (`gerencia.html`)

Acesso exclusivo com **leitura apenas** - sem permissão de apagar ou modificar dados.

**Componentes:**

- **Filtros de Data:** Data início/fim e filtros rápidos (Hoje, Semana, Mês, Ano)
- **Resumo Financeiro:**
  - Faturamento total
  - Total de vendas
  - Ticket médio
  - Detalhamento por tipo de pagamento (Dinheiro, Cartão/PIX, Crédito)
- **Ranking de Produtos:** Top 10 produtos mais vendidos com visualização gráfica
- **Análise de Produtos:** Tabela detalhada com quantidade, valor e estatísticas
- **Detalhes de Vendas:** Lista completa de todas as transações do período

### 2. **Novas Rotas Backend**

#### GET `/vendas/filtro?dataInicio=&dataFim=`

Retorna vendas filtradas por intervalo de datas.

```
Query Parameters:
- dataInicio: Data ISO (ex: 2025-01-30T00:00:00Z)
- dataFim: Data ISO (ex: 2025-01-30T23:59:59Z)

Resposta:
[
  {
    "id": "unique_id",
    "dataISO": "2025-01-30T14:30:00Z",
    "total": 125.50,
    "tipoPagamento": "dinheiro",
    "itens": [
      {
        "produto": "Moqueca",
        "quantidade": 1,
        "preco": 30.00
      }
    ]
  }
]
```

#### GET `/relatorios/produtos?dataInicio=&dataFim=`

Retorna agregação de produtos vendidos.

```
Query Parameters:
- dataInicio: Data ISO
- dataFim: Data ISO

Resposta:
[
  {
    "produto": "Moqueca",
    "quantidade_total": 15,
    "valor_total": 450.00,
    "num_vendas": 12
  }
]
```

#### GET `/relatorios/resumo?dataInicio=&dataFim=`

Retorna resumo financeiro do período.

```
Query Parameters:
- dataInicio: Data ISO
- dataFim: Data ISO

Resposta:
{
  "total_vendas": 25,
  "faturamento_total": 1250.50,
  "ticket_medio": 50.02,
  "vendas_dinheiro": 15,
  "total_dinheiro": 750.00,
  "vendas_cartao": 8,
  "total_cartao": 400.00,
  "vendas_credito": 2,
  "total_credito": 100.50
}
```

## 🎯 Fluxo de Uso

### Caixa (index.html)

1. Selecione itens do cardápio
2. Configure desconto se necessário
3. Escolha tipo de pagamento
4. Finalize a venda
5. Acesse **"Vendas"** para histórico do dia
6. Acesse **"Gerência"** para análise completa

### Gerência (gerencia.html)

1. Escolha período (hoje, semana, mês, ano ou intervalo customizado)
2. Visualize resumo financeiro em tempo real
3. Analise ranking de produtos
4. Exporte insights de vendas
5. Nenhuma exclusão de dados é permitida

## 💾 Banco de Dados

Nenhuma alteração estrutural foi feita. As tabelas existentes são utilizadas:

- `vendas`: ID, dataISO, total, tipoPagamento
- `itens_venda`: venda_id, produto, quantidade, preco

## 🔒 Segurança

✅ **Nenhuma autenticação implementada** (conforme requisito)
✅ **Sem rota DELETE** na gerência
✅ **Leitura apenas** de dados históricos
✅ **Offline ready** para restaurante local

## 🎨 Design

- Interface limpa e responsiva
- Cards com gradientes para melhor visualização
- Tabelas com scroll para dados volumosos
- Adaptável para móvel e tablet

## 📱 Responsividade

- ✅ Desktop
- ✅ Tablet
- ✅ Mobile

## ⚙️ Como Usar

### 1. Iniciar o Backend

```bash
cd backend
npm install
node index.js
```

Servidor rodará em `http://localhost:3000`

### 2. Servir Frontend (Live Server)

```
http://127.0.0.1:5500/index.html
```

### 3. Acessar Gerência

Clique no botão **"⚙️ Gerência"** na página principal.

## 📊 Exemplos de Filtros

**Hoje:**

- Mostra todas as vendas de 00:00 até 23:59 do dia atual

**Últimos 7 dias:**

- Mostra vendas desde 7 dias atrás até hoje

**Este mês:**

- Mostra vendas do dia 1º até hoje do mês atual

**Mês anterior:**

- Mostra vendas do mês anterior (completo)

**Este ano:**

- Mostra vendas do ano atual (01/01 até hoje)

**Todas as vendas:**

- Remove filtros de data e mostra histórico completo

**Período customizado:**

- Selecione data início e data fim manualmente

## 🔧 Manutenção

### Adicionar novo produto

Os produtos são criados dinamicamente a partir das vendas no banco.

### Alterar períodos de filtro

Edite a função `obterDatasRapidas()` em `gerencia.js`

### Modificar layout

Atualize `gerencia.css` sem afetar o Caixa

## 📝 Notas Técnicas

- **Framework:** Vanilla JS (sem dependências)
- **Backend:** Node.js + Express + SQLite
- **CORS:** Habilitado para requisições do frontend
- **Data:** Utiliza ISO 8601 para consistência
- **Moeda:** Formatada em Real Brasileiro (pt-BR)

## ✨ Funcionalidades Futuras (Sugestões)

- [ ] Gráficos de tendências (Chart.js)
- [ ] Exportar relatórios em PDF
- [ ] Autenticação de usuários
- [ ] Sistema de permissões
- [ ] Controle de estoque
- [ ] Histórico de modificações
- [ ] Backup automático

## 📄 Licença

Sistema interno para restaurante local. Uso exclusivo.
