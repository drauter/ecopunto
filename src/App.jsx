import React, { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from './supabaseClient';
import { useRegisterSW } from 'virtual:pwa-register/react';

// Lazy loading para componentes pesados (Mejora drásticamente el tiempo de inicio)
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const Register = lazy(() => import('./Register'));
const PhotoUpload = lazy(() => import('./PhotoUpload'));
const Ranking = lazy(() => import('./Ranking'));
const Profile = lazy(() => import('./Profile'));

function App() {
  // Registrar PWA Service Worker
  useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.error('SW Registration Error:', error);
    }
  });

  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(1);
  const [recoveries, setRecoveries] = useState(3);
  const [isAdminView, setIsAdminView] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [logo, setLogo] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    // Optimización: Carga paralela de sesión y ajustes
    const initApp = async () => {
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 4000); 

      try {
        if (!supabase) return;

        // Settings es independiente del usuario, lo cargamos primero
        await fetchSettings();
        
        // El estado de sesión lo manejará onAuthStateChange al iniciar
      } catch (error) {
        console.error("Error en inicialización:", error);
      } finally {
        clearTimeout(timeoutId);
        // El cargador se quitará cuando onAuthStateChange termine de procesar el perfil inicial
      }
    };

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
        if (!error && data?.logo_url) {
          setLogo(data.logo_url);
          updateFavicon(data.logo_url);
        }
      } catch (err) {
        console.warn("Ajustes ignorados por lentitud:", err);
      }
    };

    const updateFavicon = (url) => {
      const links = [
        { rel: "icon", href: url },
        { rel: "apple-touch-icon", href: url }
      ];
      links.forEach(({ rel, href }) => {
        let link = document.querySelector(`link[rel~='${rel}']`);
        if (!link) {
          link = document.createElement('link');
          link.rel = rel;
          document.head.appendChild(link);
        }
        link.href = href;
      });
    };

    initApp();

    let subscription;
    if (supabase?.auth) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      });
      subscription = data.subscription;
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error || !data) {
        setUser({ id: userId, name: 'Estudiante', course: 'Global', isAdmin: false });
        setPoints(0);
        return;
      }

      setUser({
        id: data.id,
        name: data.full_name || 'Estudiante',
        course: data.course || 'Global',
        isAdmin: data.is_admin || false
      });
      setPoints(data.points || 0);
      setStreak(data.streak || 1);
    } catch (err) {
      setUser({ id: userId, name: 'Estudiante', course: 'Global', isAdmin: false });
    } finally {
      setLoading(false);
    }
  };

  const getAvatarState = (pts) => {
    if (pts >= 100) return { name: 'Árbol Grande', img: '/big_tree.png', level: 5 };
    if (pts >= 75) return { name: 'Árbol Joven', img: '/young_tree.png', level: 4 };
    if (pts >= 50) return { name: 'Planta', img: '/plant.png', level: 3 };
    if (pts >= 25) return { name: 'Brote', img: '/sprout.png', level: 2 };
    return { name: 'Semilla', img: '/seed_avatar.png', level: 1 };
  };

  const avatar = getAvatarState(points);

  const handleActionComplete = (newPoints) => {
    setPoints(newPoints);
    setShowUpload(false);
  };

  const renderContent = () => {
    return (
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center p-20 animate-pulse">
          <div className="text-4xl mb-4">🌿</div>
          <p className="text-green-600 font-black text-sm uppercase tracking-widest">Cargando módulo...</p>
        </div>
      }>
        {currentView === 'ranking' && <Ranking />}
        {currentView === 'profile' && <Profile user={user} installPrompt={installPrompt} />}
        {currentView === 'home' && (
          <main className="w-full max-w-5xl space-y-8 mt-4 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Contenido Home (ya responsivo) */}
              <section className="card text-center relative overflow-hidden group h-full flex flex-col justify-center py-10">
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-green-200">
                    Nivel {avatar.level}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold text-green-900 mb-2">Tu Avatar: <span className="text-green-600">{avatar.name}</span></h2>
                
                <div className="avatar-container my-8 animate-float relative">
                  <div className="absolute inset-0 bg-green-200/20 blur-3xl rounded-full scale-150 -z-10"></div>
                  <img src={avatar.img} alt={avatar.name} className="w-full h-full object-contain p-2 drop-shadow-2xl" />
                </div>

                <div className="w-full bg-green-100 h-4 rounded-full overflow-hidden mb-2 shadow-inner border border-green-50">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-600 h-full transition-all duration-1000 ease-out" 
                    style={{ width: `${points % 25 * 4 || (points > 0 ? 100 : 0)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center px-2 mb-4">
                  <div className="flex items-center gap-1 group cursor-help">
                    <span className="text-xl">🔥</span>
                    <span className="text-sm font-black text-orange-600 tracking-tight">Racha: {streak}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-100">
                    <span className="text-xl">🛡️</span>
                    <span className="text-sm font-black text-blue-600 tracking-tight">Escudos: {recoveries}/3</span>
                  </div>
                </div>

                <p className="text-sm text-green-600 font-bold italic bg-green-50 py-2 rounded-2xl border border-green-100 px-4 inline-block">
                   {points < 100 
                     ? `¡Faltan ${25 - (points % 25 === 0 && points !== 0 ? 25 : points % 25)} pts para evolucionar!` 
                     : '¡Nivel máximo alcanzado! 🏆'}
                </p>
              </section>

              <div className="space-y-6">
                <section className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                  <h3 className="text-xl font-black mb-3 flex items-center gap-2"> 💡 Eco-Tip</h3>
                  <p className="text-blue-50 font-medium leading-relaxed text-lg">
                    ¿Sabías que reciclar una botella de plástico ahorra energía para una bombilla por 6 horas? ¡Cada acción cuenta!
                  </p>
                </section>

                <section className="grid grid-cols-1 gap-4">
                  <button onClick={() => setShowUpload(true)} className="btn-primary w-full text-xl py-6 shadow-green-200 shadow-2xl">
                    <span className="text-4xl">📸</span>
                    <span className="font-extrabold ml-2">Registrar Acción</span>
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setCurrentView('ranking')} className="bg-white p-6 rounded-[2rem] shadow-xl border-2 border-green-100 text-green-600 font-black">
                      <span className="text-3xl">🏆</span> Ranking
                    </button>
                    <button onClick={() => setCurrentView('profile')} className="bg-white p-6 rounded-[2rem] shadow-xl border-2 border-green-100 text-green-600 font-black">
                      <span className="text-3xl">👤</span> Perfil
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </main>
        )}
      </Suspense>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-10">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-green-400 blur-3xl opacity-20 animate-pulse"></div>
          <div className="text-7xl animate-float">🌿</div>
        </div>
        <h1 className="text-3xl font-black text-green-900 mb-2">EcoPunto</h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-200"></div>
          <div className="w-2 h-2 bg-green-300 rounded-full animate-bounce delay-300"></div>
        </div>
        <p className="text-green-600 font-black text-xs uppercase tracking-widest mt-6 opacity-60">Iniciando misión ecológica...</p>
      </div>
    );
  }

  if (isAdminView && user?.isAdmin) {
    return (
      <Suspense fallback={null}>
        <AdminDashboard onBack={() => setIsAdminView(false)} />
      </Suspense>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={null}>
        <Register onRegister={() => initApp()} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fdf9] flex flex-col items-center p-4">
      {/* Header */}
      <header className="w-full max-w-5xl flex justify-between items-center py-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {logo ? (
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain rounded-xl shadow-md border border-white" />
            ) : (
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-md">🌿</div>
            )}
            <h1 className="text-2xl font-black text-green-900 tracking-tight">EcoPunto</h1>
          </div>
          <p className="text-sm font-bold text-green-600 ml-1">Hola, {user?.name.split(' ')[0]} 👋</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="bg-white px-5 py-2.5 rounded-2xl shadow-xl shadow-green-900/5 border border-green-100 flex items-center gap-2 transform transition-all hover:scale-105">
            <span className="text-yellow-500 text-xl font-bold">⭐</span>
            <span className="font-black text-green-900 text-lg tracking-tight">{points} <span className="text-[10px] uppercase text-green-500">pts</span></span>
          </div>
        </div>
      </header>

      {renderContent()}

      {/* Navigation Bar (Mobile) */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/90 backdrop-blur-2xl p-4 rounded-[2.5rem] shadow-2xl shadow-green-900/20 border border-white/50 flex justify-between items-center px-10 z-40">
        <div 
          onClick={() => { setCurrentView('home'); setIsAdminView(false); }}
          className={`text-2xl cursor-pointer transition-all p-2 rounded-2xl ${currentView === 'home' && !isAdminView ? 'bg-green-100 text-green-600 scale-110 shadow-inner' : 'text-green-300 hover:text-green-500'}`}
        >
          🏠
        </div>
        <div 
          onClick={() => { setCurrentView('ranking'); setIsAdminView(false); }}
          className={`text-2xl cursor-pointer transition-all p-2 rounded-2xl ${currentView === 'ranking' ? 'bg-green-100 text-green-600 scale-110 shadow-inner' : 'text-green-300 hover:text-green-500'}`}
        >
          📊
        </div>
        <div 
          onClick={() => { setCurrentView('profile'); setIsAdminView(false); }}
          className={`text-2xl cursor-pointer transition-all p-2 rounded-2xl ${currentView === 'profile' ? 'bg-green-100 text-green-600 scale-110 shadow-inner' : 'text-green-300 hover:text-green-500'}`}
        >
          📝
        </div>
        {user?.isAdmin && (
          <div 
            onClick={() => setIsAdminView(true)}
            className={`text-2xl cursor-pointer transition-all p-2 rounded-2xl ${isAdminView ? 'bg-slate-100 text-slate-800 scale-110 shadow-inner' : 'text-green-300 hover:text-slate-500'}`}
            title="Panel Admin"
          >
            ⚙️
          </div>
        )}
      </footer>

      {/* Modals */}
      {showUpload && (
        <div className="fixed inset-0 bg-green-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md animate-in slide-in-from-bottom duration-500">
            <PhotoUpload 
              user={user} 
              onUploadComplete={handleActionComplete} 
              onCancel={() => setShowUpload(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
