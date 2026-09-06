import React from 'react';
import { Sparkles, QrCode, Zap, ShieldCheck, Star } from 'lucide-react';

interface HeroSectionProps {
  onStart: () => void;
  onOpenTemplates?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStart, onOpenTemplates }) => {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-950 pt-16 pb-12 lg:pt-24 lg:pb-16">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-800">
            <Sparkles className="w-3 h-3" /> Potenciado con Inteligencia Artificial
          </div>
          {onOpenTemplates && (
            <button
              onClick={onOpenTemplates}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800/80 shadow-xs transition-all active:scale-95"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>20 Plantillas Predefinidas: Google Reseñas, Wi-Fi, Menú...</span>
            </button>
          )}
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          Generador de QR <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Profesional</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Crea códigos QR únicos, artísticos y funcionales en segundos. Personaliza colores, marcos, tarjetas para imprimir y carteles de Google Reseñas.
          <br className="hidden md:block" />
          <span className="font-semibold text-slate-900 dark:text-slate-200">Gratis para siempre.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button 
            onClick={onStart}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/20 transition-all transform hover:-translate-y-1 flex items-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            Crear mi QR Ahora
          </button>
          {onOpenTemplates ? (
            <button 
              onClick={onOpenTemplates}
              className="px-8 py-4 bg-amber-50 dark:bg-slate-900 text-amber-900 dark:text-amber-200 border-2 border-amber-300 dark:border-amber-700/70 hover:bg-amber-100 dark:hover:bg-slate-800 rounded-2xl font-bold text-lg transition-all flex items-center gap-2 shadow-sm"
            >
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
              Ver Plantillas Listas
            </button>
          ) : (
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-2xl font-bold text-lg transition-all"
            >
              Ver Características
            </button>
          )}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
           <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold">
             <ShieldCheck className="w-5 h-5" /> Seguro & Privado
           </div>
           <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold">
             <Zap className="w-5 h-5" /> Renderizado Rápido
           </div>
           <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold">
             <Sparkles className="w-5 h-5" /> Diseño IA
           </div>
        </div>
      </div>
    </div>
  );
};