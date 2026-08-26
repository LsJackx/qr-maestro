import React from 'react';
import { Check, X } from 'lucide-react';

interface PricingPlansProps {
  onClose: () => void;
  onSubscribe: () => void;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({ onClose, onSubscribe }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 relative overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto md:overflow-visible">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 z-10">
          <X className="w-5 h-5 text-slate-500" />
        </button>

        {/* Free Tier */}
        <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Visitante</h3>
          <p className="text-slate-500 mb-6 text-sm">Para uso rápido y casual.</p>
          <div className="text-4xl font-bold text-slate-900 dark:text-white mb-6">$0</div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <Check className="w-5 h-5 text-green-500" /> Generación Ilimitada
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <Check className="w-5 h-5 text-green-500" /> Descarga PNG (Alta Calidad)
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <Check className="w-5 h-5 text-green-500" /> Personalización Básica
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-400">
              <X className="w-5 h-5" /> Guardar Historial
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-400">
              <X className="w-5 h-5" /> Sin Anuncios
            </li>
          </ul>
          
          <button onClick={onClose} className="w-full py-3 rounded-xl border border-gray-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            Continuar Gratis
          </button>
        </div>

        {/* Registered Tier (Focus of the request) */}
        <div className="flex-1 p-8 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-b-lg shadow-lg">
            Recomendado
          </div>
          
          <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Cuenta Gratuita</h3>
          <p className="text-slate-500 mb-6 text-sm">Guarda y gestiona tus diseños.</p>
          <div className="text-4xl font-bold text-slate-900 dark:text-white mb-6">$0</div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <Check className="w-5 h-5 text-indigo-500" /> <strong>Todo lo de Visitante</strong>
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <Check className="w-5 h-5 text-indigo-500" /> <strong>Guardar Historial en Nube</strong>
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <Check className="w-5 h-5 text-indigo-500" /> Edición posterior
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-400">
              <X className="w-5 h-5" /> Sin Anuncios
            </li>
          </ul>
          
          <button onClick={onSubscribe} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/30 transition-all">
            Crear Cuenta Gratis
          </button>
        </div>
      </div>
    </div>
  );
};