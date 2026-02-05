import React from 'react';

const CategoryRanking = ({ categories }) => {
  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  // Checks if there are any items in any category
  const hasItems = Object.values(categories).some(items => items && items.length > 0);

  if (!hasItems) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
         <h3 className="font-bold text-gray-800 text-lg mb-4">Ranking por Categoria</h3>
         <div className="flex items-center justify-center h-40 text-gray-400">
           Nenhum dado disponível
         </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full overflow-hidden flex flex-col">
      <h3 className="font-bold text-gray-800 text-lg mb-4">Ranking por Categoria</h3>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
        {Object.entries(categories).map(([category, items]) => {
          if (!items || items.length === 0) return null;
          
          const totalCategory = items.reduce((acc, item) => acc + item.total_vendas, 0);
          
          return (
            <div key={category}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-gray-700">{category}</h4>
                <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {formatMoney(totalCategory)}
                </span>
              </div>
              
              <div className="space-y-2">
                {items.slice(0, 3).map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                         <span className="text-gray-400 font-mono w-4">{idx + 1}.</span>
                         <span className="text-gray-600 truncate max-w-[150px]">{item.produto}</span>
                      </div>
                      <div className="flex gap-3 text-xs">
                         <span className="text-gray-500">{item.total_quantidade} un</span>
                         <span className="font-medium text-gray-700">{formatMoney(item.total_vendas)}</span>
                      </div>
                   </div>
                ))}
                {items.length > 3 && (
                   <p className="text-xs text-center text-gray-400 mt-1 italic">
                     + {items.length - 3} outros itens
                   </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryRanking;
