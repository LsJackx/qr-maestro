
import React, { useEffect, useState } from 'react';
import { X, BarChart3, Smartphone, Globe, Calendar, MapPin, Compass } from 'lucide-react';
import { HistoryItem, ScanEvent } from '../types';
import { subscribeToAnalytics } from '../services/firebase';

interface AnalyticsPanelProps {
  qr: HistoryItem;
  onClose: () => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ qr, onClose }) => {
  const [scans, setScans] = useState<ScanEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (qr.shortId) {
      console.log("[DEBUG Panel] Mounting analytics for:", qr.shortId);
      // Use real-time subscription
      unsubscribe = subscribeToAnalytics(qr.shortId, (data) => {
        console.log("[DEBUG Panel] Data received in component:", data.length);
        setScans(data);
        setLoading(false);
      });
    } else {
      console.warn("[DEBUG Panel] No shortId provided for analytics");
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [qr]);

  // --- DATA PROCESSING ---

  // 1. Time Series (Last 7 days)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
    }
    return days;
  };

  const timeLabels = getLast7Days();
  const timeData = timeLabels.map(label => {
    return scans.filter(s => {
        const d = new Date(s.timestamp);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) === label;
    }).length;
  });
  
  // Calculate SVG Polyline points
  const maxScans = Math.max(...timeData, 1); // Avoid division by zero
  const points = timeData.map((val, idx) => {
     // Fix potential division by zero if length is 1
     const denominator = timeData.length > 1 ? timeData.length - 1 : 1;
     const x = (Number(idx) / Number(denominator)) * 100;
     
     // Ensure y is a valid number
     let y = 100 - (Number(val) / Number(maxScans)) * 100;
     if (isNaN(y)) y = 100;

     return `${x},${y}`;
  }).join(' ');

  // 2. OS Stats
  const osStats = scans.reduce((acc, curr) => {
    const os = curr.os || 'Unknown';
    acc[os] = (acc[os] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalOs = scans.length > 0 ? scans.length : 1;

  // 3. Device Stats
  const deviceStats = scans.reduce((acc, curr) => {
    const dev = curr.device || 'Unknown';
    acc[dev] = (acc[dev] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 4. Country & City Stats
  const countryStats = scans.reduce((acc, curr) => {
    const loc = curr.country && curr.country !== 'Desconocido' 
      ? (curr.city && curr.city !== 'Desconocido' ? `${curr.city}, ${curr.country}` : curr.country)
      : 'Ubicación Anónima / Directa';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg relative">
                 <BarChart3 className="w-6 h-6" />
                 <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
              </div>
              <div>
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Datos Analíticos
                    <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">En Vivo</span>
                 </h2>
                 <p className="text-xs text-slate-500">{qr.title} (ID: {qr.shortId})</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors">
             <X className="w-5 h-5 text-slate-500" />
           </button>
        </div>

        <div className="overflow-y-auto p-6 md:p-8 bg-gray-50/50 dark:bg-slate-950/50 flex-1">
            
            {loading ? (
               <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
               </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                  {/* SUMMARY CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600"><Calendar className="w-5 h-5" /></div>
                           <span className="text-sm text-slate-500 font-medium">Periodo</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">Últimos 7 días</div>
                     </div>

                     <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4"></div>
                        <div className="flex items-center gap-3 mb-2">
                           <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600"><BarChart3 className="w-5 h-5" /></div>
                           <span className="text-sm text-slate-500 font-medium">Total Escaneos</span>
                        </div>
                        <div className="text-4xl font-bold text-slate-900 dark:text-white">{scans.length}</div>
                     </div>

                     <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 relative overflow-hidden">
                         <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4"></div>
                        <div className="flex items-center gap-3 mb-2">
                           <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600"><Globe className="w-5 h-5" /></div>
                           <span className="text-sm text-slate-500 font-medium">Dispositivos Únicos</span>
                        </div>
                        {/* Simple unique estimation based on distinct browsers/OS combo in dataset */}
                        <div className="text-4xl font-bold text-slate-900 dark:text-white">
                           {new Set(scans.map(s => s.os + s.browser + s.device)).size}
                        </div>
                     </div>
                  </div>

                  {/* MAIN CHART */}
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">Actividad de Escaneo</h3>
                      
                      <div className="h-64 w-full relative flex items-end gap-2 pb-6 px-2">
                         {/* CSS/SVG Chart implementation to avoid heavy libraries */}
                         <svg className="absolute inset-0 h-full w-full overflow-visible z-10" preserveAspectRatio="none">
                             <polyline 
                                fill="none" 
                                stroke="#6366f1" 
                                strokeWidth="3" 
                                points={points}
                                vectorEffect="non-scaling-stroke"
                                className="drop-shadow-lg transition-all duration-500 ease-in-out"
                             />
                             <defs>
                                <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2"/>
                                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                                </linearGradient>
                             </defs>
                             <polygon 
                               fill="url(#grad)" 
                               points={`0,100 ${points} 100,100`}
                               vectorEffect="non-scaling-stroke"
                               className="transition-all duration-500 ease-in-out"
                             />
                         </svg>

                         {/* Grid Lines */}
                         <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-400 pointer-events-none z-0">
                             <div className="border-b border-dashed border-gray-200 dark:border-slate-700 w-full h-0"></div>
                             <div className="border-b border-dashed border-gray-200 dark:border-slate-700 w-full h-0"></div>
                             <div className="border-b border-dashed border-gray-200 dark:border-slate-700 w-full h-0"></div>
                             <div className="border-b border-dashed border-gray-200 dark:border-slate-700 w-full h-0"></div>
                             <div className="border-b border-gray-300 dark:border-slate-600 w-full h-0"></div>
                         </div>
                      </div>

                      {/* X Axis Labels */}
                      <div className="flex justify-between mt-2 text-xs text-slate-400">
                          {timeLabels.map((label, i) => (
                              <span key={i}>{label}</span>
                          ))}
                      </div>
                  </div>

                  {/* BOTTOM GRIDS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* OS Breakdown */}
                      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
                          <h3 className="text-md font-bold text-slate-800 dark:text-slate-200 mb-4">Sistemas Operativos</h3>
                          <div className="space-y-4">
                              {Object.entries(osStats).map(([os, count]) => {
                                  const percent = Math.round((Number(count) / Number(totalOs)) * 100);
                                  return (
                                      <div key={os}>
                                          <div className="flex justify-between text-sm mb-1">
                                              <span className="text-slate-600 dark:text-slate-300">{os}</span>
                                              <span className="font-bold text-slate-900 dark:text-white">{percent}%</span>
                                          </div>
                                          <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2.5">
                                              <div className="bg-indigo-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                                          </div>
                                      </div>
                                  )
                              })}
                              {Object.keys(osStats).length === 0 && <p className="text-sm text-slate-400">Sin datos aún.</p>}
                          </div>
                      </div>

                      {/* Device Breakdown */}
                      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
                          <h3 className="text-md font-bold text-slate-800 dark:text-slate-200 mb-4">Tipo de Dispositivo</h3>
                           <div className="flex justify-center gap-4 items-end h-40 pb-4 border-b border-gray-100 dark:border-slate-700 mb-4">
                               {['Mobile', 'Desktop', 'Tablet'].map(d => {
                                   const count = Number(deviceStats[d] || 0);
                                   const height = count > 0 ? (count / totalOs) * 100 : 5;
                                   return (
                                       <div key={d} className="flex flex-col items-center gap-2 group w-16">
                                           <div 
                                             className="w-full bg-emerald-400 rounded-t-lg transition-all duration-700 relative group-hover:bg-emerald-500" 
                                             style={{ height: `${height}%` }}
                                           >
                                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 dark:text-slate-300">
                                                {count}
                                              </div>
                                           </div>
                                           <Smartphone className="w-4 h-4 text-slate-400" />
                                       </div>
                                   )
                               })}
                           </div>
                           <div className="flex justify-between text-xs text-slate-400 px-4">
                               <span>Móvil</span>
                               <span>Escritorio</span>
                               <span>Tablet</span>
                           </div>
                      </div>

                      {/* Geographic & City Breakdown */}
                      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
                          <h3 className="text-md font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                             <MapPin className="w-4 h-4 text-rose-500" />
                             Ubicación / Geografía
                          </h3>
                          <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                              {Object.entries(countryStats).map(([loc, count]) => {
                                  const percent = Math.round((Number(count) / Number(totalOs)) * 100);
                                  return (
                                      <div key={loc} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                                          <div className="flex justify-between text-xs font-medium mb-1.5">
                                              <span className="text-slate-700 dark:text-slate-300 truncate max-w-[170px]" title={loc}>{loc}</span>
                                              <span className="font-bold text-indigo-600 dark:text-indigo-400">{count} ({percent}%)</span>
                                          </div>
                                          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                                              <div className="bg-rose-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${percent}%` }}></div>
                                          </div>
                                      </div>
                                  )
                              })}
                              {Object.keys(countryStats).length === 0 && <p className="text-sm text-slate-400">Sin datos de ubicación aún.</p>}
                          </div>
                      </div>

                  </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
