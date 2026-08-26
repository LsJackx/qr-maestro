
import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, Lock, Wifi, Globe, MapPin, Video, CreditCard, CheckCircle2, ExternalLink } from 'lucide-react';
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
              wifiPass: parsed.sp
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
    // Priority: targetContent -> value (if url-like)
    let url = parsedConfig.targetContent;
    
    if (!url && parsedConfig.value) {
        // Prevent infinite loop if value is the dynamic link itself
        if (!parsedConfig.value.includes('?id=')) {
           url = parsedConfig.value;
        }
    }

    if (!url) {
        alert("Lo sentimos, este código QR no tiene un destino configurado.");
        console.error("[Action] Missing targetContent and valid value.");
        return;
    }

    // 3. Normalize URL
    if (!url.startsWith('http') && !url.startsWith('geo:') && !url.startsWith('tel:') && !url.startsWith('mailto:') && !url.startsWith('sms:')) {
      url = `https://${url}`;
    }

    console.log("[Action] Opening URL:", url);
    
    // 4. Redirect securely
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (!newWindow) {
       // Pop-up blocker or fallback
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

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Brand Bar */}
      <div className="w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

      <main className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* Hero Header */}
        <div className="bg-slate-900 text-white pt-12 pb-16 px-8 rounded-b-[3rem] shadow-lg relative z-10">
          <div className="flex justify-center mb-6">
             <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/20">
                {parsedConfig.contentType === 'WIFI' && <Wifi className="w-8 h-8" />}
                {parsedConfig.contentType === 'LOCATION' && <MapPin className="w-8 h-8" />}
                {parsedConfig.contentType === 'VIDEO' && <Video className="w-8 h-8" />}
                {parsedConfig.contentType === 'VCARD' && <CreditCard className="w-8 h-8" />}
                {(!parsedConfig.contentType || parsedConfig.contentType === 'URL') && <Globe className="w-8 h-8" />}
             </div>
          </div>
          <h1 className="text-2xl font-bold text-center leading-tight mb-2">{parsedConfig.dynamicTitle || 'Bienvenido'}</h1>
          <p className="text-slate-300 text-center text-sm leading-relaxed opacity-90">{parsedConfig.dynamicDescription || 'Haz clic abajo para continuar.'}</p>
        </div>

        {/* Content Card */}
        <div className="flex-1 px-6 -mt-8 relative z-20 pb-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col items-center">
            
            <div className="w-full py-6 flex flex-col gap-4">
                {/* If WiFi, show details */}
                {parsedConfig.contentType === 'WIFI' && (
                  <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">Red WiFi</p>
                    <p className="text-lg font-mono font-bold text-indigo-900 break-all">{parsedConfig.wifiSsid}</p>
                  </div>
                )}

                {/* If URL/Generic */}
                {(parsedConfig.contentType === 'URL' || !parsedConfig.contentType) && parsedConfig.targetContent && (
                   <div className="bg-gray-50 rounded-lg p-2 px-3 text-center border border-gray-100 mb-2">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Destino</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px] mx-auto">{parsedConfig.targetContent}</p>
                   </div>
                )}

                <button 
                  onClick={handleAction}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group"
                >
                  <span>{parsedConfig.dynamicButtonText || 'Continuar'}</span>
                  {parsedConfig.contentType === 'WIFI' ? (
                      <Wifi className="w-5 h-5" />
                  ) : (
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
                
                <div className="text-center mt-2">
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    Enlace verificado y seguro
                  </div>
                </div>
            </div>

          </div>
          
          {/* Footer Brand */}
          <div className="mt-12 text-center opacity-50 hover:opacity-100 transition-opacity">
             <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Creado con NeoQR Studio
             </p>
          </div>
        </div>
      </main>
    </div>
  );
};
