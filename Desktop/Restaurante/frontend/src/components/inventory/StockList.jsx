import React from 'react';
import { Archive, Plus, ArrowDown, ArrowUp, AlertTriangle, Trash2 } from 'lucide-react';

const StockList = ({ items, onEntry, onExit }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Archive size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700">Estoque Vazio</h3>
        <p className="text-gray-500">Nenhum item cadastrado no sistema.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        const isLowStock = item.quantidade_atual <= item.estoque_minimo;
        
        return (
          <div 
            key={item.id} 
            className={`bg-white rounded-xl shadow-sm border p-4 transition-all hover:shadow-md ${
              isLowStock ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{item.nome}</h3>
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                  {item.unidade}
                </span>
              </div>
              {isLowStock && (
                <div className="bg-orange-100 text-orange-600 p-1.5 rounded-lg" title="Estoque Baixo">
                  <AlertTriangle size={18} />
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-800 flex items-baseline gap-1">
                {parseFloat(item.quantidade_atual).toLocaleString('pt-BR')} 
                <span className="text-sm font-normal text-gray-500">{item.unidade}</span>
              </div>
              {isLowStock && (
                <p className="text-xs text-orange-600 font-bold mt-1">
                  ⚠️ Mínimo: {item.estoque_minimo} {item.unidade}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onEntry(item)}
                className="flex items-center justify-center gap-1.5 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 py-2 rounded-lg font-semibold text-sm transition-colors border border-green-100"
              >
                <ArrowUp size={16} /> Entrada
              </button>
              <button 
                onClick={() => onExit(item)}
                className="flex items-center justify-center gap-1.5 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 py-2 rounded-lg font-semibold text-sm transition-colors border border-red-100"
              >
                <ArrowDown size={16} /> Saída
              </button>
            </div>
            
            <button
               onClick={() => {
                   if (window.confirm(`Tem certeza que deseja EXCLUIR "${item.nome}" do estoque? Esta ação não pode ser desfeita e apagará o histórico deste item.`)) {
                       fetch(`http://localhost:3000/estoque/${item.id}`, { method: 'DELETE' })
                           .then(res => res.json())
                           .then(data => {
                               if (data.success) {
                                   alert('Item excluído com sucesso');
                                   // Recarrega a página ou chama um callback se tivesse (o ideal era callback)
                                   // Como o pai gerencia o state, vamos forçar um reload simples ou pedir pro pai atualizar
                                   // O componente StockList recebe items como prop. O pai (Inventory) que tem que atualizar.
                                   // Mas o onEntry/onExit são as unicas props de ação. Vamos fazer um hack aqui ou adicionar onDelete prop?
                                   // Adicionar onDelete prop é o correto.
                                   window.location.reload(); 
                               } else {
                                   alert('Erro: ' + data.error);
                               }
                           })
                           .catch(err => alert('Erro na comunicação'));
                   }
               }}
               className="mt-3 w-full border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
            >
                <Trash2 size={14} /> Excluir Item
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default StockList;
