import React, { useState, useRef } from 'react';
import { supabase } from './supabaseClient';
import { validateCleanup } from './geminiService';

function PhotoUpload({ user, onUploadComplete, onCancel }) {
  const [image, setImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      setUploadStatus('Optimizando imagen...');
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 1200;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.82);
        };
      };
    });
  };

  const uploadPhoto = async () => {
    if (!image || !user) return;
    setUploadStatus('Iniciando...');

    try {
      // 1. Compresión
      const compressedImage = await compressImage(image);
      
      // 2. Subida
      setUploadStatus('Subiendo a la nube...');
      const fileExt = 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('activities')
        .upload(filePath, compressedImage, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('activities')
        .getPublicUrl(filePath);

      // 3. IA
      setUploadStatus('IA Analizando tu acción...');
      const aiResult = await validateCleanup(compressedImage);
      const pointsEarned = aiResult.is_valid ? aiResult.score : 0;

      // 4. DB
      setUploadStatus('Guardando progreso...');
      const { error: activityError } = await supabase
        .from('activities')
        .insert([
          {
            student_id: user.id,
            image_url: publicUrl,
            status: aiResult.is_valid ? 'approved' : 'rejected',
            ai_score: pointsEarned,
            ai_metadata: aiResult
          }
        ]);

      if (activityError) throw activityError;

      if (pointsEarned > 0) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('points, streak, last_action_at')
          .eq('id', user.id)
          .single();

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const lastActionDate = profile.last_action_at ? new Date(profile.last_action_at).toISOString().split('T')[0] : null;
        
        let newStreak = profile.streak || 1;
        
        if (lastActionDate) {
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (lastActionDate === yesterdayStr) {
            newStreak += 1;
          } else if (lastActionDate !== today) {
            newStreak = 1;
          }
        }

        const newPoints = Math.min((profile.points || 0) + pointsEarned, 100);
        
        await supabase.from('profiles').update({ 
          points: newPoints, 
          streak: newStreak,
          last_action_at: now.toISOString()
        }).eq('id', user.id);
      }

      onUploadComplete(pointsEarned);
      
      if (pointsEarned === 0) {
        alert("¡IA Informa!: " + (aiResult.reason || "No se detectó una acción ecológica clara. ¡Inténtalo de nuevo recolectando basura!"));
      } else {
        alert("¡Excelente trabajo!: " + aiResult.reason);
      }
    } catch (error) {
      console.error('Error al subir:', error);
      alert('Error al subir la foto: ' + error.message);
    } finally {
      setUploadStatus('');
    }
  };

  const isUploading = uploadStatus !== '';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl animate-scaleIn">
        <h2 className="text-2xl font-black text-green-900 mb-2 text-center">Registrar Acción 📸</h2>
        <p className="text-green-600 text-center mb-6 font-medium">Sube una foto recogiendo basura</p>

        {!preview ? (
          <div 
            onClick={() => !isUploading && fileInputRef.current.click()}
            className="w-full aspect-square bg-green-50 border-4 border-dashed border-green-200 rounded-[30px] flex flex-col items-center justify-center cursor-pointer hover:bg-green-100 transition-colors"
          >
            <span className="text-5xl mb-2">📷</span>
            <span className="text-green-800 font-bold">Tocar para tomar foto</span>
          </div>
        ) : (
          <div className="relative w-full aspect-square rounded-[30px] overflow-hidden border-4 border-green-500 shadow-lg mb-6">
            <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
            {!isUploading && (
              <button 
                onClick={() => { setImage(null); setPreview(null); }}
                className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-colors"
              >
                🔄
              </button>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-green-900/40 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white px-6 py-3 rounded-full shadow-xl animate-bounce">
                  <span className="font-black text-green-600">⚡ {uploadStatus}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col gap-3 mt-8">
          {preview && (
            <button 
              onClick={uploadPhoto}
              disabled={isUploading}
              className={`btn-primary w-full py-4 text-lg ${isUploading ? 'opacity-50' : ''}`}
            >
              {isUploading ? uploadStatus : '¡Enviar a Revisión! 🚀'}
            </button>
          )}
          <button 
            onClick={onCancel}
            disabled={isUploading}
            className="text-slate-400 font-bold py-2 hover:text-slate-600 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default PhotoUpload;
