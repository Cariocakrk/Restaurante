import React, { useState, useEffect } from 'react';
import { Database, Trash2, Edit2, Save, X, Plus, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DevArea = () => {
    const navigate = useNavigate();
    
    // Tabs State
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'promotions'

    // Products State
    const [devProducts, setDevProducts] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState({ id: '', nome: '', categoria: '', price: '' });
    const [newProduct, setNewProduct] = useState({ nome: '', price: '', categoria: 'Pratos' });
    
    // Promotions State
    const [promotions, setPromotions] = useState([]);
    const [newPromotion, setNewPromotion] = useState({ titulo: '', descricao: '', desconto: '', ativa: 1 });
    
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Auth check
        const sessao = localStorage.getItem('auth_sessao');
        if (!sessao) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(sessao).usuario;
        if (user.username !== 'dev') {
            navigate('/gerencia');
            return;
        }
        
        fetchDevProducts();
        fetchPromotions();
    }, [navigate]);

    const fetchDevProducts = async () => {
        try {
            const res = await fetch('http://localhost:3000/produtos');
            if (res.ok) setDevProducts(await res.json());
        } catch(err) {
            console.error(err);
        }
    };

    const fetchPromotions = async () => {
        try {
            const res = await fetch('http://localhost:3000/promocoes');
            if (res.ok) setPromotions(await res.json());
        } catch(err) {
            console.error(err);
        }
    };

    // --- Product Handlers ---

    const openEditModal = (product) => {
        setEditingProduct(product);
        setEditForm({
            id: product.id,
            nome: product.nome,
            categoria: product.categoria,
            price: product.preco
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingProduct(null);
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:3000/produtos/${editForm.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nome: editForm.nome,
                    categoria: editForm.categoria,
                    price: parseFloat(editForm.price) 
                })
            });
            
            const data = await res.json();

            if (res.ok) {
                alert('Produto atualizado com sucesso!');
                closeEditModal();
                fetchDevProducts();
            } else {
                alert(data.error || 'Erro ao atualizar produto');
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao atualizar produto');
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/produtos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: newProduct.nome,
                    price: parseFloat(newProduct.price),
                    categoria: newProduct.categoria
                })
            });

            if (res.ok) {
                setNewProduct({ nome: '', price: '', categoria: 'Pratos' });
                fetchDevProducts();
                alert('Produto criado com sucesso!');
            } else {
                const err = await res.json();
                alert(err.error || 'Erro ao criar produto');
            }
        } catch (err) {
            alert('Erro ao criar produto');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (prod) => {
        if (window.confirm(`Tem certeza que deseja excluir "${prod.nome}" do cardápio?`)) {
           try {
               const res = await fetch(`http://localhost:3000/produtos/${prod.id}`, { method: 'DELETE' });
               if (res.ok) {
                   alert('Produto excluído com sucesso!');
                   fetchDevProducts();
               } else {
                   alert('Erro ao excluir produto');
               }
           } catch (err) {
               alert('Erro ao excluir produto');
           }
       }
    };

    const handleClearDatabase = async () => {
        const senha = prompt("CONFIRMAÇÃO NECESSÁRIA: Digite a senha de DEV para limpar o banco:");
        if (!senha) return;
        
        try {
            const res = await fetch('http://localhost:3000/banco', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senha })
            });
            
            if (res.ok) {
                alert('Banco de dados limpo com sucesso!');
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (err) {
            alert('Erro ao limpar banco');
        }
    };

    // --- Promotion Handlers ---

    const handleCreatePromotion = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/promocoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titulo: newPromotion.titulo,
                    descricao: newPromotion.descricao,
                    desconto: parseFloat(newPromotion.desconto),
                    ativa: 1
                })
            });

            if (res.ok) {
                setNewPromotion({ titulo: '', descricao: '', desconto: '', ativa: 1 });
                fetchPromotions();
                alert('Promoção criada com sucesso!');
            } else {
                alert('Erro ao criar promoção');
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao criar promoção');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePromotion = async (promo) => {
        try {
            const res = await fetch(`http://localhost:3000/promocoes/${promo.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ativa: promo.ativa ? 0 : 1 })
            });
            if (res.ok) fetchPromotions();
        } catch(err) {
            console.error(err);
        }
    };

    const handleDeletePromotion = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir esta promoção?")) return;
        try {
            const res = await fetch(`http://localhost:3000/promocoes/${id}`, { method: 'DELETE' });
            if (res.ok) fetchPromotions();
        } catch(err) {
            console.error(err);
        }
    };

    const categories = ["Pratos", "Salgados", "Bebidas", "Acompanhantes", "Sobremesas", "Outros"];

    return (
        <div className="space-y-6 pb-10 relative">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <Database className="text-primary" /> Área do Desenvolvedor
                </h1>
                
                <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveTab('products')}
                      className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === 'products' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Produtos
                    </button>
                    <button 
                      onClick={() => setActiveTab('promotions')}
                      className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === 'promotions' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Promoções
                    </button>
                    <button 
                      onClick={handleClearDatabase}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition flex items-center gap-2 shadow-lg shadow-red-600/20 ml-4"
                    >
                        <Trash2 size={18} /> LIMPAR BANCO DE DADOS
                    </button>
                </div>
            </div>

            {/* PRODUCT TAB CONTENT */}
            {activeTab === 'products' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Plus size={20} className="text-primary" /> Novo Produto
                        </h3>
                        <form onSubmit={handleCreateProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                                <input 
                                    type="text" 
                                    value={newProduct.nome}
                                    onChange={e => setNewProduct({...newProduct, nome: e.target.value})}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                                <select 
                                    value={newProduct.categoria}
                                    onChange={e => setNewProduct({...newProduct, categoria: e.target.value})}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={newProduct.price}
                                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    required 
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-dark transition disabled:opacity-70"
                            >
                                {loading ? 'Criando...' : 'Adicionar Produto'}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 text-lg">Gerenciamento de Cardápio</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {devProducts.map(prod => (
                                <div key={prod.id} className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50 bg-gray-50/30">
                                    <div>
                                        <div className="font-semibold text-gray-700">{prod.nome}</div>
                                        <div className="text-xs text-gray-500 font-medium bg-white border px-2 py-0.5 rounded-full w-fit mt-1">{prod.categoria}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                         <span className="font-bold text-gray-800 mr-2">R$ {prod.preco.toFixed(2)}</span>
                                         <button 
                                           onClick={() => openEditModal(prod)} 
                                           className="text-primary hover:bg-blue-50 p-2 rounded-full transition"
                                           title="Editar Produto"
                                         >
                                             <Edit2 size={18} />
                                         </button>
                                         <button 
                                           onClick={() => handleDeleteProduct(prod)}
                                           className="text-red-500 hover:bg-red-50 p-2 rounded-full transition ml-1"
                                           title="Excluir Produto"
                                         >
                                             <Trash2 size={18} />
                                         </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* PROMOTIONS TAB CONTENT */}
            {activeTab === 'promotions' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Plus size={20} className="text-primary" /> Nova Promoção
                        </h3>
                        <form onSubmit={handleCreatePromotion} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                <input 
                                    type="text" 
                                    value={newPromotion.titulo}
                                    onChange={e => setNewPromotion({...newPromotion, titulo: e.target.value})}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Ex: Combo Almoço"
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea 
                                    value={newPromotion.descricao}
                                    onChange={e => setNewPromotion({...newPromotion, descricao: e.target.value})}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Ex: Prato + Refri + Sobremesa"
                                    rows="3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Desconto (%)</label>
                                <input 
                                    type="number" 
                                    value={newPromotion.desconto}
                                    onChange={e => setNewPromotion({...newPromotion, desconto: e.target.value})}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Ex: 10"
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-dark transition disabled:opacity-70"
                            >
                                {loading ? 'Criando...' : 'Salvar Promoção'}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 text-lg">Promoções Cadastradas</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {promotions.map(promo => (
                                <div key={promo.id} className={`p-4 border rounded-xl flex justify-between items-center transition ${promo.ativa ? 'bg-white border-green-100 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-75'}`}>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-gray-800 text-lg">{promo.titulo}</h4>
                                            {promo.ativa ? 
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">ATIVA</span> : 
                                                <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-bold">INATIVA</span>
                                            }
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2">{promo.descricao}</p>
                                        {promo.desconto > 0 && (
                                             <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                                                 -{promo.desconto}% OFF
                                             </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => handleTogglePromotion(promo)}
                                            className={`text-sm font-bold px-3 py-1.5 rounded-lg border transition ${promo.ativa ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                                        >
                                            {promo.ativa ? 'Desativar' : 'Ativar'}
                                        </button>
                                        <button 
                                            onClick={() => handleDeletePromotion(promo.id)}
                                            className="text-gray-400 hover:text-red-500 transition p-2"
                                            title="Excluir Promoção"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                             {promotions.length === 0 && (
                                <div className="text-center py-10 text-gray-400">
                                    Nenhuma promoção cadastrada.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Full Edit Modal (Only for Products for now) */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Edit2 size={24} className="text-primary" /> Editar Produto
                            </h3>
                            <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdateProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                                <input 
                                    type="text" 
                                    value={editForm.nome}
                                    onChange={e => setEditForm({...editForm, nome: e.target.value})}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    required 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                                <select 
                                    value={editForm.categoria}
                                    onChange={e => setEditForm({...editForm, categoria: e.target.value})}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={editForm.price}
                                    onChange={e => setEditForm({...editForm, price: e.target.value})}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    required 
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={closeEditModal}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-bold shadow-md"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DevArea;
