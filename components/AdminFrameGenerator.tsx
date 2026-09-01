import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Save, 
  Layers, 
  Palette, 
  Sliders, 
  Eye, 
  LayoutGrid, 
  Smile, 
  Tag, 
  ShieldCheck, 
  HelpCircle,
  FolderPlus,
  RefreshCw
} from 'lucide-react';
import { QRFrame, FrameCategory, QRCodeConfig } from '../types';
import { FRAME_CATEGORIES, FRAMES } from './framesData';
import { QRRenderer } from './QRRenderer';
import { saveCustomFrameToFirebase, deleteCustomFrameFromFirebase } from '../services/firebase';

interface AdminFrameGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  customFrames?: QRFrame[];
  existingFrames?: QRFrame[];
  onFrameCreated?: (frame: QRFrame) => void;
  onFrameDeleted?: (frameId: string) => void;
  onSelectFrameForApp?: (frame: QRFrame) => void;
  onSaveFrame?: (frame: QRFrame) => Promise<void> | void;
  onDeleteFrame?: (frameId: string) => Promise<void> | void;
  currentUserEmail?: string;
}

const EMOJI_PRESETS = [
  '👷‍♂️', '🩺', '👨‍🍳', '⚖️', '🎨', '🎓', 
  '💖', '💍', '🏹', '💕', '🌹', '💌', 
  '🎂', '🎈', '🎭', '🎄', '🎁', '🏮', 
  '🛍️', '🏷️', '🎟️', '💳', '📦', '🛒', 
  '🍸', '☕', '🍽️', '🍔', '🍕', '🍻', 
  '🌸', '🍂', '🦋', '🌿', '🌻', '🍃', 
  '📜', '🕌', '🏵️', '👑', '🚀', '⭐', 
  '💻', '📸', '🎧', '⚽', '🚗', '✈️'
];

const COLOR_PRESETS = [
  '#000000', '#4f46e5', '#2563eb', '#0284c7', '#0d9488',
  '#16a34a', '#eab308', '#ea580c', '#dc2626', '#e11d48',
  '#db2777', '#9333ea', '#7c3aed', '#1e293b', '#78350f'
];

