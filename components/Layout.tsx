import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Receipt, 
  Package, 
  Activity, 
  CreditCard, 
  LogOut, 
  User,
  Menu,
  X
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { path: '/', label: 'Accueil', icon: Home },
    { path: '/receipts', label: 'Tickets', icon: Receipt },
    { path: '/stock', label: 'Stock', icon: Package },
    { path: '/consumption', label: 'Conso', icon: Activity },
    { path: '/subscriptions', label: 'Abonnement', icon: CreditCard },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-givd-bg font-sans text-givd-text flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <h1 className="font-display font-bold text-xl text-givd-mint tracking-tight">GIVD</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-givd-text">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar (Desktop) & Mobile Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex flex-col h-full">
          <div className="mb-8 hidden md:block">
            <h1 className="font-display font-bold text-3xl text-givd-mint tracking-tight">GIVD</h1>
            <p className="text-xs text-givd-muted mt-1">Vie Domestique Intelligente</p>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200
                  ${isActive(item.path) 
                    ? 'bg-givd-aqua/10 text-givd-aqua font-semibold shadow-sm' 
                    : 'text-givd-text hover:bg-gray-50 hover:text-givd-aqua'}
                `}
              >
                <item.icon size={20} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-100 space-y-2">
             <div className="flex items-center gap-3 px-4 py-2 text-sm text-givd-text/80 mb-2">
                <div className="w-8 h-8 rounded-full bg-givd-mint/20 flex items-center justify-center text-givd-mint">
                    <User size={16} />
                </div>
                <span className="truncate max-w-[120px]">{user?.email?.split('@')[0]}</span>
             </div>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-givd-honey hover:bg-givd-honey/10 rounded-2xl transition-colors"
            >
              <LogOut size={20} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <div className="max-w-6xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
      
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;