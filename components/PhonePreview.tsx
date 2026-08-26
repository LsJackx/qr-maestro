import React from 'react';
import { QRCodeConfig } from '../types';
import { Wifi, Globe, MapPin, Video, CreditCard, Lock, Clock, ArrowRight, MessageCircle, Instagram, Phone } from 'lucide-react';

interface PhonePreviewProps {
  config: QRCodeConfig;
}

export const PhonePreview: React.FC<PhonePreviewProps> = ({ config }) => {
  const themeColor = config.landingThemeColor || '#4f46e5';
  const logoImage = config.landingLogoUrl || config.dynamicImageUrl || config.logoUrl;
  
  const getIcon = () => {
    switch (config.contentType) {
      case 'WIFI': return <Wifi className="w-8 h-8 text-indigo-500" />;
      case 'LOCATION': return <MapPin className="w-8 h-8 text-red-500" />;
      case 'VIDEO': return <Video className="w-8 h-8 text-pink-500" />;
      case 'VCARD': return <CreditCard className="w-8 h-8 text-blue-500" />;
      default: return <Globe className="w-8 h-8 text-emerald-500" />;
    }
  };

  const getTitle = () => config.dynamicTitle || (config.contentType === 'URL' ? 'Visitar Sitio Web' : config.contentType);
  const getDescription = () => config.dynamicDescription || 'Haz clic abajo para acceder al contenido.';
  const getButtonText = () => config.dynamicButtonText || 'Continuar';

  return (
    <div className="relative w-[290px] h-[580px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden mx-auto select-none ring-1 ring-white/20">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-28 bg-slate-800 rounded-b-2xl z-20"></div>
      
      {/* Status Bar */}
      <div className="absolute top-2 left-6 right-6 flex justify-between text-[10px] text-white font-medium z-10">
        <span>9:41</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-white/30"></div>
          <div className="w-3 h-3 rounded-full bg-white/30"></div>
        </div>
      </div>

      {/* Screen Content */}
      <div 
        className="w-full h-full flex flex-col relative overflow-y-auto"
        style={{ backgroundColor: config.landingBgColor || '#f8fafc' }}
      >
        {/* Top Header Color */}
        <div 
          className="h-28 w-full rounded-b-[2rem] shadow-md absolute top-0 left-0 transition-colors"
          style={{ background: `linear-gradient(135deg, ${themeColor} 0%, #1e1b4b 100%)` }}
        ></div>

        <div className="flex-1 flex flex-col items-center justify-start p-4 pt-14 z-10">
          
          {/* Card Container */}
          <div className="w-full bg-white rounded-2xl shadow-xl p-4 flex flex-col items-center text-center border border-gray-100 mt-2">
            
            {/* Icon or Image */}
            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-white/80 shadow-md -mt-10 mb-3 flex items-center justify-center overflow-hidden p-1">
               {logoImage ? (
                 <img src={logoImage} alt="Logo" className="w-full h-full object-contain rounded-xl" />
               ) : (
                 getIcon()
               )}
            </div>

            <h2 className="text-base font-extrabold text-slate-800 mb-1 leading-tight">
              {getTitle()}
            </h2>
            
            <p className="text-xs text-slate-500 mb-4 leading-relaxed line-clamp-2">
              {getDescription()}
            </p>

            {/* Specific Data Preview */}
            {config.contentType === 'WIFI' && config.wifiSsid && (
               <div className="mb-3 w-full bg-indigo-50 rounded-lg p-2.5 text-xs text-indigo-800 font-mono">
                  SSID: {config.wifiSsid}
               </div>
            )}

            <button 
              style={{ backgroundColor: themeColor }}
              className="w-full text-white font-bold py-2.5 px-4 rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition-all"
            >
              <span>{getButtonText()}</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Extra Notes Zone preview */}
            {config.landingExtraNotes && (
              <div className="mt-3 pt-2.5 border-t border-gray-100 w-full text-left">
                <p className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg leading-relaxed line-clamp-3">
                  {config.landingExtraNotes}
                </p>
              </div>
            )}

            {/* Contact buttons preview */}
            {(config.landingWhatsapp || config.landingInstagram || config.landingPhone) && (
              <div className="mt-3 pt-2 border-t border-gray-100 w-full flex justify-center gap-2">
                {config.landingWhatsapp && (
                  <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold flex items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-emerald-600" /> WhatsApp
                  </span>
                )}
                {config.landingInstagram && (
                  <span className="p-1.5 bg-pink-50 text-pink-700 rounded-lg text-[10px] font-bold flex items-center gap-1">
                    <Instagram className="w-3 h-3 text-pink-600" /> Instagram
                  </span>
                )}
                {config.landingPhone && (
                  <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold flex items-center gap-1">
                    <Phone className="w-3 h-3 text-blue-600" /> Llamar
                  </span>
                )}
              </div>
            )}

            {/* Debug / Redirect Info */}
            <div className="mt-2.5 w-full overflow-hidden">
               <p className="text-[8px] text-slate-400 uppercase tracking-wide font-bold">Destino:</p>
               <p className="text-[9px] text-slate-500 truncate font-mono bg-gray-100 rounded px-2 py-0.5 mt-0.5">
                 {config.targetContent || config.value || '...'}
               </p>
            </div>
          </div>

          {/* Restrictions Badges */}
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
             {config.expiryDate && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md text-[9px] font-bold">
                   <Clock className="w-3 h-3" /> Expira: {new Date(config.expiryDate).toLocaleDateString()}
                </div>
             )}
             {config.passwordProtected && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-[9px] font-bold">
                   <Lock className="w-3 h-3" /> Protegido
                </div>
             )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 text-center">
           <p className="text-[9px] text-slate-400 font-medium">Creado con QRMaestro</p>
        </div>
      </div>
    </div>
  );
};