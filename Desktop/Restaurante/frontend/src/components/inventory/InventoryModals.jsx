import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const ModalBase = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-lg text-gray-800">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  </div>
);

export const NewItemModal = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSubmit({
      nome: formData.get('nome'),
      unidade: formData.get('unidade'),
      quantidade_inicial: parseFloat(formData.get('quantidade')) || 0,
      estoque_minimo: parseFloat(formData.get('minimo')) || 0
    });
  };

  return (
    <ModalBase title="Novo Item de Estoque" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Item</label>
          <input name="nome" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Ex: Arroz" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
          <select name="unidade" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white">
            <option value="kg">Quilograma (kg)</option>
            <option value="g">Grama (g)</option>
            <option value="l">Litro (l)</option>
            <option value="ml">Mililitro (ml)</option>
            <option value="unidade">Unidade</option>
            <option value="dúzia">Dúzia</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qtd. Inicial</label>
            <input type="number" name="quantidade" step="0.01" min="0" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo</label>
            <input type="number" name="minimo" step="0.01" min="0" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="0" />
          </div>
        </div>
        <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors flex justify-center items-center gap-2 mt-2">
          <Save size={18} /> Criar Item
        </button>
      </form>
    </ModalBase>
  );
};

export const MovementModal = ({ isOpen, onClose, onSubmit, type, item }) => {
  if (!isOpen || !item) return null;

  const isEntry = type === 'entrada';

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const motivo = formData.get('motivo');
    const obs = formData.get('observacao');
    
    onSubmit({
      id: item.id,
      quantidade: parseFloat(formData.get('quantidade')),
      motivo: obs ? `${motivo} - ${obs}` : motivo
    });
  };

  return (
    <ModalBase title={isEntry ? 'Registrar Entrada' : 'Registrar Saída'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
          <span className="text-xs text-gray-500 uppercase tracking-wide font-bold">Item Selecionado</span>
          <div className="font-bold text-lg text-gray-800">{item.nome}</div>
          <div className="text-sm text-gray-600">Disponível: <strong>{item.quantidade_atual} {item.unidade}</strong></div>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
           <input type="number" name="quantidade" required step="0.01" min="0.01" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="0.00" />
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
           <select name="motivo" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white">
             {isEntry ? (
               <>
                 <option value="compra">Compra</option>
                 <option value="devolucao">Devolução</option>
                 <option value="ajuste">Ajuste de Inventário</option>
                 <option value="outro">Outro</option>
               </>
             ) : (
               <>
                 <option value="uso_diario">Uso Diário</option>
                 <option value="perda">Perda/Desperdício</option>
                 <option value="devolucao">Devolução ao Fornecedor</option>
                 <option value="ajuste">Ajuste de Inventário</option>
                 <option value="outro">Outro</option>
               </>
             )}
           </select>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Observação (Opcional)</label>
           <textarea name="observacao" rows="2" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"></textarea>
        </div>

        <button 
          type="submit" 
          className={`w-full text-white py-2 rounded-lg font-bold transition-colors flex justify-center items-center gap-2 mt-2 ${
            isEntry ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          <Save size={18} /> Confirmar {isEntry ? 'Entrada' : 'Saída'}
        </button>
      </form>
    </ModalBase>
  );
};
