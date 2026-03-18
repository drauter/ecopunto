import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function AdminDashboard({ onBack }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, points: 0, actions: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Obtener integrantes
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false });
      
      if (pError) throw pError;
      setStudents(profiles || []);

      // 2. Obtener estadísticas (ejemplo simple)
      const { count: activitiesCount } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true });

      setStats({
        total: profiles?.length || 0,
        points: profiles?.reduce((acc, s) => acc + (s.points || 0), 0) || 0,
        actions: activitiesCount || 0
      });
    } catch (err) {
      console.error("Error cargando datos de admin:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${name}? Esta acción no se puede deshacer.`)) return;

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      
      alert(`${name} ha sido eliminado.`);
      fetchData(); // Recargar lista
    } catch (err) {
      alert("Error al eliminar integrante: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div>
          <button 
            onClick={onBack}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-2 transition-colors font-bold"
          >
            ← Volver a la App
          </button>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">Panel Administrativo 👩‍🏫</h1>
          <p className="text-slate-500 font-medium">Gestión de integrantes y puntos de EcoPunto</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchData}
            className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-700 font-bold shadow-sm hover:bg-slate-50 transition-colors"
          >
            🔄 Actualizar
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20 text-4xl animate-bounce">🌿</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Estudiantes</p>
                <h3 className="text-4xl font-black text-slate-900">{stats.total}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Puntos Globales</p>
                <h3 className="text-4xl font-black text-green-600">{stats.points}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Acciones Totales</p>
                <h3 className="text-4xl font-black text-blue-600">{stats.actions}</h3>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-x-auto mb-10">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 font-bold text-slate-600 uppercase text-xs">Integrante</th>
                    <th className="p-4 font-bold text-slate-600 uppercase text-xs">Curso</th>
                    <th className="p-4 font-bold text-slate-600 uppercase text-xs text-right">Puntos</th>
                    <th className="p-4 font-bold text-slate-600 uppercase text-xs text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex-shrink-0 flex items-center justify-center text-green-600 font-black overflow-hidden border border-green-50">
                            {student.avatar_url ? (
                              <img src={student.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                              student.full_name?.charAt(0) || '?'
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800 block truncate max-w-[150px] md:max-w-none">{student.full_name}</span>
                            <span className="text-[9px] text-slate-400 font-mono tracking-tighter block truncate max-w-[100px]" title={student.id}>
                              {student.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 font-medium whitespace-nowrap">{student.course}</td>
                      <td className="p-4 text-right">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-black text-sm whitespace-nowrap">
                          {student.points || 0} pts
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleDelete(student.id, student.full_name)}
                            className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"
                            title="Eliminar Participante"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-20 text-center text-slate-400 font-bold">No hay participantes registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
