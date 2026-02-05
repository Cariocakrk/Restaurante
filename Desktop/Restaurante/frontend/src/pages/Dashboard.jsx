import React, { useState, useEffect } from 'react';
import StatsCards from '../components/dashboard/StatsCards';
import Filters from '../components/dashboard/Filters';
import TopProducts from '../components/dashboard/TopProducts';
import RecentSales from '../components/dashboard/RecentSales';
import CategoryRanking from '../components/dashboard/CategoryRanking';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0]
  });

  const [data, setData] = useState({
    resumo: {},
    produtos: [],
    vendas: [],
    categorias: {}
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        dataInicio: new Date(`${filters.dataInicio}T00:00:00Z`).toISOString(),
        dataFim: new Date(`${filters.dataFim}T23:59:59Z`).toISOString()
      });

      const [resumoRes, produtosRes, vendasRes, categoriasRes] = await Promise.all([
        fetch(`http://localhost:3000/relatorios/resumo?${queryParams}`),
        fetch(`http://localhost:3000/relatorios/produtos?${queryParams}`),
        fetch(`http://localhost:3000/vendas/filtro?${queryParams}`),
        fetch(`http://localhost:3000/relatorios/produtos-categorias?${queryParams}`)
      ]);

      const resumo = await resumoRes.json();
      const produtos = await produtosRes.json();
      const vendas = await vendasRes.json();
      const categorias = await categoriasRes.json();

      setData({ resumo, produtos, vendas, categorias });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Initial load

  const handleApplyFilters = () => {
    fetchData();
  };

  const handleClearFilters = () => {
    const hoje = new Date().toISOString().split('T')[0];
    setFilters({ dataInicio: hoje, dataFim: hoje });
    
    // Trigger update
    const queryParams = new URLSearchParams({
        dataInicio: new Date(`${hoje}T00:00:00Z`).toISOString(),
        dataFim: new Date(`${hoje}T23:59:59Z`).toISOString()
      });

    setLoading(true);
    Promise.all([
        fetch(`http://localhost:3000/relatorios/resumo?${queryParams}`),
        fetch(`http://localhost:3000/relatorios/produtos?${queryParams}`),
        fetch(`http://localhost:3000/vendas/filtro?${queryParams}`),
        fetch(`http://localhost:3000/relatorios/produtos-categorias?${queryParams}`)
      ]).then(async ([r1, r2, r3, r4]) => {
         const resumo = await r1.json();
         const produtos = await r2.json();
         const vendas = await r3.json();
         const categorias = await r4.json();
         setData({ resumo, produtos, vendas, categorias });
         setLoading(false);
      });
  };

  // Dev Actions removed


  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Gerencial</h1>
        {loading && <div className="flex items-center gap-2 text-primary font-medium"><Loader2 className="animate-spin" /> Atualizando...</div>}
      </div>

      <Filters 
        filters={filters} 
        setFilters={setFilters} 
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      <StatsCards resumo={data.resumo} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
           <TopProducts produtos={data.produtos} />
           <RecentSales vendas={data.vendas} />
        </div>
        <div className="h-[600px]">
           <CategoryRanking categories={data.categorias} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
