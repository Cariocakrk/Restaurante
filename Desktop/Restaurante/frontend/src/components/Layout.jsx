import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Tag, LogOut, Monitor } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('auth_sessao') || '{}').usuario;

  const handleLogout = () => {
    localStorage.removeItem('auth_sessao');
    navigate('/login');
  };

  const navItems = [
    { path: '/vendas', label: 'Vendas', icon: ShoppingCart },
    { path: '/estoque', label: 'Estoque', icon: Package },
    { path: '/gerencia', label: 'Gerência', icon: LayoutDashboard },
    { path: '/promocoes', label: 'Promoções', icon: Tag },
  ];

  if (user && user.username === 'dev') {
     navItems.push({ path: '/dev', label: 'Área Dev', icon: Monitor });
  }

  // Don't show layout on login page
  if (location.pathname === '/login' || location.pathname === '/') {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background-light font-sans text-text-dark">
      <nav className="bg-white shadow-md p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg text-white">
              <Monitor size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none text-primary">Restaurante</h1>
              <span className="text-xs text-text-light">Sistema de Gestão</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 font-semibold ${
                  location.pathname === item.path
                    ? 'bg-primary text-white shadow-md transform -translate-y-0.5'
                    : 'text-text-medium hover:bg-gray-100 hover:text-primary'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-text-dark">{user.username}</p>
                <p className="text-xs text-text-light">Usuário</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-error text-error hover:bg-error hover:text-white transition-all duration-200 font-semibold text-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-6 max-w-7xl animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
