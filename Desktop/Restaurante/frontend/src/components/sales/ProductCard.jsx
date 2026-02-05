import React from 'react';
import { Plus } from 'lucide-react';

const ProductCard = ({ product, onAdd }) => {
  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div 
      onClick={() => onAdd(product)}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group flex flex-col justify-between h-full"
    >
      <div>
        <h4 className="font-semibold text-gray-800 group-hover:text-primary transition-colors">{product.name}</h4>
        <p className="text-primary font-bold mt-1">{formatMoney(product.price)}</p>
      </div>
      <button 
        className="mt-3 w-full bg-gray-50 text-gray-600 hover:bg-primary hover:text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 group-hover:bg-primary group-hover:text-white"
        onClick={(e) => {
          e.stopPropagation();
          onAdd(product);
        }}
      >
        <Plus size={16} /> Adicionar
      </button>
    </div>
  );
};

export default ProductCard;
