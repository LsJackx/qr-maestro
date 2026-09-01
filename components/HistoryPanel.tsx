
import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { Trash2, Clock, QrCode, BarChart3, Edit2, LayoutDashboard, PanelLeftClose, Cloud, Search, Check, X } from 'lucide-react';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onAnalytics: (item: HistoryItem) => void;
  onRename?: (id: string, newTitle: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  history, 
  onSelect, 
  onDelete,
  onAnalytics,
  onRename,
  isOpen,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  const filteredHistory = history.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.value && item.value.toLowerCase().includes(q)) ||
      (item.targetContent && item.targetContent.toLowerCase().includes(q))
    );
  });

  const startEditing = (e: React.MouseEvent, item: HistoryItem) => {
    e.stopPropagation();
    setEditingId(item.id || item.shortId || '');
    setEditTitleValue(item.title || 'Código QR');
  };

  const saveRename = (e: React.MouseEvent | React.FormEvent, id: string) => {
    e.stopPropagation();
    if (onRename && editTitleValue.trim()) {
      onRename(id, editTitleValue.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className={`
        fixed inset-y-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transform transition-all duration-300 ease-in-out flex flex-col shadow-xl lg:shadow-none
        ${isOpen ? 'translate-x-0 w-80' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:overflow-hidden lg:border-r-0'}
        lg:relative lg:h-full
      `}>
        <div className="p-5 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center shrink-0 whitespace-nowrap overflow-hidden">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-indigo-500" />
              Mis Códigos
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <Cloud className="w-3.5 h-3.5" />
              <span>Sincronizado con Firebase</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800" title="Ocultar Panel">
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Global Analytics Quick Link */}
        <div className="p-3 border-b border-gray-100 dark:border-slate-800/80 bg-emerald-50/40 dark:bg-emerald-950/20">
          <button
            onClick={() => onAnalytics({} as any)}
            className="w-full flex items-center justify-between px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-98"
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Panel de Analítica Pro</span>
            </span>
            <span className="bg-emerald-700 text-emerald-100 text-[10px] px-1.5 py-0.5 rounded font-mono">Página</span>
          </button>
        </div>

        {/* Search Input */}
        {history.length > 3 && (
          <div className="px-3 pt-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-w-[20rem]">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500">
              <QrCode className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">
                {searchQuery ? 'No se encontraron códigos coincidentes.' : 'No hay códigos guardados.'}
              </p>
              <p className="text-xs mt-1 text-slate-400">Guarda tus QR asignándoles un nombre personalizado.</p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const itemId = item.id || item.shortId || '';
              const isEditingThis = editingId === itemId;

              return (
                <div 
                  key={itemId} 
                  className="group bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 border border-gray-200 dark:border-slate-700/50 hover:border-indigo-500/50 transition-all relative cursor-pointer hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10"
                  onClick={() => onSelect(item)}
                >
                  <div className="flex justify-between items-start mb-2">
                    {isEditingThis ? (
                      <div className="flex items-center gap-1 flex-1 mr-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitleValue}
                          onChange={(e) => setEditTitleValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(e as any, itemId);
                            if (e.key === 'Escape') cancelRename(e as any);
                          }}
                          autoFocus
                          className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-indigo-500 rounded text-slate-900 dark:text-white outline-none font-medium"
                        />
                        <button
                          onClick={(e) => saveRename(e, itemId)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded"
                          title="Guardar nombre"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={cancelRename}
                          className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate text-sm" title={item.title || item.value}>
                          {item.title || "Código QR"}
                        </h3>
                        <button
                          onClick={(e) => startEditing(e, item)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-indigo-600 transition-opacity"
                          title="Cambiar nombre del QR"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {item.isDynamic ? (
                      <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 shrink-0">
                          <Cloud className="w-2.5 h-2.5" /> SMART
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium shrink-0">
                        {item.contentType}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[10px] text-slate-500 truncate mb-3 font-mono">{item.value}</p>
                  
                  <div className="flex items-center justify-between mt-2 border-t border-gray-200 dark:border-slate-700 pt-2">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      {/* Analytics Button (Only Dynamic) */}
                      {item.isDynamic && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onAnalytics(item); }}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-md transition-colors"
                            title="Ver Estadísticas"
                          >
                            <BarChart3 className="w-3.5 h-3.5" />
                          </button>
                      )}

                      <button 
                          onClick={(e) => { e.stopPropagation(); onSelect(item); }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                          title="Cargar en editor"
                      >
                          <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(itemId); }}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                          title="Eliminar"
                      >
                          <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

