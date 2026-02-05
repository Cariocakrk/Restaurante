import React, { useState, useEffect } from 'react';
import { Tag, Clock, ArrowRight } from 'lucide-react';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/promocoes')
      .then(res => res.json())
      .then(data => {
        // Filtrar apenas as ativas
        setPromotions(data.filter(p => p.ativa));
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[calc(100vh-100px)]">
      <div className="bg-primary/5 p-8 rounded-full mb-6">
        <Tag size={64} className="text-primary" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Promoções & Ofertas</h1>
      <p className="text-gray-500 max-w-md mb-8">
        Aproveite nossas ofertas especiais imperdíveis!
      </p>
      
      {promotions.length === 0 ? (
          <div className="text-gray-400">
              Nenhuma promoção ativa no momento. Confira em breve!
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl text-left">
            {promotions.map((promo) => (
              <div key={promo.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">OFERTA</span>
                  <Clock size={16} className="text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1 text-lg">{promo.titulo}</h3>
                <p className="text-sm text-gray-500 mb-4">{promo.descricao}</p>
                <div className="flex justify-between items-center mt-auto">
                  {promo.desconto > 0 && (
                      <span className="font-bold text-2xl text-primary">-{promo.desconto}%</span>
                  )}
                  <button className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                    Ver mais <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
      )}
    </div>
  );
};

export default Promotions;
