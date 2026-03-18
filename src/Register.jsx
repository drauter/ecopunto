import React, { useState } from 'react';
import { supabase } from './supabaseClient';

function Register({ onRegister }) {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setError(null);

    const timeoutId = setTimeout(() => {
      setError("La conexión está tardando demasiado. Por favor, revisa tu conexión o las claves de configuración.");
      setLoading(false);
    }, 10000);

    try {
      console.log("Iniciando proceso de " + (isLogin ? "login" : "registro") + "...");
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (loginError) throw loginError;
        console.log("Login exitoso");
      } else {
        // Registro
        console.log("Intentando registro de auth...");
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              course: formData.course
            }
          }
        });
        if (signUpError) throw signUpError;
        console.log("Auth de registro exitosa, creando perfil...");

        // Crear perfil en la tabla 'profiles'
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: formData.name,
              course: formData.course,
              points: 0,
              is_admin: formData.course === 'Docente'
            }
          ]);
        if (profileError) throw profileError;
        console.log("Perfil creado exitosamente");
      }
      onRegister();
    } catch (err) {
      console.error("Error en " + (isLogin ? "login" : "registro") + ":", err);
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const courses = [
    '4to A', '4to B', '4to C', '4to D',
    '5to A', '5to B', '5to C', '5to D',
    '6to A', '6to B', '6to C', '6to D',
    'Docente'
  ];

  return (
    <div className="min-h-screen bg-[#f0fdf4] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 border border-green-100 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-green-50 rounded-full blur-3xl opacity-50"></div>

        <div className="text-center mb-8 relative">
          <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center text-white text-4xl shadow-lg mx-auto mb-4 animate-float">🌿</div>
          <h1 className="text-3xl font-black text-green-900 mb-2">
            {isLogin ? '¡Hola de nuevo!' : '¡Bienvenido!'}
          </h1>
          <p className="text-green-600 font-medium">
            {isLogin ? 'Ingresa a tu cuenta EcoPunto' : 'Únete a la misión EcoPunto'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-bold text-green-800 mb-1 ml-2">Nombre Completo</label>
                <input 
                  type="text" 
                  placeholder="Ej: Mateo González"
                  className="w-full bg-green-50 border-2 border-green-100 rounded-2xl py-3 px-4 focus:border-green-500 focus:outline-none transition-all text-green-900"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-green-800 mb-1 ml-2">Curso / Grado</label>
                <select 
                  className="w-full bg-green-50 border-2 border-green-100 rounded-2xl py-3 px-4 focus:border-green-500 focus:outline-none transition-all text-green-900 appearance-none"
                  value={formData.course}
                  onChange={(e) => setFormData({...formData, course: e.target.value})}
                  required
                >
                  <option value="">Selecciona tu curso</option>
                  {courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-bold text-green-800 mb-1 ml-2">Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="tu@email.com"
              className="w-full bg-green-50 border-2 border-green-100 rounded-2xl py-3 px-4 focus:border-green-500 focus:outline-none transition-all text-green-900"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-green-800 mb-1 ml-2">Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-green-50 border-2 border-green-100 rounded-2xl py-3 px-4 focus:border-green-500 focus:outline-none transition-all text-green-900"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary mt-6 text-lg py-4 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : (isLogin ? 'Entrar 🚀' : 'Empezar a Cuidar 🌍')}
          </button>
        </form>

        <div className="text-center mt-6">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-green-600 font-bold hover:underline"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Accede aquí'}
          </button>
        </div>

        <p className="text-center text-xs text-green-400 mt-8">
          Al {isLogin ? 'entrar' : 'registrarte'}, te comprometes a cuidar nuestro entorno escolar.
        </p>
      </div>
    </div>
  );
}

export default Register;
