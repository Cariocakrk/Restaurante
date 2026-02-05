import React from 'react';
import { DollarSign, ShoppingBag, CreditCard, Banknote, CreditCard as CardIcon } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
    <div className="flex justify-between items-start gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-gray-500 font-medium text-sm mb-1 truncate">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 break-words leading-tight">{value}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-1 truncate">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </div>
);

const StatsCards = ({ resumo }) => {
  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      <StatCard
        title="Faturamento"
        value={formatMoney(resumo.faturamento_total)}
        icon={DollarSign}
        colorClass="bg-primary"
      />
      <StatCard
        title="Total Vendas"
        value={resumo.total_vendas || 0}
        icon={ShoppingBag}
        colorClass="bg-blue-500"
      />
      <StatCard
        title="Ticket Médio"
        value={formatMoney(resumo.ticket_medio)}
        icon={DollarSign}
        colorClass="bg-indigo-500"
      />
      <StatCard
        title="Dinheiro"
        value={formatMoney(resumo.total_dinheiro)}
        subtext={`${resumo.vendas_dinheiro || 0} vendas`}
        icon={Banknote}
        colorClass="bg-green-500"
      />
      <StatCard
        title="Cartão/PIX"
        value={formatMoney(resumo.total_cartao)}
        subtext={`${resumo.vendas_cartao || 0} vendas`}
        icon={CardIcon}
        colorClass="bg-teal-500"
      />
      <StatCard
        title="Crédito"
        value={formatMoney(resumo.total_credito)}
        subtext={`${resumo.vendas_credito || 0} vendas`}
        icon={CreditCard}
        colorClass="bg-orange-500"
      />
    </div>
  );
};

export default StatsCards;
