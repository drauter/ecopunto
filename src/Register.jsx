import React, { useState } from 'react';

function Register({ onRegister }) {
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    email: '',
    code: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.course) {
      onRegister(formData);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 border border-green-100 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-green-50 rounded-full blur-3xl opacity-50"></div>

        <div className="text-center mb-8 relative">
          <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center text-white text-4xl shadow-lg mx-auto mb-4 animate-float">🌿</div>
          <h1 className="text-3xl font-black text-green-900 mb-2">¡Bienvenido!</h1>
          <p className="text-green-600 font-medium">Únete a la misión EcoPunto</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative">
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
              <option value="5to A">5to A</option>
              <option value="5to B">5to B</option>
              <option value="6to A">6to A</option>
              <option value="6to B">6to B</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-green-800 mb-1 ml-2">Código de acceso (Opcional)</label>
            <input 
              type="text" 
              placeholder="Código de tu profesor"
              className="w-full bg-green-50 border-2 border-green-100 rounded-2xl py-3 px-4 focus:border-green-500 focus:outline-none transition-all text-green-900"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            className="w-full btn-primary mt-6 text-lg py-4"
          >
            Empezar a Cuidar 🌍
          </button>
        </form>

        <p className="text-center text-xs text-green-400 mt-8">
          Al registrarte, te comprometes a cuidar nuestro entorno escolar.
        </p>
      </div>
    </div>
  );
}

export default Register;
