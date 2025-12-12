import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';
import { Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';

const Stock: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    quantity: 1,
    min_threshold: 1,
    unit: 'pcs',
    category: 'Général'
  });

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('products').select('*').eq('user_id', user.id).order('name');
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (formData.id) {
        await supabase.from('products').update(formData).eq('id', formData.id);
      } else {
        await supabase.from('products').insert([{ ...formData, user_id: user.id }]);
      }
      setIsModalOpen(false);
      setFormData({ name: '', quantity: 1, min_threshold: 1, unit: 'pcs', category: 'Général' });
      fetchProducts();
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce produit ?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  };

  const openEdit = (product: Product) => {
    setFormData(product);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-display font-bold text-givd-text">Mon Stock</h2>
        <button 
          onClick={() => { setFormData({}); setIsModalOpen(true); }}
          className="bg-givd-mint text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-opacity-90 transition-colors shadow-sm"
        >
          <Plus size={20} /> Nouveau Produit
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-givd-muted text-sm uppercase tracking-wider">
                <th className="p-5 font-semibold">Produit</th>
                <th className="p-5 font-semibold">Quantité</th>
                <th className="p-5 font-semibold">Seuil Alerte</th>
                <th className="p-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="p-6 text-center text-givd-muted">Chargement...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-givd-muted">Aucun produit dans le stock.</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 font-medium text-givd-text">
                      <div className="flex items-center gap-2">
                        {product.quantity <= product.min_threshold && (
                          <AlertCircle size={16} className="text-givd-honey" />
                        )}
                        {product.name}
                        <span className="text-xs text-givd-muted bg-gray-100 px-2 py-0.5 rounded-full">{product.category}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`font-bold ${product.quantity <= product.min_threshold ? 'text-givd-honey' : 'text-givd-mint'}`}>
                        {product.quantity}
                      </span> 
                      <span className="text-xs text-givd-muted ml-1">{product.unit}</span>
                    </td>
                    <td className="p-5 text-givd-muted">{product.min_threshold} {product.unit}</td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(product)} className="p-2 text-givd-aqua hover:bg-givd-aqua/10 rounded-lg">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-fade-in">
            <h3 className="text-2xl font-display font-bold mb-6">{formData.id ? 'Modifier' : 'Ajouter'} un produit</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-givd-muted mb-1">Nom</label>
                <input 
                  type="text" 
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-givd-mint focus:ring-2 focus:ring-givd-mint/20 outline-none transition-all"
                  placeholder="Ex: Lait, Riz..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-givd-muted mb-1">Quantité</label>
                  <input 
                    type="number" 
                    required
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-givd-mint focus:ring-2 focus:ring-givd-mint/20 outline-none transition-all"
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-givd-muted mb-1">Unité</label>
                  <input 
                    type="text" 
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-givd-mint focus:ring-2 focus:ring-givd-mint/20 outline-none transition-all"
                    placeholder="kg, L, pcs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-givd-muted mb-1">Seuil d'alerte</label>
                <input 
                  type="number" 
                  required
                  value={formData.min_threshold}
                  onChange={e => setFormData({...formData, min_threshold: Number(e.target.value)})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-givd-honey focus:ring-2 focus:ring-givd-honey/20 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 mt-6 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-givd-muted hover:bg-gray-50 rounded-xl font-medium"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-givd-mint text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;