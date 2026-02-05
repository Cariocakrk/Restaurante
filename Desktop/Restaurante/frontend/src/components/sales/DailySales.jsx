import React from 'react';
import { Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';

const DailySales = ({ vendas, onClose, onClear }) => {
  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Calculate summaries
  const totalBruto = vendas.reduce((acc, v) => acc + v.total, 0);
  
  const stats = vendas.reduce((acc, v) => {
    if (!acc[v.tipoPagamento]) {
      acc[v.tipoPagamento] = { total: 0, count: 0 };
    }
    acc[v.tipoPagamento].total += v.total;
    acc[v.tipoPagamento].count += 1;
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-primary p-6 text-white flex justify-between items-center shadow-md z-10">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Vendas do Dia
            </h2>
            <p className="opacity-90 text-sm">Acompanhe todas as vendas em tempo real</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-primary text-white p-4 rounded-xl shadow-lg shadow-primary/20">
              <span className="text-xs font-bold uppercase tracking-wider block mb-1 opacity-80">Total Bruto</span>
              <span className="text-xl font-bold block">{formatMoney(totalBruto)}</span>
            </div>
            
            <div className="bg-green-600 text-white p-4 rounded-xl shadow-lg shadow-green-600/20">
              <span className="text-xs font-bold uppercase tracking-wider block mb-1 opacity-80">Dinheiro</span>
              <span className="text-xl font-bold block">{formatMoney(stats['dinheiro']?.total || 0)}</span>
              <span className="text-xs opacity-80">{stats['dinheiro']?.count || 0} vendas</span>
            </div>
            
            <div className="bg-teal-600 text-white p-4 rounded-xl shadow-lg shadow-teal-600/20">
              <span className="text-xs font-bold uppercase tracking-wider block mb-1 opacity-80">Cartão/PIX</span>
              <span className="text-xl font-bold block">{formatMoney(stats['cartao']?.total || 0)}</span>
              <span className="text-xs opacity-80">{stats['cartao']?.count || 0} vendas</span>
            </div>
            
            <div className="bg-orange-500 text-white p-4 rounded-xl shadow-lg shadow-orange-500/20">
              <span className="text-xs font-bold uppercase tracking-wider block mb-1 opacity-80">Crédito</span>
              <span className="text-xl font-bold block">{formatMoney(stats['credito']?.total || 0)}</span>
              <span className="text-xs opacity-80">{stats['credito']?.count || 0} vendas</span>
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
               <h3 className="font-bold text-gray-800">Histórico Recente</h3>
            </div>
            {vendas.length === 0 ? (
               <div className="p-8 text-center text-gray-400">
                  Nenhuma venda registrada hoje.
               </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {vendas.map((venda) => (
                  <li key={venda.id} className="p-4 hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-primary">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-gray-500 font-medium block mb-1">
                          {new Date(venda.dataISO).toLocaleTimeString()}
                        </span>
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-gray-800 text-lg">{formatMoney(venda.total)}</span>
                           <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide border ${
                             venda.tipoPagamento === 'dinheiro' ? 'bg-green-50 text-green-700 border-green-100' :
                             venda.tipoPagamento === 'cartao' ? 'bg-teal-50 text-teal-700 border-teal-100' :
                             'bg-orange-50 text-orange-700 border-orange-100'
                           }`}>
                             {venda.tipoPagamento}
                           </span>
                           {venda.desconto > 0 && (
                             <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                               -{venda.desconto}% Desc
                             </span>
                           )}
                        </div>
                      </div>
                      {/* Can add expand details here later if needed */}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-gray-100">
          <button 
            onClick={onClear}
            className="w-full flex items-center justify-center gap-2 border-2 border-red-500 text-red-600 hover:bg-red-50 py-3 rounded-xl font-bold transition-all"
          >
            <Trash2 size={20} /> Limpar Vendas do Dia
          </button>
           <p className="text-xs text-center text-gray-400 mt-3">
             <AlertTriangle size={12} className="inline mr-1" />
             Isso limpará apenas a visualização. Dados permanecem no banco.
           </p>
        </div>
      </div>
    </div>
  );
};

export default DailySales;
