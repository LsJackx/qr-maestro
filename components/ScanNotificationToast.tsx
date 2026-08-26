import React, { useEffect } from 'react';
import { Bell, Smartphone, Globe, BarChart3, X, Zap } from 'lucide-react';
import { ScanEvent, HistoryItem } from '../types';

interface ScanNotificationToastProps {
  scan: ScanEvent & { qrTitle?: string };
  onClose: () => void;
  onOpenAnalytics: (qrId: string, title?: string) => void;
  pushEnabled: boolean;
  onRequestPush: () => void;
}

export const ScanNotificationToast: React.FC<ScanNotificationToastProps> = ({
  scan,
  onClose,
  onOpenAnalytics,
  pushEnabled,
  onRequestPush
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000);
    return () => clearTimeout(timer);
  }, [scan, onClose]);

  const locationText = scan.country && scan.country !== 'Desconocido'
    ? (scan.city && scan.city !== 'Desconocido' ? `${scan.city}, ${scan.country}` : scan.country)
    : 'Ubicación directa';

  return (
    <div className="fixed bottom-5 right-5 z-[80] max-w-sm w-full bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <span className="inline-block text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full mb-0.5">
              ¡Nuevo Escaneo en Vivo!
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]" title={scan.qrTitle || 'Código QR'}>
              {scan.qrTitle || 'Código QR'}
            </h4>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Details */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
          <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="truncate" title={locationText}>{locationText}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
          <Smartphone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="truncate">{scan.device || 'Móvil'} ({scan.os || 'Web'})</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex items-center justify-between gap-2">
        {!pushEnabled && (
          <button
            onClick={onRequestPush}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
          >
            <Zap className="w-3 h-3" />
            <span>Activar Push</span>
          </button>
        )}

        <button
          onClick={() => {
            onOpenAnalytics(scan.qrId, scan.qrTitle);
            onClose();
          }}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Ver Métricas</span>
        </button>
      </div>
    </div>
  );
};
