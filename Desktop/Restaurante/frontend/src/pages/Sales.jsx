import React, { useState, useEffect } from 'react';
import ProductCard from '../components/sales/ProductCard';
import Cart from '../components/sales/Cart';
import DailySales from '../components/sales/DailySales';
import { History, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const Sales = () => {
  const [cart, setCart] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [dailySales, setDailySales] = useState([]);
  const [products, setProducts] = useState({});
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');

  // Auto open history if requested via query param (from legacy links if any)
  useEffect(() => {
    if (searchParams.get('view') === 'history') {
      setShowHistory(true);
    }
  }, [searchParams]);

  // Load daily sales and products on mount
  useEffect(() => {
    fetchDailySales();
    fetchProducts();
    // Refresh every 30s
    const interval = setInterval(() => {
        fetchDailySales();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
        const res = await fetch('http://localhost:3000/produtos');
        if (res.ok) {
            const data = await res.json();
            // Group by category to match previous structure
            const grouped = data.reduce((acc, item) => {
                if (!acc[item.categoria]) acc[item.categoria] = [];
                acc[item.categoria].push(item);
                return acc;
            }, {});
            setProducts(grouped);
        }
    } catch (err) {
        console.error("Erro ao carregar produtos:", err);
    }
  };

  const fetchDailySales = async () => {
    try {
      const res = await fetch('http://localhost:3000/vendas');
      if (res.ok) {
        setDailySales(await res.json());
      }
    } catch (err) {
      console.error("Erro ao carregar vendas:", err);
    }
  };

  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.name === (product.nome || product.name));
      if (existing) {
        return prev.map(item => 
          item.name === (product.nome || product.name)
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { name: product.nome || product.name, price: product.preco || product.price, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (index, delta) => {
    setCart(prev => {
      const newCart = [...prev];
      const item = newCart[index];
      item.quantity += delta;
      
      if (item.quantity <= 0) {
        newCart.splice(index, 1);
      }
      return newCart;
    });
  };

  const handleRemove = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    if (confirm('Limpar o pedido atual?')) {
      setCart([]);
    }
  };

  const handleFinalizeSale = async (saleData) => {
    try {
      const id = Date.now().toString();
      const payload = {
        ...saleData,
        id,
        dataISO: new Date().toISOString()
      };

      const res = await fetch('http://localhost:3000/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Erro ao salvar venda');

      // Success
      setCart([]);
      fetchDailySales(); // Refresh history
      return true;
    } catch (err) {
      alert(`Erro ao finalizar venda: ${err.message}`);
      return false;
    }
  };

  const handleClearDailySales = async () => {
    if (!confirm("Tem certeza que deseja limpar as vendas do dia dessa tela? (Os dados continuarão disponíveis na gerência)")) return;
    
    const senha = prompt("Digite a senha para confirmar a limpeza das vendas:");
    if (!senha) return;

    try {
      const res = await fetch("http://localhost:3000/limpar-vendas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Erro: ${err.error}`);
        return;
      }

      setDailySales([]);
      alert("Vendas do dia limpas da visualização!");
    } catch (err) {
      alert("Erro ao limpar vendas: " + err.message);
    }
  };

  // Filter products by search
  const filteredCategories = Object.entries(products).reduce((acc, [category, items]) => {
    const filteredItems = items.filter(item => 
      (item.nome || item.name).toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredItems.length > 0) {
      acc[category] = filteredItems;
    }
    return acc;
  }, {});

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6">
      {/* Product List Section */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Novo Pedido</h1>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar produto..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowHistory(true)}
              className="bg-white text-primary border border-primary/20 hover:bg-primary/5 px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              <History size={18} /> Vendas do Dia
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 pb-10">
          {Object.entries(filteredCategories).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full"></span>
                {category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((item) => (
                  <ProductCard key={item.id || item.name} product={{ ...item, name: item.nome || item.name, price: item.preco || item.price }} onAdd={handleAddToCart} />
                ))}
              </div>
            </div>
          ))}
          
          {Object.keys(filteredCategories).length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">Nenhum produto encontrado para "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-[400px]">
        <Cart 
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemove={handleRemove}
          onClear={handleClearCart}
          onFinalize={handleFinalizeSale}
        />
      </div>

      {/* History Modal/Overlay */}
      {showHistory && (
        <DailySales 
          vendas={dailySales} 
          onClose={() => setShowHistory(false)} 
          onClear={handleClearDailySales}
        />
      )}
    </div>
  );
};

export default Sales;
