import React from 'react';

const RecentSales = ({ vendas }) => {
  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  const formatDate = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  if (vendas.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Últimas Vendas</h3>
        <p className="text-gray-500 text-center py-8">Nenhuma venda registrada no período.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Últimas Vendas</h3>
      <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[500px]">
        <div className="space-y-3">
          {vendas.slice(0, 50).map((venda) => (
            <div key={venda.id} className="p-4 rounded-xl border-l-4 border-primary bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-200 group">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-semibold text-gray-400 block mb-1">{formatDate(venda.dataISO)}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                    venda.tipoPagamento === 'dinheiro' ? 'bg-green-100 text-green-700' :
                    venda.tipoPagamento === 'cartao' ? 'bg-teal-100 text-teal-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {venda.tipoPagamento}
                  </span>
                </div>
                <span className="text-lg font-bold text-primary">{formatMoney(venda.total)}</span>
              </div>
              <ul className="space-y-1 mt-3 border-t border-gray-100 pt-2">
                {venda.itens.map((item, idx) => (
                  <li key={idx} className="text-xs text-text-medium flex justify-between">
                    <span>{item.produto}</span>
                    <span className="text-gray-400">x{item.quantidade}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentSales;
