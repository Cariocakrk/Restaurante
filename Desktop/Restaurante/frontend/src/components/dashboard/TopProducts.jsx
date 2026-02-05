import React from 'react';

const TopProducts = ({ produtos }) => {
  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  
  const top10 = produtos.slice(0, 10);
  const maxQty = top10[0]?.quantidade_total || 1;

  if (produtos.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Ranking de Produtos</h3>
        <p className="text-gray-500 text-center py-8">Nenhum produto vendido no período.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Ranking de Produtos</h3>
      <div className="space-y-4">
        {top10.map((produto, index) => (
          <div key={index} className="relative">
            <div className="flex justify-between items-center mb-1 text-sm z-10 relative">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-400 w-6">#{index + 1}</span>
                <span className="font-medium text-gray-800">{produto.produto}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-800">{produto.quantidade_total} un</span>
                <span className="text-gray-400 text-xs ml-2">({formatMoney(produto.valor_total)})</span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/60 rounded-full"
                style={{ width: `${(produto.quantidade_total / maxQty) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts;
