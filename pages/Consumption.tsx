import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { ConsumptionLog } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap } from 'lucide-react';

const Consumption: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ConsumptionLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for the chart to look good if logs are empty (for demo purposes)
  const mockData = [
    { name: 'Lun', val: 40 },
    { name: 'Mar', val: 30 },
    { name: 'Mer', val: 20 },
    { name: 'Jeu', val: 27 },
    { name: 'Ven', val: 18 },
    { name: 'Sam', val: 23 },
    { name: 'Dim', val: 34 },
  ];

  const fetchLogs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('consumption_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(20);
    
    if (data) setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;

    fetchLogs();

    // Real-time subscription
    const channel = supabase
      .channel('public:consumption_logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'consumption_logs', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setLogs((prev) => [payload.new as ConsumptionLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Simulate adding a log
  const simulateConsumption = async () => {
    if (!user) return;
    const items = ['Eau', 'Électricité (Sim)', 'Café', 'Lessive'];
    const randomItem = items[Math.floor(Math.random() * items.length)];
    
    await supabase.from('consumption_logs').insert([{
        user_id: user.id,
        product_name: randomItem,
        quantity_used: Math.floor(Math.random() * 5) + 1,
        timestamp: new Date().toISOString()
    }]);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-display font-bold text-givd-text">Consommation</h2>
           <p className="text-givd-muted">Suivi en temps réel de votre activité domestique.</p>
        </div>
        <button 
            onClick={simulateConsumption}
            className="bg-givd-honey text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-givd-honey/20 hover:scale-105 transition-transform"
        >
            <Zap size={18} /> Simuler Action
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-display font-bold text-xl mb-6 text-givd-text">Tendance Hebdomadaire</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5DADE2" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#5DADE2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#95A5A6'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#95A5A6'}} />
                <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
                />
                <Area type="monotone" dataKey="val" stroke="#5DADE2" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Feed Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-[400px] overflow-hidden flex flex-col">
            <h3 className="font-display font-bold text-xl mb-4 text-givd-text flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                Journal en direct
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {logs.length === 0 ? (
                    <p className="text-sm text-givd-muted text-center mt-10">En attente de données...</p>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl animate-fade-in">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-givd-mint shadow-sm">
                                    <Activity size={16} />
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-givd-text">{log.product_name}</p>
                                    <p className="text-xs text-givd-muted">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                </div>
                            </div>
                            <span className="font-bold text-givd-aqua">-{log.quantity_used}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Consumption;