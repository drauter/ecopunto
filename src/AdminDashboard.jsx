import React from 'react';

const mockStudents = [
  { id: 1, name: 'Mateo González', course: '5to A', points: 85, avatar: '🌳' },
  { id: 2, name: 'Sofía Rodríguez', course: '5to B', points: 42, avatar: '🌿' },
  { id: 3, name: 'Lucía Fernández', course: '6to A', points: 12, avatar: '🌱' },
  { id: 4, name: 'Juan Pérez', course: '6to B', points: 100, avatar: '🌲' },
];

function AdminDashboard({ onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div>
          <button 
            onClick={onBack}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-2 transition-colors"
          >
            ← Volver a la App
          </button>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">Panel Administrativo 👩‍🏫</h1>
          <p className="text-slate-500">Gestión de integrantes y puntos de EcoPunto</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-700 font-bold shadow-sm hover:bg-slate-50 transition-colors">
            📥 Exportar CSV
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Estudiantes</p>
            <h3 className="text-4xl font-black text-slate-900">{mockStudents.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Puntos Globales</p>
            <h3 className="text-4xl font-black text-green-600">{mockStudents.reduce((acc, s) => acc + s.points, 0)}</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Acciones este Mes</p>
            <h3 className="text-4xl font-black text-blue-600">124</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 font-bold text-slate-600 uppercase text-xs">Integrante</th>
                <th className="p-4 font-bold text-slate-600 uppercase text-xs">Curso</th>
                <th className="p-4 font-bold text-slate-600 uppercase text-xs text-center">Avatar</th>
                <th className="p-4 font-bold text-slate-600 uppercase text-xs text-right">Puntos</th>
                <th className="p-4 font-bold text-slate-600 uppercase text-xs text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mockStudents.sort((a, b) => b.points - a.points).map((student) => (
                <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800">{student.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{student.course}</td>
                  <td className="p-4 text-center text-2xl">{student.avatar}</td>
                  <td className="p-4 text-right">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-black text-sm">
                      {student.points}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-slate-400 hover:text-blue-600 font-bold text-sm">Ver Detalles</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
