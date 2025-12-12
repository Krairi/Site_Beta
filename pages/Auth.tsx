import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Inscription réussie ! Vérifiez votre email.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-givd-bg p-4">
      <div className="bg-white rounded-[2rem] shadow-xl p-8 w-full max-w-md border border-white/50">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-display font-bold text-givd-mint mb-2">GIVD</h1>
            <p className="text-givd-muted">Votre assistant domestique.</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button 
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isLogin ? 'bg-white shadow-sm text-givd-text' : 'text-givd-muted'}`}
                onClick={() => setIsLogin(true)}
            >
                Connexion
            </button>
            <button 
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isLogin ? 'bg-white shadow-sm text-givd-text' : 'text-givd-muted'}`}
                onClick={() => setIsLogin(false)}
            >
                Inscription
            </button>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100">
                {error}
            </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-givd-muted mb-1">Email</label>
            <input 
                type="email" 
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-givd-aqua focus:ring-4 focus:ring-givd-aqua/10 outline-none transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-givd-muted mb-1">Mot de passe</label>
            <input 
                type="password" 
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-givd-aqua focus:ring-4 focus:ring-givd-aqua/10 outline-none transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-givd-aqua text-white font-bold rounded-xl shadow-lg shadow-givd-aqua/30 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;