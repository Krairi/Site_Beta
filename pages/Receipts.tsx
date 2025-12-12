import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { Receipt } from '../types';
import { Plus, Receipt as ReceiptIcon, Calendar, DollarSign } from 'lucide-react';

const Receipts: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State - Initialize based on navigation state
  const [showForm, setShowForm] = useState(() => {
    return (location.state as any)?.openForm || false;
  });
  
  const [storeName, setStoreName] = useState('');
  const [total, setTotal] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemsText, setItemsText] = useState(''); // Simple text area for items for MVP

  const fetchReceipts = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('receipts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setReceipts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReceipts();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Basic parsing of items text (Line by line)
    const items = itemsText.split('\n').map(line => ({ name: line, price: 0 }));

    const { error } = await supabase.from('receipts').insert([{
      user_id: user.id,
      store_name: storeName,
      total_amount: parseFloat(total),
      purchase_date: date,
      items_json: items
    }]);

    if (!error) {
      setShowForm(false);
      setStoreName('');
      setTotal('');
      setItemsText('');
      fetchReceipts();
    } else {
      alert("Erreur lors de l'ajout du ticket.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
       <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-display font-bold text-givd-text">Tickets de Caisse</h2>
           <p className="text-givd-muted">Historique de vos achats</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-givd-aqua text-white px-5 py-3 rounded-2xl shadow-lg shadow-givd-aqua/20 flex items-center gap-2 hover:translate-y-[-2px] transition-all"
        >
          {showForm ? 'Fermer' : <><Plus size={20} /> Ajouter un ticket</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 animate-fade-in">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-givd-muted mb-1">Magasin</label>
              <input 
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-givd-aqua outline-none" 
                value={storeName} 
                onChange={(e) => setStoreName(e.target.value)} 
                placeholder="Ex: Super U, Leclerc..." 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-givd-muted mb-1">Date</label>
              <input 
                type="date"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-givd-aqua outline-none" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-givd-muted mb-1">Montant Total (€)</label>
              <input 
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-givd-aqua outline-none" 
                value={total} 
                onChange={(e) => setTotal(e.target.value)} 
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-givd-muted mb-1">Articles (1 par ligne)</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-givd-aqua outline-none min-h-[100px]" 
                value={itemsText}
                onChange={(e) => setItemsText(e.target.value)}
                placeholder="Pain&#10;Lait&#10;Oeufs"
              />
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end">
              <button type="submit" className="bg-givd-aqua text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
           <div className="text-center py-10 text-givd-muted">Chargement...</div>
        ) : receipts.length === 0 ? (
           <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200">
             <ReceiptIcon size={48} className="mx-auto text-gray-200 mb-4" />
             <p className="text-givd-muted">Aucun ticket enregistré.</p>
           </div>
        ) : (
          receipts.map((receipt) => (
            <div key={receipt.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-givd-aqua/10 flex items-center justify-center text-givd-aqua">
                  <ReceiptIcon size={24} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-givd-text">{receipt.store_name}</h4>
                  <div className="flex items-center gap-2 text-sm text-givd-muted">
                    <Calendar size={14} />
                    <span>{new Date(receipt.purchase_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="block text-xs text-givd-muted uppercase tracking-wider">Total</span>
                  <span className="font-display font-bold text-xl text-givd-text">{receipt.total_amount} €</span>
                </div>
                {/* Expand functionality could be added here to see items */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Receipts;