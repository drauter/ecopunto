import React, { useState, useRef } from 'react';
import { supabase } from './supabaseClient';

function Register({ onRegister }) {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false); // Ref para evitar stale closure en el timeout
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    loadingRef.current = true;
    setError(null);

    // Timeout de seguridad: Si pasan 45s y seguimos cargando, forzamos error
    const timeoutId = setTimeout(() => {
      if (loadingRef.current) {
        setError("La conexión es muy lenta o inestable. Por favor, intenta de nuevo.");
        setLoading(false);
        loadingRef.current = false;
      }
    }, 45000);

    try {
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password
        });
        if (loginError) throw loginError;
      } else {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              full_name: formData.name.trim(),
              course: formData.course
            }
          }
        });
        if (signUpError) throw signUpError;
        if (!authData?.user) throw new Error("No se pudo crear la cuenta.");

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: formData.name.trim(),
              course: formData.course,
              points: 0,
              is_admin: formData.course === 'Docente'
            }
          ]);
        if (profileError) throw profileError;
      }
      
      clearTimeout(timeoutId);
      loadingRef.current = false;
      onRegister();
    } catch (err) {
      clearTimeout(timeoutId);
      loadingRef.current = false;
      setLoading(false);
      console.error("Auth error:", err);
      
      if (err.message?.includes("Invalid login credentials")) {
        setError("Correo o contraseña incorrectos.");
      } else if (err.message?.includes("User already registered")) {
        setError("Este correo ya está registrado.");
      } else {
        setError(err.message || "Error al conectar con el servidor.");
      }
    } finally {
      // El setLoading(false) aquí podría causar problemas si onRegister() ya cambió la vista
      // así que solo lo hacemos si seguimos en esta vista (loadingRef es false)
      if (!loadingRef.current) {
        setLoading(false);
      }
    }
  };

  const courses = [
    '4to A', '4to B', '4to C', '4to D',
    '5to A', '5to B', '5to C', '5to D',
    '6to A', '6to B', '6to C', '6to D',
    'Docente'
  ];

  return (
    <div className="min-h-screen bg-[#f0fdf4] flex items-center justify-center p-4 md:p-8 lg:p-12">
      <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-green-100 min-h-[600px]">
        
        {/* Lado Izquierdo: Branding */}
        <div className="md:w-1/2 bg-gradient-to-br from-green-500 to-emerald-700 p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-400/20 rounded-full -ml-20 -mb-20 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center text-4xl shadow-2xl mb-8 animate-float">🌿</div>
            <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">EcoPunto: La misión escolar por el planeta</h1>
            <p className="text-green-50 text-lg font-medium opacity-90 leading-relaxed mb-8">
              Únete a cientos de estudiantes que ya están transformando su escuela. Sube fotos, gana puntos y evoluciona tu avatar mientras cuidas el medio ambiente.
            </p>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                <span className="text-2xl">📸</span>
                <span className="font-bold">Registra acciones reales</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                <span className="text-2xl">🏆</span>
                <span className="font-bold">Compite en el ranking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Formulario */}
        <div className="md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-8 md:hidden">
              <h1 className="text-4xl font-black text-green-900 mb-2">EcoPunto</h1>
            </div>

            <h2 className="text-3xl font-black text-green-900 mb-2">
              {isLogin ? '¡Hola de nuevo!' : 'Crea tu cuenta'}
            </h2>
            <p className="text-green-600 font-bold mb-8 opacity-80 uppercase tracking-widest text-xs">
              {isLogin ? 'Ingresa para continuar tu racha' : 'Comienza tu aventura ecológica'}
            </p>

            {error && (
              <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold text-center animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-green-800 mb-1 ml-2 uppercase opacity-60">Nombre</label>
                    <input 
                      type="text" 
                      placeholder="Tu nombre"
                      className="w-full bg-green-50 border-2 border-green-100 rounded-2xl py-3 px-4 focus:border-green-500 focus:outline-none transition-all text-green-900 font-bold"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-green-800 mb-1 ml-2 uppercase opacity-60">Curso</label>
                    <select 
                      className="w-full bg-green-50 border-2 border-green-100 rounded-2xl py-3 px-4 focus:border-green-500 focus:outline-none transition-all text-green-900 font-bold appearance-none"
                      value={formData.course}
                      onChange={(e) => setFormData({...formData, course: e.target.value})}
                      required
                    >
                      <option value="">Elegir...</option>
                      {courses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-green-800 mb-1 ml-2 uppercase opacity-60">Correo Electrónico</label>
                <input 
                  type="email" 
                  placeholder="estudiante@escuela.com"
                  className="w-full bg-green-50 border-2 border-green-100 rounded-2xl py-3 px-4 focus:border-green-500 focus:outline-none transition-all text-green-900 font-bold"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-green-800 mb-1 ml-2 uppercase opacity-60">Contraseña</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-green-50 border-2 border-green-100 rounded-2xl py-3 px-4 focus:border-green-500 focus:outline-none transition-all text-green-900 font-bold"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary mt-6 text-lg py-4 disabled:opacity-50 shadow-green-200 shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">🌿</span> Procesando...
                  </span>
                ) : (isLogin ? 'Entrar Ahora 🚀' : '¡Únete a la Misión! 🌍')}
              </button>
            </form>

            <div className="text-center mt-8 pt-6 border-t border-green-50">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                disabled={loading}
                className="text-green-600 font-black hover:text-green-800 transition-colors uppercase text-xs tracking-widest disabled:opacity-30"
              >
                {isLogin ? '¿Eres nuevo? Crea una cuenta' : '¿Ya eres miembro? Inicia sesión'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
