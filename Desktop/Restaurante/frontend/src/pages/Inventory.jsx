import React, { useState, useEffect } from 'react';
import StockList from '../components/inventory/StockList';
import StockHistory from '../components/inventory/StockHistory';
import { NewItemModal, MovementModal } from '../components/inventory/InventoryModals';
import { Plus, Package, History } from 'lucide-react';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showNewModel, setShowNewModel] = useState(false);
  const [movementModal, setMovementModal] = useState({ open: false, type: null, item: null });

  const fetchData = async () => {
    try {
      const [resItems, resMovements] = await Promise.all([
        fetch('http://localhost:3000/estoque'),
        fetch('http://localhost:3000/estoque/movimentacoes')
      ]);

      if (resItems.ok) setItems(await resItems.json());
      if (resMovements.ok) setMovements(await resMovements.json());
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateItem = async (data) => {
    try {
      const res = await fetch('http://localhost:3000/estoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error((await res.json()).error);
      
      setShowNewModel(false);
      fetchData();
      alert('Item criado com sucesso!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMovement = async (data) => {
    const { id, quantidade, motivo } = data;
    const type = movementModal.type; // 'entrada' or 'saida'
    
    try {
      const res = await fetch(`http://localhost:3000/estoque/${id}/${type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantidade, motivo })
      });

      if (!res.ok) throw new Error((await res.json()).error);

      setMovementModal({ open: false, type: null, item: null });
      fetchData();
      alert(`${type === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]">
      {/* Main Content - Stock List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-primary" /> Gerenciamento de Estoque
          </h1>
          <button 
            onClick={() => setShowNewModel(true)}
            className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus size={20} /> Novo Item
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
          {loading ? (
             <div className="text-center py-20 text-gray-500">Carregando estoque...</div>
          ) : (
            <StockList 
              items={items} 
              onEntry={(item) => setMovementModal({ open: true, type: 'entrada', item })}
              onExit={(item) => setMovementModal({ open: true, type: 'saida', item })}
            />
          )}
        </div>
      </div>

      {/* Sidebar - History */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <History size={20} className="text-gray-500" /> Histórico Recente
          </h3>
        </div>
        <div className="flex-1 overflow-hidden p-4">
           {loading ? <p className="text-center text-sm text-gray-400">Carregando...</p> : <StockHistory movements={movements} />}
        </div>
      </div>

      {/* Modals */}
      <NewItemModal 
        isOpen={showNewModel} 
        onClose={() => setShowNewModel(false)} 
        onSubmit={handleCreateItem} 
      />
      
      <MovementModal 
        isOpen={movementModal.open}
        type={movementModal.type}
        item={movementModal.item}
        onClose={() => setMovementModal({ open: false, type: null, item: null })}
        onSubmit={handleMovement}
      />
    </div>
  );
};

export default Inventory;
