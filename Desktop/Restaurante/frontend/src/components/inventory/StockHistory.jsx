import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StockHistory = ({ movements }) => {
  if (movements.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        Nenhuma movimentação registrada.
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
      {movements.slice(0, 50).map((mov, index) => {
        const isEntry = mov.tipo === 'entrada';
        return (
          <div 
            key={index} 
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              isEntry ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'
            }`}
          >
            <div className={`p-2 rounded-full shrink-0 ${
              isEntry ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {isEntry ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-800 truncate">{mov.nome}</h4>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                  {new Date(mov.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-lg font-bold ${isEntry ? 'text-green-700' : 'text-red-700'}`}>
                  {isEntry ? '+' : '-'}{parseFloat(mov.quantidade).toLocaleString('pt-BR')}
                </span>
              </div>

              {mov.motivo && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  <span className="font-medium mr-1">Motivo:</span>
                  {mov.motivo}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StockHistory;
