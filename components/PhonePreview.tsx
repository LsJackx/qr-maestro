import React from 'react';
import { QRCodeConfig } from '../types';
import { Wifi, Globe, MapPin, Video, CreditCard, Lock, Clock, User, ArrowRight } from 'lucide-react';

interface PhonePreviewProps {
  config: QRCodeConfig;
}

export const PhonePreview: React.FC<PhonePreviewProps> = ({ config }) => {
  
  const getIcon = () => {
    switch (config.contentType) {
      case 'WIFI': return <Wifi className="w-12 h-12 text-indigo-500 mb-4" />;
      case 'LOCATION': return <MapPin className="w-12 h-12 text-red-500 mb-4" />;
      case 'VIDEO': return <Video className="w-12 h-12 text-pink-500 mb-4" />;
      case 'VCARD': return <CreditCard className="w-12 h-12 text-blue-500 mb-4" />;
      default: return <Globe className="w-12 h-12 text-emerald-500 mb-4" />;
    }
  };

  const getTitle = () => config.dynamicTitle || config.contentType;
  const getDescription = () => config.dynamicDescription || 'Escanea para acceder al contenido.';
  const getButtonText = () => config.dynamicButtonText || 'Acceder';

  return (
    <div className="relative w-[280px] h-[560px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden mx-auto select-none ring-1 ring-white/20">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-slate-800 rounded-b-2xl z-20"></div>
      
      {/* Status Bar */}
      <div className="absolute top-2 left-6 right-6 flex justify-between text-[10px] text-white font-medium z-10">
        <span>9:41</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-white/20"></div>
          <div className="w-3 h-3 rounded-full bg-white/20"></div>
        </div>
      </div>

      {/* Screen Content */}
      <div className="w-full h-full bg-gray-50 flex flex-col relative">
        
        {/* Top Header Color */}
        <div className="h-32 w-full bg-indigo-600 rounded-b-[2rem] shadow-lg absolute top-0 left-0"></div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 pt-20 z-10">
          
          {/* Card Container */}
          <div className="w-full bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center text-center border border-gray-100">
            
            {/* Icon or Image */}
            <div className="w-20 h-20 rounded-full bg-gray-50 border-4 border-white shadow-lg -mt-16 mb-4 flex items-center justify-center overflow-hidden">
               {config.dynamicImageUrl ? (
                 <img src={config.dynamicImageUrl} alt="Logo" className="w-full h-full object-cover" />
               ) : (
                 getIcon()
               )}
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-2 leading-tight">
              {getTitle()}
            </h2>
            
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {getDescription()}
            </p>

            {/* Specific Data Preview */}
            {config.contentType === 'WIFI' && config.wifiSsid && (
               <div className="mb-6 w-full bg-indigo-50 rounded-lg p-3 text-xs text-indigo-800 font-mono">
                  SSID: {config.wifiSsid}
               </div>
            )}

            <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              {getButtonText()} <ArrowRight className="w-4 h-4" />
            </button>

            {/* Debug / Redirect Info */}
            <div className="mt-3 w-full overflow-hidden">
               <p className="text-[9px] text-slate-400 uppercase tracking-wide font-bold">Redirige a:</p>
               <p className="text-[10px] text-slate-500 truncate font-mono bg-gray-100 rounded px-2 py-1 mt-1">
                 {config.targetContent || '...'}
               </p>
            </div>
          </div>

          {/* Restrictions Badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
             {config.expiryDate && (
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold">
                   <Clock className="w-3 h-3" /> Expira: {new Date(config.expiryDate).toLocaleDateString()}
                </div>
             )}
             {config.passwordProtected && (
                <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold">
                   <Lock className="w-3 h-3" /> Protegido
                </div>
             )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 text-center">
           <p className="text-[10px] text-slate-400">Powered by NeoQR</p>
        </div>
      </div>
    </div>
  );
};