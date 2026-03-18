import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function Ranking() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false })
        .limit(10);

      if (data && !error) {
        setLeaders(data);
      }
      setLoading(false);
    };

    fetchLeaders();
  }, []);

  return (
    <div className="w-full max-w-4xl space-y-6 pb-24">
      <div className="text-center">
        <h2 className="text-2xl font-black text-green-900">🏆 Salón de la Fama</h2>
        <p className="text-sm text-green-600 font-bold">Los mejores cuidadores de la escuela</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-green-400 font-bold animate-pulse">Cargando campeones... 🌿</div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl border border-green-50 overflow-hidden">
          {leaders.map((leader, index) => (
            <div 
              key={leader.id} 
              className={`flex items-center justify-between p-4 border-b border-green-50 last:border-0 ${index === 0 ? 'bg-yellow-50/50' : ''}`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-6 text-center font-black ${index === 0 ? 'text-yellow-600 text-xl' : 'text-green-300'}`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-green-900">{leader.full_name}</span>
                  <span className="text-[10px] text-green-500 font-black uppercase tracking-wider">{leader.course}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                <span className="text-yellow-500 font-bold">⭐</span>
                <span className="font-black text-green-800 text-sm">{leader.points}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Ranking;
