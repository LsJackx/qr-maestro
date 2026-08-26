import React, { useState } from 'react';
import { Download, Smartphone, Laptop, Check, X, Sparkles, Share2 } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstalled: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstalled
}) => {
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isOpen) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onInstalled();
        onClose();
      }
      setIsInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
              Progressive Web App (PWA)
            </span>
            <h3 className="text-lg font-bold">Instalar QRMaestro</h3>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Accede instantáneamente a QRMaestro desde tu pantalla de inicio o escritorio, con soporte sin conexión, mayor velocidad y notificaciones de escaneos.
        </p>

        {/* Benefits list */}
        <div className="space-y-2.5 mb-6 bg-gray-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-gray-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Sin descargas pesadas de tienda (menos de 1 MB)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Genera y descarga códigos QR incluso sin conexión</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Notificaciones en tiempo real cuando alguien escanea tus QR</span>
          </div>
        </div>

        {/* Actions based on OS */}
        {deferredPrompt ? (
          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>{isInstalling ? 'Instalando...' : 'Instalar en este Dispositivo'}</span>
          </button>
        ) : isIOS ? (
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Share2 className="w-4 h-4" /> Cómo instalar en iOS / iPhone:
            </p>
            <p>1. Toca el botón <strong>Compartir</strong> en Safari (abajo).</p>
            <p>2. Selecciona <strong>"Añadir a pantalla de inicio"</strong>.</p>
          </div>
        ) : (
          <div className="p-3 bg-gray-100 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Laptop className="w-4 h-4" /> En Chrome / Edge:
            </p>
            <p>Toca el icono de instalación (icono de pantalla o flecha) en la barra de direcciones de tu navegador.</p>
          </div>
        )}
      </div>
    </div>
  );
};