export const AdminFrameGenerator: React.FC<AdminFrameGeneratorProps> = ({
  isOpen,
  onClose,
  customFrames: customFramesProp,
  existingFrames,
  onFrameCreated,
  onFrameDeleted,
  onSelectFrameForApp,
  onSaveFrame,
  onDeleteFrame,
  currentUserEmail
}) => {
  const customFrames = customFramesProp || existingFrames || [];
  const [activeTab, setActiveTab] = useState<'CREATE' | 'MANAGE' | 'PRESETS'>('CREATE');
  const [name, setName] = useState('Nuevo Marco Personalizado');
  const [description, setDescription] = useState('Marco temático creado para los usuarios');
  const [category, setCategory] = useState<FrameCategory>('professions');
  
  // Frame Geometry & Silhouette
  const [silhouetteShape, setSilhouetteShape] = useState<QRFrame['silhouetteShape']>('rounded');
  const [borderRadius, setBorderRadius] = useState(12);
  
  // Icon / Emoji
  const [topIcon, setTopIcon] = useState('👷‍♂️');
  const [customEmojiInput, setCustomEmojiInput] = useState('');
  
  // Corner & Bottom Ornaments
  const [cornerStyle, setCornerStyle] = useState<QRFrame['cornerStyle']>('none');
  const [bottomStyle, setBottomStyle] = useState<QRFrame['bottomStyle']>('none');
  
  // Badge & Text
  const [hasText, setHasText] = useState(true);
  const [defaultText, setDefaultText] = useState('ESCANÉAME');
  const [badgeStyle, setBadgeStyle] = useState<QRFrame['badgeStyle']>('banner');
  
  // Colors
  const [frameColor, setFrameColor] = useState('#4f46e5');
  const [accentColor, setAccentColor] = useState('#ffffff');
  const [frameTextColor, setFrameTextColor] = useState('#ffffff');
  
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Build temporary current frame object for live preview
  const currentPreviewFrame: QRFrame = {
    id: 'preview-frame-temp',
    name: name.trim() || 'Vista Previa de Marco',
    description: description.trim(),
    category,
    viewBox: '0 0 100 134',
    qrSize: (silhouetteShape === 'heart' || silhouetteShape === 'rosette') ? 74 : (topIcon ? 76 : 80),
    qrX: (silhouetteShape === 'heart' || silhouetteShape === 'rosette') ? 13 : (topIcon ? 12 : 10),
    qrY: topIcon ? 24 : (hasText ? 10 : 8),
    hasText,
    defaultText: defaultText.trim() || 'ESCANÉAME',
    textPosition: 'bottom',
    borderRadius,
    badgeStyle,
    silhouetteShape,
    topIcon: topIcon.trim() || undefined,
    cornerStyle,
    bottomStyle,
    themeColor: frameColor,
    accentColor: accentColor,
    isCustom: true,
    createdBy: currentUserEmail || 'admin'
  };

  const previewConfig: QRCodeConfig = {
    value: 'https://qrmaestro.app',
    targetContent: 'https://qrmaestro.app',
    contentType: 'URL',
    isDynamic: false,
    fgColor: '#1e293b',
    bgColor: '#ffffff',
    level: 'H',
    size: 512,
    includeMargin: false,
    frameId: 'preview-frame-temp',
    frameText: defaultText,
    frameTextColor,
    frameColor,
    frameFont: 'sans'
  };

  const handleSaveAndPublish = async () => {
    if (!name.trim()) {
      setErrorMessage('Por favor ingresa un nombre para el marco.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const frameId = `frame-${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)}`;

    const newFrame: QRFrame = {
      ...currentPreviewFrame,
      id: frameId,
      createdAt: Date.now()
    };

    try {
      if (onSaveFrame) {
        await onSaveFrame(newFrame);
      } else {
        await saveCustomFrameToFirebase(newFrame, currentUserEmail);
        if (onFrameCreated) onFrameCreated(newFrame);
      }
      setSuccessMessage(`¡Marco "${newFrame.name}" publicado exitosamente! Ya está disponible para todos los usuarios.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      if (onFrameCreated) onFrameCreated(newFrame);
      setSuccessMessage(`¡Marco guardado en tu sesión local!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadPreset = (f: QRFrame) => {
    setName(`${f.name} (Copia Admin)`);
    setDescription(f.description || '');
    setCategory(f.category || 'professions');
    setSilhouetteShape(f.silhouetteShape || 'rounded');
    setBorderRadius(f.borderRadius || 12);
    setTopIcon(f.topIcon || '');
    setCornerStyle(f.cornerStyle || 'none');
    setBottomStyle(f.bottomStyle || 'none');
    setHasText(f.hasText !== false);
    setDefaultText(f.defaultText || 'ESCANÉAME');
    setBadgeStyle(f.badgeStyle || 'banner');
    if (f.themeColor) setFrameColor(f.themeColor);
    if (f.accentColor) setAccentColor(f.accentColor);
    setActiveTab('CREATE');
  };

  const handleDeleteFrame = async (frameId: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este marco publicado?')) {
      if (onDeleteFrame) {
        await onDeleteFrame(frameId);
      } else {
        await deleteCustomFrameFromFirebase(frameId);
        if (onFrameDeleted) onFrameDeleted(frameId);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-pink-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Estudio Creador de Marcos y Siluetas
                </h2>
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded-full border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Solo Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Diseña marcos con siluetas, emoticones y objetos vistosos. Se publican automáticamente para todos los usuarios.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4">
          <button
            onClick={() => setActiveTab('CREATE')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'CREATE'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" /> Diseñar Nuevo Marco
          </button>
          <button
            onClick={() => setActiveTab('MANAGE')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'MANAGE'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderPlus className="w-4 h-4" /> Marcos Creados ({customFrames.length})
          </button>
          <button
            onClick={() => setActiveTab('PRESETS')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'PRESETS'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> Clonar Plantilla Base
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {successMessage && (
            <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-300 text-sm flex items-center gap-2">
              <X className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'CREATE' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Controls */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* 1. Basic Info */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> 1. Datos del Marco
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nombre del Marco *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Casco de Constructor"
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Categoría Temática
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as FrameCategory)}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        {FRAME_CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'custom').map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.icon} {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Descripción breve
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ej: Marco con casco amarillo para ingenieros, obras y construcción"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                {/* 2. Silhouette Shape */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" /> 2. Silueta Base y Estructura
                  </h3>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'rounded', label: 'Redondeado', icon: '▢' },
                      { id: 'square', label: 'Recto', icon: '◻' },
                      { id: 'heart', label: 'Corazón', icon: '💖' },
                      { id: 'envelope', label: 'Sobre Carta', icon: '✉️' },
                      { id: 'ticket', label: 'Ticket Entrada', icon: '🎟️' },
                      { id: 'shopping_bag', label: 'Bolsa Compras', icon: '🛍️' },
                      { id: 'parchment', label: 'Pergamino', icon: '📜' },
                      { id: 'oriental_arch', label: 'Cúpula / Arco', icon: '🕌' },
                      { id: 'rosette', label: 'Roseta Floral', icon: '🏵️' }
                    ].map((shape) => (
                      <button
                        key={shape.id}
                        type="button"
                        onClick={() => setSilhouetteShape(shape.id as any)}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          silhouetteShape === shape.id
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-base mb-0.5">{shape.icon}</div>
                        <div className="text-[11px] truncate">{shape.label}</div>
                      </button>
                    ))}
                  </div>

                  {silhouetteShape === 'rounded' && (
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                        <span>Curvatura de esquinas (Border Radius)</span>
                        <span className="font-bold">{borderRadius}px</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="28"
                        value={borderRadius}
                        onChange={(e) => setBorderRadius(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* 3. Top Icon / Emoji / Symbol */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Smile className="w-3.5 h-3.5" /> 3. Emoticono / Icono Superior
                    </h3>
                    {topIcon && (
                      <button
                        type="button"
                        onClick={() => setTopIcon('')}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Quitar icono
                      </button>
                    )}
                  </div>

                  {/* Preset Emojis */}
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    {EMOJI_PRESETS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setTopIcon(emoji)}
                        className={`w-8 h-8 rounded text-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-transform ${
                          topIcon === emoji ? 'bg-indigo-100 dark:bg-indigo-900/60 scale-110 shadow-sm' : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Custom emoji input */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={customEmojiInput}
                      onChange={(e) => setCustomEmojiInput(e.target.value)}
                      placeholder="O escribe cualquier emoticono/texto personalizado..."
                      className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customEmojiInput.trim()) {
                          setTopIcon(customEmojiInput.trim());
                          setCustomEmojiInput('');
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>

                {/* 4. Corners & Bottom Accessories */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> 4. Adornos en Esquinas e Inferiores
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Decoración de Esquinas
                      </label>
                      <select
                        value={cornerStyle}
                        onChange={(e) => setCornerStyle(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      >
                        <option value="none">Sin adorno de esquinas</option>
                        <option value="flowers">🌸 Flores y Hojas Pastel</option>
                        <option value="pine_holly">🎄 Ramas de Pino y Muérdago</option>
                        <option value="autumn_leaves">🍂 Hojas de Otoño y Bellotas</option>
                        <option value="confetti">🎉 Confeti y Notas de Fiesta</option>
                        <option value="arrows">🏹 Flechas de Cupido</option>
                        <option value="hearts">💖 Corazones y Destellos</option>
                        <option value="lanterns">🏮 Faroles Orientales Colgantes</option>
                        <option value="cocktail_lime">🍸 Rodaja de Lima / Limón</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Accesorio Inferior Colgante
                      </label>
                      <select
                        value={bottomStyle}
                        onChange={(e) => setBottomStyle(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      >
                        <option value="none">Sin accesorio inferior</option>
                        <option value="hanging_hearts">💕 Corazones Colgantes Móviles</option>
                        <option value="quill_ink">📜 Pluma de Escribir y Tintero</option>
                        <option value="gift_ribbon">🎁 Lazo Satinado de Regalo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 5. Text Badge & Banner */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> 5. Placa de Texto / Call-To-Action
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasText}
                        onChange={(e) => setHasText(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {hasText && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Texto Predeterminado
                        </label>
                        <input
                          type="text"
                          value={defaultText}
                          onChange={(e) => setDefaultText(e.target.value)}
                          placeholder="Ej: ESCANÉAME, VER MENÚ, OFERTA"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white uppercase font-bold tracking-wider"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Estilo de Placa
                        </label>
                        <select
                          value={badgeStyle}
                          onChange={(e) => setBadgeStyle(e.target.value as any)}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        >
                          <option value="banner">Banner con Flecha Indicadora</option>
                          <option value="pill">Cápsula Redondeada Flotante</option>
                          <option value="ticket">Placa Estilo Boleto / Ticket</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. Colors */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" /> 6. Paleta de Colores
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Color Principal del Marco
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={frameColor}
                          onChange={(e) => setFrameColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700"
                        />
                        <input
                          type="text"
                          value={frameColor}
                          onChange={(e) => setFrameColor(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs font-mono uppercase bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Color del Texto del Badge
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={frameTextColor}
                          onChange={(e) => setFrameTextColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700"
                        />
                        <input
                          type="text"
                          value={frameTextColor}
                          onChange={(e) => setFrameTextColor(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs font-mono uppercase bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preset Color Swatches */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFrameColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          frameColor === c ? 'border-white scale-125 shadow-md' : 'border-transparent hover:scale-110'
                        }`}
                      />
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Live Interactive Preview */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="sticky top-0 w-full bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center">
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Previsualización en Vivo
                    </span>
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {name || 'Sin título'}
                    </span>
                  </div>

                  {/* Real-time SVG Stage */}
                  <div className="w-64 h-72 flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl p-4 shadow-inner border border-slate-200 dark:border-slate-800">
                    <QRRenderer
                      config={previewConfig}
                      customFrames={[currentPreviewFrame]}
                      className="max-w-full max-h-full drop-shadow-md"
                    />
                  </div>

                  {/* Publish Actions */}
                  <div className="w-full mt-5 space-y-2">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSaveAndPublish}
                      className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSaving ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      Guardar y Publicar para Todos
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectFrameForApp) onSelectFrameForApp(currentPreviewFrame);
                        onClose();
                      }}
                      className="w-full py-2 px-3 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-200/60 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-center"
                    >
                      Probar en el Generador sin guardar
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'MANAGE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Biblioteca de Marcos Creados por Admin
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Estos marcos están sincronizados en Firestore y disponibles para todos los usuarios.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('CREATE')}
                  className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Crear Otro
                </button>
              </div>

              {customFrames.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No has creado ningún marco personalizado todavía.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Crea tu primer marco usando la pestaña "Diseñar Nuevo Marco" o clonando una plantilla base.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {customFrames.map((f) => (
                    <div
                      key={f.id}
                      className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-lg p-1.5 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800">
                          <QRRenderer
                            config={{
                              value: 'https://google.com',
                              targetContent: 'https://google.com',
                              contentType: 'URL',
                              isDynamic: false,
                              fgColor: '#0f172a',
                              bgColor: '#ffffff',
                              level: 'H',
                              size: 256,
                              includeMargin: false,
                              frameId: f.id,
                              frameText: f.defaultText || 'QR',
                              frameColor: f.themeColor || '#4f46e5',
                              frameTextColor: '#ffffff',
                              frameFont: 'sans'
                            }}
                            customFrames={[f]}
                            className="max-w-full max-h-full"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {f.name}
                            </h4>
                          </div>
                          <span className="inline-block mt-0.5 text-[10px] font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                            {FRAME_CATEGORIES.find(c => c.id === f.category)?.label || 'General'}
                          </span>
                          {f.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                              {f.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectFrameForApp) onSelectFrameForApp(f);
                            onClose();
                          }}
                          className="flex-1 py-1.5 px-2 bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Usar en QR
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLoadPreset(f)}
                          className="py-1.5 px-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFrame(f.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                          title="Eliminar marco"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'PRESETS' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Clonar Plantilla Base del Catálogo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Selecciona cualquiera de las plantillas temáticas predefinidas para cargar sus parámetros en el editor y crear una nueva variante.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {FRAMES.filter(f => f.id !== 'none').map((f) => (
                  <div
                    key={f.id}
                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center hover:border-indigo-500 transition-all cursor-pointer group"
                    onClick={() => handleLoadPreset(f)}
                  >
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-lg p-1 flex items-center justify-center mb-2">
                      <QRRenderer
                        config={{
                          value: 'https://google.com',
                          targetContent: 'https://google.com',
                          contentType: 'URL',
                          isDynamic: false,
                          fgColor: '#0f172a',
                          bgColor: '#ffffff',
                          level: 'H',
                          size: 256,
                          includeMargin: false,
                          frameId: f.id,
                          frameText: f.defaultText || 'QR',
                          frameColor: f.themeColor || '#4f46e5',
                          frameTextColor: '#ffffff',
                          frameFont: 'sans'
                        }}
                        className="max-w-full max-h-full"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 truncate w-full">
                      {f.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full">
                      {FRAME_CATEGORIES.find(c => c.id === f.category)?.label || 'Estándar'}
                    </span>
                    <button
                      type="button"
                      className="mt-2 w-full py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 group-hover:bg-indigo-600 group-hover:text-white rounded transition-colors"
                    >
                      Cargar en Editor
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Los cambios guardados se reflejan inmediatamente en la pestaña <strong>Estilo y Marcos</strong>.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
