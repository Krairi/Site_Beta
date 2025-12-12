import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingUp, Package, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lowStockCount, setLowStockCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch products for stock summary
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id);

        if (products) {
          setTotalProducts(products.length);
          const low = products.filter((p: Product) => p.quantity <= p.min_threshold).length;
          setLowStockCount(low);
        }

        // Calculate monthly spend from receipts (mock calculation for demo as we don't have full history logic yet)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);

        const { data: receipts } = await supabase
          .from('receipts')
          .select('total_amount')
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString());

        if (receipts) {
          const total = receipts.reduce((sum, r) => sum + (r.total_amount || 0), 0);
          setMonthlySpend(total);
        }

      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }: any) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-givd-muted text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-display font-bold text-givd-text">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-20`}>
          <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
        </div>
      </div>
      {subtitle && <p className="text-xs text-givd-muted">{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h2 className="text-3xl font-display font-bold text-givd-text">Bonjour, {user?.email?.split('@')[0]} 👋</h2>
        <p className="text-givd-muted mt-2">Voici un aperçu de votre maison aujourd'hui.</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-200 rounded-3xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Alertes Stock"
            value={lowStockCount}
            icon={AlertTriangle}
            colorClass="bg-givd-honey text-givd-honey"
            subtitle={lowStockCount > 0 ? "Produits nécessitent votre attention" : "Tout est en ordre"}
          />
          <StatCard
            title="Produits Totaux"
            value={totalProducts}
            icon={Package}
            colorClass="bg-givd-mint text-givd-mint"
            subtitle="Référencés dans votre inventaire"
          />
          <StatCard
            title="Dépenses du mois"
            value={`${monthlySpend.toFixed(2)} €`}
            icon={ShoppingBag}
            colorClass="bg-givd-aqua text-givd-aqua"
            subtitle="Basé sur vos tickets scannés"
          />
        </div>
      )}

      {/* Quick Action Area */}
      <div className="bg-gradient-to-r from-givd-mint to-givd-aqua p-8 rounded-3xl text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-display font-bold mb-2">Ticket de caisse ?</h3>
            <p className="opacity-90 max-w-md">Ajoutez rapidement vos achats pour mettre à jour votre stock et suivre vos dépenses instantanément.</p>
          </div>
          <button 
            onClick={() => navigate('/receipts', { state: { openForm: true } })}
            className="px-6 py-3 bg-white text-givd-aqua font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            Ajouter un ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;