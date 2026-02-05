import React from 'react';
import { Filter, Calendar, X } from 'lucide-react';

const Filters = ({ filters, setFilters, onApply, onClear }) => {
  const handleQuickFilter = (type) => {
    const hoje = new Date();
    const inicio = new Date();
    let fim = new Date();
    fim.setHours(23, 59, 59, 999);

    switch (type) {
      case 'hoje':
        inicio.setHours(0, 0, 0, 0);
        break;
      case 'semana':
        inicio.setDate(hoje.getDate() - 7);
        inicio.setHours(0, 0, 0, 0);
        break;
      case 'mes':
        inicio.setDate(1);
        inicio.setHours(0, 0, 0, 0);
        break;
      case 'mes-anterior':
        inicio.setMonth(hoje.getMonth() - 1);
        inicio.setDate(1);
        fim.setDate(0);
        fim.setHours(23, 59, 59, 999);
        break;
      case 'ano':
        inicio.setMonth(0);
        inicio.setDate(1);
        inicio.setHours(0, 0, 0, 0);
        break;
      default:
        setFilters({ dataInicio: '', dataFim: '' });
        return;
    }

    setFilters({
      dataInicio: inicio.toISOString().split('T')[0],
      dataFim: fim.toISOString().split('T')[0]
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-end">
      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar size={16} /> Data Início
          </label>
          <input
            type="date"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            value={filters.dataInicio}
            onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar size={16} /> Data Fim
          </label>
          <input
            type="date"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            value={filters.dataFim}
            onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Filter size={16} /> Período Rápido
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
            onChange={(e) => handleQuickFilter(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Selecione...</option>
            <option value="hoje">Hoje</option>
            <option value="semana">Últimos 7 dias</option>
            <option value="mes">Este mês</option>
            <option value="mes-anterior">Mês anterior</option>
            <option value="ano">Este ano</option>
          </select>
        </div>
      </div>
      
      <div className="flex gap-3 w-full md:w-auto">
        <button
          onClick={onApply}
          className="flex-1 md:flex-none px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30"
        >
          Filtrar
        </button>
        <button
          onClick={onClear}
          className="flex-1 md:flex-none px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <X size={18} /> Limpar
        </button>
      </div>
    </div>
  );
};

export default Filters;
