import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const Subscriptions: React.FC = () => {
  const { user } = useAuth();
  const [processing, setProcessing] = useState<string | null>(null);

  // Get current plan from user metadata (default to 'free')
  const currentPlan = user?.user_metadata?.subscription_plan || 'free';

  const handleSelectPlan = async (planId: string) => {
    if (planId === currentPlan) return;
    
    setProcessing(planId);
    try {
      // Update user metadata in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: { subscription_plan: planId }
      });

      if (error) throw error;
      
      // The AuthContext will automatically update the user object via onAuthStateChange
      // causing a re-render with the new currentPlan.
    } catch (err: any) {
      console.error(err);
      alert("Une erreur est survenue lors de la mise à jour de votre abonnement.");
    } finally {
      setProcessing(null);
    }
  };

  const PlanCard = ({ id, title, price, features, recommended = false, color }: any) => {
    const isCurrent = currentPlan === id;
    const isLoading = processing === id;
    const isOtherProcessing = processing !== null && !isLoading;

    // Define color styles explicitly to avoid Tailwind JIT issues with dynamic strings if not previously scanned
    const colorStyles: Record<string, { bg: string, text: string, border: string }> = {
      'gray-500': { bg: 'bg-gray-500', text: 'text-gray-500', border: 'border-gray-500' },
      'givd-mint': { bg: 'bg-givd-mint', text: 'text-givd-mint', border: 'border-givd-mint' },
      'givd-honey': { bg: 'bg-givd-honey', text: 'text-givd-honey', border: 'border-givd-honey' }
    };
    
    const theme = colorStyles[color] || colorStyles['gray-500'];

    return (
      <div className={`
        relative p-8 rounded-[2rem] border transition-all duration-300 flex flex-col h-full
        ${recommended 
          ? 'bg-white border-givd-mint shadow-xl scale-105 z-10' 
          : 'bg-white/60 border-gray-200 shadow-sm hover:shadow-md'}
      `}>
        {recommended && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-givd-mint text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
            Populaire
          </div>
        )}
        <h3 className={`text-2xl font-display font-bold mb-2 ${theme.text}`}>{title}</h3>
        <div className="flex items-baseline mb-6">
          <span className="text-4xl font-bold text-givd-text">{price}</span>
          <span className="text-givd-muted ml-2">/ mois</span>
        </div>
        
        <ul className="space-y-4 mb-8 flex-1">
          {features.map((feat: string, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <div className={`mt-1 p-1 rounded-full ${theme.bg} bg-opacity-10 ${theme.text}`}>
                <Check size={12} strokeWidth={3} />
              </div>
              <span className="text-sm text-givd-text/80">{feat}</span>
            </li>
          ))}
        </ul>

        <button 
          onClick={() => handleSelectPlan(id)}
          disabled={isCurrent || isOtherProcessing || isLoading}
          className={`
            w-full py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2
            ${isCurrent 
                ? 'bg-green-50 text-green-600 border border-green-200 cursor-default' 
                : recommended
                    ? 'bg-givd-mint text-white hover:bg-opacity-90 shadow-lg shadow-givd-mint/30 hover:-translate-y-1' 
                    : 'bg-gray-100 text-givd-text hover:bg-gray-200 hover:-translate-y-1'}
            ${(isOtherProcessing || isLoading) && !isCurrent ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isLoading && <Loader2 size={18} className="animate-spin" />}
          {isCurrent ? 'Plan Actuel' : `Choisir ${title}`}
        </button>
      </div>
    );
  };

  return (
    <div className="py-10">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-display font-bold text-givd-text mb-4">Plans Tarifaires</h2>
        <p className="text-givd-muted max-w-xl mx-auto">Choisissez l'offre adaptée à votre foyer. Changez à tout moment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
        <PlanCard 
            id="free"
            title="Free" 
            price="0€" 
            color="gray-500"
            features={[
                "Gestion de stock (max 50 articles)",
                "5 Tickets de caisse / mois",
                "Support communautaire",
                "Tableau de bord basique"
            ]} 
        />
        <PlanCard 
            id="premium1"
            title="Premium 1" 
            price="4.99€" 
            recommended={true}
            color="givd-mint"
            features={[
                "Stock illimité",
                "Tickets illimités",
                "Alertes intelligentes",
                "Graphiques de consommation",
                "Mode famille (2 comptes)"
            ]} 
        />
        <PlanCard 
            id="premium2"
            title="Premium 2" 
            price="9.99€" 
            color="givd-honey"
            features={[
                "Tout Premium 1 inclus",
                "Analyse IA des tickets",
                "Prédiction de consommation",
                "Automatisations domotiques",
                "Support prioritaire 24/7"
            ]} 
        />
      </div>
    </div>
  );
};

export default Subscriptions;