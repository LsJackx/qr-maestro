import React, { useState } from 'react';
import { Sparkles, Loader2, Palette, Wand2 } from 'lucide-react';
import { generateQRDesign } from '../services/gemini';

interface AIHelperProps {
  onSuccess: (colors: { fgColor: string; bgColor: string }, suggestion: string) => void;
}

export const AIHelper: React.FC<AIHelperProps> = ({ onSuccess }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateQRDesign(prompt);
      onSuccess({ fgColor: result.fgColor, bgColor: result.bgColor }, result.suggestion);
      setPrompt('');
      setIsOpen(false);
    } catch (err) {
      setError('No pudimos generar el estilo. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full mb-6 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-900/20 border border-indigo-400/20 group"
      >
        <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="tracking-wide">Asistente Mágico de Diseño</span>
      </button>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-indigo-500/30 shadow-xl relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-indigo-600 dark:text-indigo-300 font-bold flex items-center gap-2 text-lg">
          <Palette className="w-5 h-5" />
          Creador de Estilos IA
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm font-medium bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full transition-colors">Cerrar</button>
      </div>

      <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed">
        Dime qué estás creando y la IA elegirá los colores perfectos para ti.
        <br/>
        <span className="text-slate-400 dark:text-slate-500 italic">Ejemplos: "Cumpleaños de 15 rosa y dorado", "Menú de restaurante italiano", "WiFi para oficina moderna".</span>
      </p>

      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe tu idea aquí..."
          className="w-full bg-gray-50 dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-indigo-500 focus:ring-0 outline-none resize-none h-24 mb-4 transition-all"
        />
        <div className="absolute bottom-6 right-2 pointer-events-none">
           <Sparkles className="w-4 h-4 text-indigo-500/50" />
        </div>
      </div>

      {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-900/50">{error}</p>}

      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-200 dark:disabled:bg-slate-800 disabled:text-gray-400 dark:disabled:text-slate-600 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Generar Magia</>}
      </button>
    </div>
  );
};