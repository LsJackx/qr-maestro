import React, { useState } from 'react';
import { X, Mail, Lock, ArrowRight, User as UserIcon, Save, Copy, Check, ExternalLink, ShieldAlert } from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerWithEmail, getAuthErrorMessage } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [copiedDomain, setCopiedDomain] = useState(false);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseSettingsUrl = 'https://console.firebase.google.com/project/marketa-pjbwh/authentication/settings';

  const handleCopyDomain = () => {
    if (currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrorCode('');

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
      }
      // Auth state changes are handled in App.tsx via listener
      onClose();
    } catch (err: any) {
      setErrorCode(err?.code || '');
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setErrorCode('');
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setErrorCode(err?.code || '');
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const isUnauthorizedDomain = errorCode === 'auth/unauthorized-domain' || error.includes('Dominio no autorizado');
  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white dark:bg-slate-900 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 relative animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 pb-0 flex justify-between items-center">
          <div>
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {mode === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
                {mode === 'login' ? 'Accede a tus QRs guardados' : 'Regístrate para guardar tu historial'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Feature Highlight */}
        <div className="mx-6 mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center gap-3 border border-indigo-100 dark:border-indigo-800/50">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg text-indigo-600 dark:text-indigo-300">
                <Save className="w-5 h-5" />
            </div>
            <div className="text-sm">
                <p className="font-bold text-indigo-900 dark:text-indigo-200">¿Por qué registrarse?</p>
                <p className="text-indigo-700 dark:text-indigo-400 text-xs">Tus códigos QR se guardarán en la nube para que no los pierdas nunca.</p>
            </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Social Login */}
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 px-4 rounded-xl font-medium transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>

          <div className="relative flex items-center gap-4">
            <div className="h-px bg-gray-200 dark:bg-slate-800 flex-1"></div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">O con Email</span>
            <div className="h-px bg-gray-200 dark:bg-slate-800 flex-1"></div>
          </div>

          {error && (
            isUnauthorizedDomain ? (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs space-y-3 text-left">
                <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300 text-sm">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <span>Dominio no autorizado en Firebase</span>
                </div>
                <p className="text-amber-700 dark:text-amber-300/90 leading-relaxed">
                  Por seguridad, Firebase requiere que autorices el dominio actual para permitir inicios de sesión con Google.
                </p>

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800/40 flex items-center justify-between gap-2">
                  <code className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono break-all font-semibold">
                    {currentHostname || 'Dominio actual'}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyDomain}
                    className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-200 py-1.5 px-2.5 rounded-lg transition-colors"
                  >
                    {copiedDomain ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-700 dark:text-emerald-300">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-1.5 pt-1 text-amber-800 dark:text-amber-300/80">
                  <p className="font-semibold text-amber-900 dark:text-amber-200">Revisa estos puntos clave:</p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] leading-tight">
                    <li><strong>Tiempo de propagación:</strong> Google OAuth puede tardar entre <strong>2 y 5 minutos</strong> en aplicar los cambios tras guardarlos en Firebase.</li>
                    <li><strong>Formato exacto:</strong> Pega únicamente el nombre de host (sin <code>https://</code> ni barra final <code>/</code>).</li>
                    <li><strong>Agrega ambos dominios:</strong> Tanto el de desarrollo (<code>ais-dev-...</code>) como el compartido (<code>ais-pre-...</code>).</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    href={firebaseSettingsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-xs transition-colors text-center"
                  >
                    <span>Abrir en Firebase</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  {isIframe && (
                    <button
                      type="button"
                      onClick={handleOpenInNewTab}
                      className="inline-flex items-center justify-center gap-1.5 flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-semibold text-xs transition-colors"
                    >
                      <span>Abrir en nueva pestaña</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-amber-700/80 dark:text-amber-300/60 text-center italic">
                  💡 Tip: Puedes registrarte o ingresar inmediatamente con Email y Contraseña aquí abajo.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm text-center font-medium">
                {error}
              </div>
            )
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500 transition-colors"
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500 transition-colors"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm">
            <span className="text-slate-500">
              {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            </span>
            <button 
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
                setErrorCode('');
              }}
              className="ml-2 font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              {mode === 'login' ? 'Regístrate gratis' : 'Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};