import React, { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import Register from './Register';

function App() {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(1);
  const [recoveries, setRecoveries] = useState(3);
  const [isAdminView, setIsAdminView] = useState(false);

  const getAvatarState = (pts) => {
    if (pts >= 100) return { name: 'Árbol Grande', img: '/big_tree.png', level: 5, progress: 100 };
    if (pts >= 75) return { name: 'Árbol Joven', img: '/young_tree.png', level: 4, progress: 75 };
    if (pts >= 50) return { name: 'Planta', img: '/plant.png', level: 3, progress: 50 };
    if (pts >= 25) return { name: 'Brote', img: '/sprout.png', level: 2, progress: 25 };
    return { name: 'Semilla', img: '/seed_avatar.png', level: 1, progress: 0 };
  };

  const avatar = getAvatarState(points);

  const addPoints = () => {
    const earned = Math.floor(Math.random() * 2) + 1;
    setPoints(prev => {
      const next = Math.min(prev + earned, 100);
      // Simulación: Cada vez que sube nivel (25 pts), sumamos racha
      if (Math.floor(next / 25) > Math.floor(prev / 25)) {
        setStreak(s => s + 1);
      }
      return next;
    });
  };

  const useRecovery = () => {
    if (recoveries > 0) setRecoveries(r => r - 1);
  };

  if (isAdminView) {
    return <AdminDashboard onBack={() => setIsAdminView(false)} />;
  }

  if (!user) {
    return <Register onRegister={(userData) => setUser(userData)} />;
  }

  return (
    <div className="min-h-screen bg-[#f0fdf4] flex flex-col items-center p-4">
      {/* Header */}
      <header className="w-full max-w-md flex justify-between items-center py-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-md">🌿</div>
            <h1 className="text-2xl font-black text-green-900 tracking-tight">EcoPunto</h1>
          </div>
          <p className="text-sm font-bold text-green-600 ml-1">Hola, {user?.name.split(' ')[0]} 👋</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-green-100 flex items-center gap-2">
            <span className="text-yellow-500 text-xl font-bold">⭐</span>
            <span className="font-black text-green-800">{points} pts</span>
          </div>
          <div className="flex gap-2">
            <div className="bg-orange-100 px-3 py-1 rounded-full flex items-center gap-1">
              <span className="text-orange-500 font-bold">🔥</span>
              <span className="text-orange-700 font-black text-xs">{streak}</span>
            </div>
            <div className="bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1">
              <span className="text-blue-500 font-bold">🛡️</span>
              <span className="text-blue-700 font-black text-xs">{recoveries}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-md space-y-8 mt-4">
        <section className="card text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Nivel {avatar.level}</span>
          </div>
          
          <h2 className="text-xl font-bold text-green-900 mb-2">Tu Avatar: <span className="text-green-600">{avatar.name}</span></h2>
          
          <div className="avatar-container my-8 animate-float">
            <img 
              src={avatar.img} 
              alt={avatar.name} 
              className="w-full h-full object-contain p-2"
            />
          </div>

          <div className="w-full bg-green-100 h-4 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-green-500 h-full transition-all duration-1000" 
              style={{ width: `${points}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center px-2 mb-4">
            <div className="flex items-center gap-1 group cursor-help" title="Días seguidos cuidando el planeta">
              <span className="text-xl">🔥</span>
              <span className="text-sm font-black text-orange-600">Racha: {streak}</span>
            </div>
            <div 
              className={`flex items-center gap-1 cursor-pointer transition-opacity ${recoveries === 0 ? 'opacity-30' : 'opacity-100'}`}
              onClick={useRecovery}
              title="Escudos de recuperación (clic para gastar uno)"
            >
              <span className="text-xl">🛡️</span>
              <span className="text-sm font-black text-blue-600">Escudos: {recoveries}/3</span>
            </div>
          </div>

          <p className="text-sm text-green-600 font-medium italic">
            {points < 100 ? `¡Faltan ${25 - (points % 25 === 0 && points !== 0 ? 25 : points % 25)} pts para evolucionar!` : '¡Has alcanzado el máximo nivel!'}
          </p>
        </section>

        {/* Action Buttons */}
        <section className="grid grid-cols-1 gap-4">
          <button className="btn-primary w-full text-lg" onClick={addPoints}>
            <span className="text-2xl">📸</span>
            Registrar Acción
          </button>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white p-4 rounded-3xl shadow-md border border-green-500 text-green-600 font-bold hover:bg-green-50 transition-colors">
              🏆 Ranking
            </button>
            <button className="bg-white p-4 rounded-3xl shadow-md border border-green-500 text-green-600 font-bold hover:bg-green-50 transition-colors">
              👤 Mi Perfil
            </button>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-4">
          <h3 className="text-lg font-black text-green-900">Actividad Reciente</h3>
          <div className="space-y-3">
            <div className="bg-white/50 p-4 rounded-2xl border border-green-50 border-dashed text-center text-green-400 py-8">
              <p>Aún no has registrado acciones.</p>
              <p className="text-xs">¡Empieza hoy a cuidar tu planeta! 🌍</p>
            </div>
          </div>
        </section>
      </main>

      {/* Navigation Bar (Mobile) */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/80 backdrop-blur-xl p-4 rounded-full shadow-2xl border border-white/20 flex justify-between items-center px-8">
        <div className="text-green-600 text-2xl cursor-pointer">🏠</div>
        <div className="text-green-300 text-2xl cursor-pointer">📊</div>
        <div className="text-green-300 text-2xl cursor-pointer">📝</div>
        <div 
          className="text-green-300 hover:text-green-600 text-2xl cursor-pointer transition-colors"
          onClick={() => setIsAdminView(true)}
          title="Panel Admin"
        >
          ⚙️
        </div>
      </footer>
    </div>
  );
}

export default App;
