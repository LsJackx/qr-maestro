
import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, Lock, Wifi, Globe, MapPin, Video, CreditCard, CheckCircle2, ExternalLink, MessageCircle, Instagram, Phone, Share2 } from 'lucide-react';
import { QRCodeConfig } from '../types';
import { recordScan } from '../services/firebase';

interface LandingViewerProps {
  // Can be a base64 string (legacy) or a full QRCodeConfig object (firebase)
  data: string | QRCodeConfig; 
}

export const LandingViewer: React.FC<LandingViewerProps> = ({ data }) => {
  const [parsedConfig, setParsedConfig] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const scanRecorded = useRef(false);

  useEffect(() => {
    const processData = async () => {
      try {
        let configToUse: any = null;

        if (typeof data === 'string') {
          // Legacy Base64 handling
          try {
            const json = atob(data);
            const parsed = JSON.parse(json);
            configToUse = {
              dynamicTitle: parsed.t,
              dynamicDescription: parsed.d,
              dynamicButtonText: parsed.b,
              targetContent: parsed.u,
              contentType: parsed.ct || 'URL',
              wifiSsid: parsed.ss,
              wifiPass: parsed.sp,
              landingThemeColor: parsed.tc,
              landingExtraNotes: parsed.en
            };
          } catch (e) {
            console.error("Error parsing legacy data:", e);
          }
        } else {
          // It's a full Firestore Config Object
          configToUse = data;
        }

        if (configToUse) {
          setParsedConfig(configToUse);
          
          // FORCE RECORD SCAN if we have an ID
          if (configToUse.shortId && !scanRecorded.current) {
             scanRecorded.current = true;
             console.log("[Analytics] Recording scan for:", configToUse.shortId);
             
             recordScan(configToUse.shortId)
                .then(() => console.log("[Analytics] Scan recorded successfully"))
                .catch(err => console.error("[Analytics] Scan error:", err));
          } else {
             if (!configToUse.shortId) console.warn("[Analytics] No ID found, skipping record.");
          }
        } else {
          setError('No se pudieron cargar los datos del QR.');
        }
        
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError('El código QR parece estar dañado o es inválido.');
        setLoading(false);
      }
    };
    
    processData();
  }, [data]);

  const handleAction = () => {
    if (!parsedConfig) return;
    
    console.log("[Action] Button clicked. Config:", parsedConfig);

    // 1. Handle WiFi Special Case
    if (parsedConfig.contentType === 'WIFI') {
       const pass = parsedConfig.wifiPass || '';
       if (pass) {
         navigator.clipboard.writeText(pass);
         alert(`Contraseña "${pass}" copiada al portapapeles. Conéctate manualmente en tu configuración.`);
       } else {
         alert("Esta red WiFi no tiene contraseña o no está configurada.");
       }
       return;
    }

    // 2. Determine URL Destination
    let url = parsedConfig.targetContent;
    
    if (!url && parsedConfig.value) {
        if (!parsedConfig.value.includes('?id=')) {
           url = parsedConfig.value;
        }
    }

    if (!url) {
        alert("Este código QR no tiene un destino configurado actualmente.");
        return;
    }

    // 3. Normalize URL
    if (!url.startsWith('http') && !url.startsWith('geo:') && !url.startsWith('tel:') && !url.startsWith('mailto:') && !url.startsWith('sms:')) {
      url = `https://${url}`;
    }

    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (!newWindow) {
       window.location.href = url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !parsedConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
          <div className="text-red-500 mb-4 flex justify-center">
            <Lock className="w-12 h-12" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Error de Lectura</h1>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  const themeColor = parsedConfig.landingThemeColor || '#4f46e5';
  const pageBg = parsedConfig.landingBgColor || '#f8fafc';
  const logoImage = parsedConfig.landingLogoUrl || parsedConfig.dynamicImageUrl || parsedConfig.logoUrl;

  return (
    <div 
      className="min-h-screen font-sans selection:text-white"
      style={{ backgroundColor: pageBg }}
    >
      {/* Top Brand Bar */}
      <div className="w-full h-2.5" style={{ backgroundColor: themeColor }}></div>

      <main className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* Hero Header */}
        <div 
          className="text-white pt-10 pb-16 px-8 rounded-b-[2.5rem] shadow-lg relative z-10 transition-colors"
          style={{ 
            background: `linear-gradient(135deg, ${themeColor} 0%, #1e1b4b 100%)` 
          }}
        >
          <div className="flex justify-center mb-5">
             <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border-2 border-white/40 shadow-md overflow-hidden p-1.5">
                {logoImage ? (
                  <img src={logoImage} alt="Logo" className="w-full h-full object-contain rounded-xl" />
                ) : (
                  <div className="text-indigo-600 flex items-center justify-center w-full h-full">
                    {parsedConfig.contentType === 'WIFI' && <Wifi className="w-8 h-8 text-indigo-600" />}
                    {parsedConfig.contentType === 'LOCATION' && <MapPin className="w-8 h-8 text-indigo-600" />}
                    {parsedConfig.contentType === 'VIDEO' && <Video className="w-8 h-8 text-indigo-600" />}
                    {parsedConfig.contentType === 'VCARD' && <CreditCard className="w-8 h-8 text-indigo-600" />}
                    {(!parsedConfig.contentType || parsedConfig.contentType === 'URL') && <Globe className="w-8 h-8 text-indigo-600" />}
                  </div>
                )}
             </div>
          </div>
          
          <h1 className="text-2xl font-black text-center leading-tight mb-2 text-white drop-shadow-sm">
            {parsedConfig.dynamicTitle || 'Bienvenido'}
          </h1>
          <p className="text-white/85 text-center text-sm leading-relaxed max-w-xs mx-auto">
            {parsedConfig.dynamicDescription || 'Haz clic en el botón para continuar al contenido principal.'}
          </p>
        </div>

        {/* Content Card */}
        <div className="flex-1 px-6 -mt-8 relative z-20 pb-10">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col items-center">
            
            <div className="w-full py-4 flex flex-col gap-4">
                {/* If WiFi, show details */}
                {parsedConfig.contentType === 'WIFI' && (
                  <div className="bg-indigo-50/80 rounded-xl p-4 text-center border border-indigo-100">
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">Red WiFi</p>
                    <p className="text-lg font-mono font-bold text-indigo-900 break-all">{parsedConfig.wifiSsid}</p>
                    {parsedConfig.wifiPass && (
                      <p className="text-xs text-slate-500 mt-1 font-mono">Clave: ••••••••</p>
                    )}
                  </div>
                )}

                {/* If URL/Generic destination info */}
                {(parsedConfig.contentType === 'URL' || !parsedConfig.contentType) && parsedConfig.targetContent && (
                   <div className="bg-slate-50 rounded-xl p-2.5 px-3.5 text-center border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Destino Verificado</p>
                      <p className="text-xs text-slate-600 font-medium truncate max-w-[240px] mx-auto mt-0.5">{parsedConfig.targetContent}</p>
                   </div>
                )}

                {/* Primary Action Button */}
                <button 
                  onClick={handleAction}
                  style={{ backgroundColor: themeColor }}
                  className="w-full text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3 group"
                >
                  <span className="text-base font-extrabold">{parsedConfig.dynamicButtonText || 'Continuar al Enlace'}</span>
                  {parsedConfig.contentType === 'WIFI' ? (
                      <Wifi className="w-5 h-5" />
                  ) : (
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Enlace seguro y verificado
                  </div>
                </div>

                {/* Optional Additional Custom Text Zone (Notes / Schedules / Promo) */}
                {parsedConfig.landingExtraNotes && (
                  <div className="mt-2 pt-4 border-t border-gray-100">
                    <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 text-slate-700 text-xs leading-relaxed whitespace-pre-line">
                      {parsedConfig.landingExtraNotes}
                    </div>
                  </div>
                )}

                {/* Optional Quick Contact & Social Links */}
                {(parsedConfig.landingWhatsapp || parsedConfig.landingInstagram || parsedConfig.landingPhone || parsedConfig.landingWebsite) && (
                  <div className="mt-2 pt-4 border-t border-gray-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">Contacto Directo</p>
                    <div className="grid grid-cols-2 gap-2">
                      {parsedConfig.landingWhatsapp && (
                        <a
                          href={`https://wa.me/${parsedConfig.landingWhatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      {parsedConfig.landingInstagram && (
                        <a
                          href={parsedConfig.landingInstagram.startsWith('http') ? parsedConfig.landingInstagram : `https://instagram.com/${parsedConfig.landingInstagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-pink-50 text-pink-700 font-bold text-xs hover:bg-pink-100 transition-colors"
                        >
                          <Instagram className="w-4 h-4 text-pink-600" />
                          <span>Instagram</span>
                        </a>
                      )}
                      {parsedConfig.landingPhone && (
                        <a
                          href={`tel:${parsedConfig.landingPhone}`}
                          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors"
                        >
                          <Phone className="w-4 h-4 text-blue-600" />
                          <span>Llamar</span>
                        </a>
                      )}
                      {parsedConfig.landingWebsite && (
                        <a
                          href={parsedConfig.landingWebsite.startsWith('http') ? parsedConfig.landingWebsite : `https://${parsedConfig.landingWebsite}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
                        >
                          <Globe className="w-4 h-4 text-slate-600" />
                          <span>Sitio Web</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
            </div>

          </div>
          
          {/* Footer Brand */}
          <div className="mt-8 text-center opacity-60 hover:opacity-100 transition-opacity">
             <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Creado con QRMaestro
             </p>
          </div>
        </div>
      </main>
    </div>
  );
};
