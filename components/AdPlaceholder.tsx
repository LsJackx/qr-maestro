import React from 'react';

interface AdPlaceholderProps {
  className?: string;
  format?: 'horizontal' | 'vertical' | 'box';
  label?: string;
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ 
  className = '', 
  format = 'box',
  label = 'Anuncio Patrocinado'
}) => {
  return (
    <div className={`relative overflow-hidden bg-gray-200 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 rounded-lg flex items-center justify-center group ${className}`}>
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_3s_infinite]"></div>
      
      <div className="text-center p-4 z-10 opacity-40 group-hover:opacity-60 transition-opacity">
        <span className="text-xs font-mono uppercase tracking-widest border border-current px-2 py-1 rounded mb-2 block w-fit mx-auto">Ad</span>
        <span className="text-xs font-medium">{label}</span>
        <div className="mt-2 text-[10px] hidden group-hover:block">Google Ads Space</div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5" 
           style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
      </div>
    </div>
  );
};