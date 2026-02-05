import React, { useState, useEffect } from 'react';
import { Trash2, Calculator, Save, RefreshCw, X, CheckCircle, AlertCircle } from 'lucide-react';

const Cart = ({ cart, onUpdateQuantity, onRemove, onClear, onFinalize }) => {
  const [discountPercent, setDiscountPercent] = useState('');
  const [paymentType, setPaymentType] = useState('dinheiro');
  const [amountPaid, setAmountPaid] = useState('');
  const [change, setChange] = useState(null);
  const [loading, setLoading] = useState(false);

  // Calculate totals
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountValue = subtotal * ((parseFloat(discountPercent) || 0) / 100);
  const total = subtotal - discountValue;

  useEffect(() => {
    setChange(null);
  }, [total, amountPaid, paymentType]);

  const handleCalculateChange = () => {
    if (paymentType !== 'dinheiro') {
      setChange({ type: 'success', message: 'Pagamento aprovado.' });
      return;
    }

    const paid = parseFloat(amountPaid);
    if (isNaN(paid)) {
      setChange({ type: 'error', message: 'Insira o valor pago.' });
      return;
    }

    const diff = paid - total;
    if (diff < 0) {
      setChange({ type: 'error', message: `Falta ${formatMoney(Math.abs(diff))}` });
    } else {
      setChange({ type: 'success', message: `Troco: ${formatMoney(diff)}` });
    }
  };

  const handleFinalize = async () => {
    if (cart.length === 0) return;
    
    setLoading(true);
    try {
      const success = await onFinalize({
        total,
        discount: parseFloat(discountPercent) || 0,
        tipoPagamento: paymentType,
        itens: cart.map(item => ({
          produto: item.name,
          quantidade: item.quantity,
          preco: item.price
        }))
      });

      if (success) {
        setDiscountPercent('');
        setAmountPaid('');
        setPaymentType('dinheiro');
        setChange(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
          <Calculator size={20} className="text-primary" /> 
          Caixa / Calculadora
        </h3>
        <button 
          onClick={onClear}
          className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded transition-colors"
        >
          <Trash2 size={14} /> Limpar
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBagIcon size={32} />
            </div>
            <p>Seu pedido está vazio</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {cart.map((item, index) => (
              <li key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-primary/30 transition-all">
                <div className="flex-1">
                  <span className="font-semibold text-gray-800 block">{item.name}</span>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatMoney(item.price)} x {item.quantity} = <span className="text-primary font-bold">{formatMoney(item.price * item.quantity)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white rounded-lg border border-gray-200">
                    <button 
                      onClick={() => onUpdateQuantity(index, -1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-l-lg transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(index, 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-r-lg transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => onRemove(index)}
                    className="text-gray-300 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer Calculation */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal:</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 w-24">Desconto (%):</span>
            <input 
              type="number" 
              min="0" 
              max="100" 
              placeholder="0"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-200">
            <span>Total:</span>
            <span className="text-primary">{formatMoney(total)}</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Pagamento</label>
              <select 
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm outline-none bg-white"
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao">Cartão/PIX</option>
                <option value="credito">Crédito</option>
              </select>
            </div>
            {paymentType === 'dinheiro' && (
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Valor Pago</label>
                <input 
                  type="number"
                  placeholder="R$ 0,00"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm outline-none"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleCalculateChange}
              className="flex-1 bg-secondary text-white py-2.5 rounded-xl font-bold text-sm hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <RefreshCw size={16} /> Calcular
            </button>
            <button 
              onClick={handleFinalize}
              disabled={cart.length === 0 || loading}
              className="flex-[2] bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />}
              Finalizar Venda
            </button>
          </div>

          {change && (
            <div className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-bottom-2 duration-300 ${
              change.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {change.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {change.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component
const ShoppingBagIcon = ({ size }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
);

export default Cart;
