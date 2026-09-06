import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Star, 
  Utensils, 
  Wifi, 
  Share2, 
  DollarSign, 
  Heart, 
  Tag, 
  Briefcase, 
  ExternalLink, 
  Check, 
  Info, 
  MapPin, 
  HelpCircle,
  ArrowRight,
  Flame,
  Coffee,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { QRTemplate, TemplateCategory, QRCodeConfig } from '../types';
import { PRESET_TEMPLATES, TEMPLATE_CATEGORIES } from './templatesData';

interface TemplatesGalleryProps {
  onSelectTemplate: (template: QRTemplate) => void;
  currentConfig: QRCodeConfig;
}

export const TemplatesGallery: React.FC<TemplatesGalleryProps> = ({
  onSelectTemplate,
  currentConfig
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>(currentConfig.templateId || null);
  
  // Google Maps Link Helper State
  const [googleHelperOpen, setGoogleHelperOpen] = useState(false);
  const [googleBusinessName, setGoogleBusinessName] = useState('');
  const [googlePlaceId, setGooglePlaceId] = useState('');
  const [googleCustomLink, setGoogleCustomLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter templates
  const filteredTemplates = PRESET_TEMPLATES.filter(tpl => {
    const matchesCategory = selectedCategory === 'all' || tpl.category === selectedCategory;
    const matchesSearch = 
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApply = (template: QRTemplate) => {
    onSelectTemplate(template);
    setAppliedTemplateId(template.id);
  };

  // Google Maps Helper Apply
  const handleApplyGoogleReviewLink = () => {
    let finalUrl = '';
    if (googleCustomLink.trim()) {
      finalUrl = googleCustomLink.trim();
    } else if (googlePlaceId.trim()) {
      finalUrl = `https://search.google.com/local/writereview?placeid=${googlePlaceId.trim()}`;
    } else if (googleBusinessName.trim()) {
      finalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleBusinessName.trim())}`;
    }

    if (!finalUrl) {
      alert('Por favor introduce el nombre de tu negocio, tu Place ID o el enlace directo de Google Reseñas.');
      return;
    }

    // Find the standard Google Review template and apply with the custom URL
    const baseTemplate = PRESET_TEMPLATES.find(t => t.id === 'google-review-stand') || PRESET_TEMPLATES[0];
    const modifiedTemplate: QRTemplate = {
      ...baseTemplate,
      config: {
        ...baseTemplate.config,
        targetContent: finalUrl,
        value: finalUrl,
        title: googleBusinessName ? `Google Reseñas - ${googleBusinessName}` : 'Google Reseñas Mostrador',
        cardSubtitle: googleBusinessName 
          ? `Valora tu experiencia en ${googleBusinessName} ⭐⭐⭐⭐⭐` 
          : 'Escanea y déjanos tus 5 estrellas en Google ⭐⭐⭐⭐⭐'
      }
    };

    onSelectTemplate(modifiedTemplate);
    setAppliedTemplateId(modifiedTemplate.id);
    alert('¡Plantilla de Google Reseñas aplicada con tu enlace configurado!');
  };

  const getCategoryIcon = (cat: TemplateCategory) => {
    switch (cat) {
      case 'reviews': return <Star className="w-3.5 h-3.5 text-amber-500" />;
      case 'hospitality': return <Utensils className="w-3.5 h-3.5 text-red-500" />;
      case 'wifi': return <Wifi className="w-3.5 h-3.5 text-indigo-500" />;
      case 'social': return <Share2 className="w-3.5 h-3.5 text-pink-500" />;
      case 'payments': return <DollarSign className="w-3.5 h-3.5 text-emerald-500" />;
      case 'events': return <Heart className="w-3.5 h-3.5 text-rose-500" />;
      case 'retail': return <Tag className="w-3.5 h-3.5 text-orange-500" />;
      case 'professional': return <Briefcase className="w-3.5 h-3.5 text-slate-500" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-indigo-700/50">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wide flex items-center gap-1 shadow-xs">
                <Star className="w-3 h-3 fill-slate-950" /> Novedad
              </span>
              <span className="text-xs font-semibold text-indigo-200">
                20 Plantillas Profesionales Listas
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Plantillas Listas para Usar
            </h2>
            <p className="text-xs md:text-sm text-indigo-200 mt-1 max-w-xl">
              Diseños probados para conseguir <strong>reseñas en Google Maps</strong>, cartas digitales, conexión Wi-Fi instantánea, redes sociales y propinas. Selecciona una y personalízala en un clic.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setGoogleHelperOpen(!googleHelperOpen)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-indigo-950 hover:bg-indigo-50 shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Asistente Google Reseñas</span>
            </button>
          </div>
        </div>
      </div>

      {/* SPECIAL ASSISTANT: GOOGLE MAPS REVIEW HELPER */}
      {googleHelperOpen && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800/80 shadow-sm space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                ⭐
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  Asistente para Enlace de Google Reseñas (Google Maps)
                  <span className="text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold">Oficial</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  ¿Cómo conseguir que tus clientes abran directamente la pantalla de 5 estrellas en su teléfono?
                </p>
              </div>
            </div>
            <button 
              onClick={() => setGoogleHelperOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold px-2 py-1"
            >
              Cerrar ✕
            </button>
          </div>

          {/* 3 Simple Steps Guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/80 dark:border-amber-900/40 text-xs">
              <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">Paso 1: Tu Ficha de Google</span>
              <p className="text-slate-600 dark:text-slate-400">
                Abre Google Maps en tu móvil o PC y busca el nombre exacto de tu negocio o restaurante.
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/80 dark:border-amber-900/40 text-xs">
              <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">Paso 2: Solicitar Opiniones</span>
              <p className="text-slate-600 dark:text-slate-400">
                Toca en <strong>"Pedir opiniones"</strong> o <strong>"Conseguir más reseñas"</strong> y copia el link corto oficial (ej: <code>g.page/r/.../review</code>).
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/80 dark:border-amber-900/40 text-xs">
              <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">Paso 3: Pegar y Aplicar</span>
              <p className="text-slate-600 dark:text-slate-400">
                Pega el enlace a continuación y generaremos un cartel acrílico con tus 5 estrellas listo para imprimir.
              </p>
            </div>
          </div>

          {/* Inputs Section */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Opción A: Pega tu enlace directo de Google Reseñas (Recomendado)
              </label>
              <div className="flex gap-2">
                <input 
                  type="url" 
                  value={googleCustomLink} 
                  onChange={(e) => setGoogleCustomLink(e.target.value)}
                  placeholder="https://g.page/r/tu-negocio/review o https://search.google.com/local/writereview?placeid=..."
                  className="flex-1 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold"
                />
                {googleCustomLink && (
                  <a 
                    href={googleCustomLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
                    title="Probar enlace en nueva pestaña"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Probar</span>
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
              <div className="h-px bg-gray-200 dark:bg-slate-800 flex-1" />
              <span>O si aún no tienes el enlace directo</span>
              <div className="h-px bg-gray-200 dark:bg-slate-800 flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">
                  Nombre de tu Negocio y Ciudad
                </label>
                <input 
                  type="text" 
                  value={googleBusinessName} 
                  onChange={(e) => setGoogleBusinessName(e.target.value)}
                  placeholder="Ej: Café París, Madrid o Pizzería Nápoles, Buenos Aires"
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">
                  Google Place ID (Opcional)
                </label>
                <input 
                  type="text" 
                  value={googlePlaceId} 
                  onChange={(e) => setGooglePlaceId(e.target.value)}
                  placeholder="Ej: ChIJN1t_tDeuEmsRUsoyG83frY4"
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleApplyGoogleReviewLink}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <Star className="w-4 h-4 fill-white" />
                <span>Generar Cartel de Google Reseñas con mis Datos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH AND CATEGORIES FILTER */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por tema: Google reseña, Wi-Fi, menú restaurante, Instagram, propina, boda..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 outline-none shadow-sm transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {TEMPLATE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = cat.id === 'all' 
              ? PRESET_TEMPLATES.length 
              : PRESET_TEMPLATES.filter(t => t.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TEMPLATES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const isApplied = appliedTemplateId === template.id;

          return (
            <div
              key={template.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden relative group bg-white dark:bg-slate-900 ${
                isApplied
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Card Header Strip */}
              <div 
                className="h-2 w-full" 
                style={{ backgroundColor: template.previewColor }} 
              />

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                      style={{ backgroundColor: template.previewColor }}
                    >
                      {template.badge}
                    </span>
                    {template.popular && (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/60">
                        <Flame className="w-3 h-3 fill-amber-500" /> Popular
                      </span>
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                    {template.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {template.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 line-clamp-2">
                    {template.description}
                  </p>
                </div>

                {/* Preconfigured Feature Specs */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800/80 space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Llamado marco:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200 px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 rounded">
                      {template.config.frameText || 'ESCANÉAME'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Formato visual:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {template.config.cardPosition === 'flyer' ? 'Cartel Completo (Atril)' : 'Tarjeta con instrucciones'}
                    </span>
                  </div>

                  {template.config.cardShowStars && (
                    <div className="flex items-center justify-between text-amber-500 font-bold">
                      <span>Valoración:</span>
                      <span>⭐⭐⭐⭐⭐ 5 Estrellas</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-2">
                  <button
                    onClick={() => handleApply(template)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isApplied
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/10 active:scale-98'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>¡Plantilla Activa!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Aplicar esta Plantilla</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
            🔍
          </div>
          <h4 className="font-bold text-slate-700 dark:text-slate-300">No se encontraron plantillas con ese término</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Prueba buscando con palabras como "Google", "Wi-Fi", "Menú", "Instagram", "Boda", "Propina" o "Descuento".
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:underline"
          >
            Ver todas las plantillas
          </button>
        </div>
      )}

      {/* SUGGESTIONS & FAQ: "¿Qué otras plantillas podemos hacer?" */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-900 dark:to-indigo-950/20 border border-gray-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            ¿Qué otras plantillas y usos podemos crear?
          </h3>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Los códigos QR con diseño profesional multiplican la tasa de escaneo en más de un <strong>300%</strong> en comparación con un QR común en blanco y negro. Aquí tienes ideas adicionales que puedes armar al instante en QRMaestro:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-gray-200/80 dark:border-slate-700 text-xs space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-100 block">🏨 Hoteles & Check-in</span>
            <p className="text-slate-500 dark:text-slate-400">Guías turísticas de la ciudad, horarios de desayuno, checkout rápido y normas del hotel.</p>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-gray-200/80 dark:border-slate-700 text-xs space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-100 block">📦 Packaging & Etiquetas</span>
            <p className="text-slate-500 dark:text-slate-400">Modo de uso del producto, recetas con el ingrediente, autenticidad y fecha de caducidad.</p>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-gray-200/80 dark:border-slate-700 text-xs space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-100 block">🏋️ Gimnasios & Clases</span>
            <p className="text-slate-500 dark:text-slate-400">Video tutorial de cómo usar cada máquina del gimnasio o reserva de clases grupales.</p>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-gray-200/80 dark:border-slate-700 text-xs space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-100 block">🏡 Inmobiliaria & Casas</span>
            <p className="text-slate-500 dark:text-slate-400">Cartel de "En Venta / En Alquiler" con tour virtual 360°, plano y precio de la propiedad.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
