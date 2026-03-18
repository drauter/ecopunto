import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function Profile({ user }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setActivities(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="w-full max-w-md space-y-8 pb-24">
      <div className="text-center py-4">
        <div className="w-24 h-24 bg-green-500 rounded-3xl mx-auto flex items-center justify-center text-white text-5xl shadow-xl mb-4 border-4 border-white">
          {user?.name?.charAt(0) || '👤'}
        </div>
        <h2 className="text-2xl font-black text-green-900">{user?.name}</h2>
        <p className="text-green-600 font-bold uppercase tracking-widest text-xs mt-1">{user?.course}</p>
        
        <button 
          onClick={handleLogout}
          className="mt-4 text-red-500 font-bold text-sm bg-red-50 px-4 py-2 rounded-full hover:bg-red-100 transition-colors"
        >
          Cerrar Sesión 🚪
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black text-green-900 flex items-center gap-2">
          📜 Tu Historial
          <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded-full">{activities.length}</span>
        </h3>

        {loading ? (
          <div className="text-center py-10 text-green-400 font-bold animate-pulse">Cargando historial... 🌿</div>
        ) : activities.length === 0 ? (
          <div className="bg-white/50 p-8 rounded-3xl border border-green-50 border-dashed text-center text-green-400">
            <p className="font-bold">Aún no hay registros.</p>
            <p className="text-xs uppercase mt-2">¡Sube tu primera foto para ganar puntos! 📸</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activities.map((act) => (
              <div key={act.id} className="bg-white p-4 rounded-3xl shadow-sm border border-green-50 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-green-100 flex-shrink-0">
                  <img src={act.image_url} alt="Acción" className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <p className="text-xs text-green-400 font-bold uppercase tracking-wider">
                    {new Date(act.created_at).toLocaleDateString()}
                  </p>
                  <p className="font-bold text-green-900 text-sm">
                    {act.status === 'approved' ? '✅ Acción Validada' : act.status === 'rejected' ? '❌ No Validada' : '⏳ Pendiente'}
                  </p>
                  <p className="text-[10px] text-green-600 italic line-clamp-1">{act.ai_metadata?.reason || 'Sin detalles'}</p>
                </div>
                <div className="text-right">
                   <div className="bg-green-50 px-2 py-1 rounded-xl text-green-700 font-black text-xs">
                     +{act.ai_score || 0} pts
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
