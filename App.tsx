
import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Save, 
  Menu, 
  Globe, 
  Wifi, 
  Video, 
  MapPin, 
  PlusCircle,
  CreditCard,
  Image as ImageIcon,
  Layers,
  QrCode,
  RotateCcw,
  Mail,
  Phone,
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
  Zap,
  ChevronLeft,
  Smartphone,
  Calendar,
  Lock,
  BarChart3,
  Eye,
  ArrowRight,
  Cloud,
  Palette,
  Upload,
  LayoutGrid,
  FilePlus,
  PanelLeftOpen,
  Type,
  Sparkles,
  CheckCircle2,
  FileText,
  Sliders,
  MessageCircle,
  Instagram,
  FileEdit
} from 'lucide-react';
import { HistoryPanel } from './components/HistoryPanel';
import { HeroSection } from './components/HeroSection';
import { PricingPlans } from './components/PricingPlans';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { QRCodeConfig, HistoryItem, ContentType, QRFrame, User, FrameFont } from './types';
import { downloadPNG, downloadSVG } from './utils/download';
import { AdPlaceholder } from './components/AdPlaceholder';
import { AuthModal } from './components/AuthModal';
import { PhonePreview } from './components/PhonePreview';
import { LandingViewer } from './components/LandingViewer';
import { QRRenderer, FrameThumbnail } from './components/QRRenderer';
import { FRAMES, FONT_FAMILIES } from './components/framesData';
import { getQRFromFirebase, saveQRToFirebase, auth, logoutFirebase, getFirestoreErrorMessage } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// DEFAULT CONFIG
const DEFAULT_CONFIG: QRCodeConfig = {
  value: 'https://google.com',
  targetContent: 'https://google.com',
  contentType: 'URL',
  fgColor: '#000000',
  bgColor: '#ffffff',
  level: 'H',
  size: 1024,
  includeMargin: false,
  frameId: 'none',
  frameText: 'ESCANÉAME',
  frameTextColor: '#ffffff',
  frameColor: '#000000',
  frameFont: 'sans',
  isDynamic: false,
  logoSize: 22,
  logoBackground: true,
  showCard: false,
  cardPosition: 'bottom',
  cardTitle: '¡Escanea este código QR!',
  cardSubtitle: 'Apunta la cámara de tu teléfono para acceder al instante.',
  cardInstructions: '1. Abre tu cámara • 2. Enfoca el código • 3. Toca el enlace',
  cardCta: 'Acceso seguro sin contacto',
  cardBgColor: '#ffffff',
  cardTextColor: '#1e293b',
  landingThemeColor: '#4f46e5',
  landingBgColor: '#f8fafc',
  landingTextColor: '#1e293b'
};

export default function App() {
  const [config, setConfig] = useState<QRCodeConfig>(DEFAULT_CONFIG);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default open on desktop
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'LANDING' | 'STYLE' | 'TEXT' | 'LOGO'>('CONTENT');
  
  // Navigation State
  const [view, setView] = useState<'LANDING' | 'GENERATOR' | 'VIEWER' | 'LOADING'>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hasParams = searchParams.has('id') || searchParams.has('q') || searchParams.has('d');
    return hasParams ? 'LOADING' : 'LANDING';
  });
  
  const [viewerData, setViewerData] = useState<string | QRCodeConfig | null>(null); 
  
  // Auth & Plans State
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [analyticsItem, setAnalyticsItem] = useState<HistoryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // View Mode (Split View)
  const [previewTab, setPreviewTab] = useState<'QR' | 'MOBILE'>('QR');

  const svgRef = useRef<SVGSVGElement>(null);

  // Form states
  const [urlInput, setUrlInput] = useState('https://');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [geoLat, setGeoLat] = useState('');
  const [geoLon, setGeoLon] = useState('');
  const [vcardName, setVcardName] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');

  // Dynamic Config States
  const [dynTitle, setDynTitle] = useState('');
  const [dynDesc, setDynDesc] = useState('');
  const [dynBtn, setDynBtn] = useState('');
  const [expiry, setExpiry] = useState('');
  const [scanLimit, setScanLimit] = useState('');
  const [password, setPassword] = useState('');

  // Landing Customization States
  const [landingLogoUrl, setLandingLogoUrl] = useState<string | undefined>(undefined);
  const [landingThemeColor, setLandingThemeColor] = useState('#4f46e5');
  const [landingBgColor, setLandingBgColor] = useState('#f8fafc');
  const [landingExtraNotes, setLandingExtraNotes] = useState('');
  const [landingWhatsapp, setLandingWhatsapp] = useState('');
  const [landingInstagram, setLandingInstagram] = useState('');
  const [landingPhone, setLandingPhone] = useState('');
  const [landingWebsite, setLandingWebsite] = useState('');

  // Random Short ID for session
  const [shortId, setShortId] = useState(() => Math.random().toString(36).substring(2, 9));

  // Handle Theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // AUTH STATE LISTENER (Firebase)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || undefined
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Initial Load Routing Logic
  useEffect(() => {
    const savedHistory = localStorage.getItem('qr-history');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }

    const searchParams = new URLSearchParams(window.location.search);
    const legacyData = searchParams.get('d');
    const firebaseId = searchParams.get('id') || searchParams.get('q');
    
    if (firebaseId) {
      getQRFromFirebase(firebaseId).then(data => {
        if (data) {
          setViewerData(data);
          setView('VIEWER');
        } else {
          alert('Este código QR no existe o ha sido eliminado.');
          setView('LANDING');
        }
      }).catch(() => {
          setView('LANDING');
      });
    } else if (legacyData) {
      setViewerData(legacyData);
      setView('VIEWER');
    } else {
       if (view === 'LOADING') {
          setView('LANDING');
       }
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('qr-history', JSON.stringify(history));
    }
  }, [history, user]);

  const handleLogout = async () => {
    await logoutFirebase();
    setView('LANDING');
  };

  const handleStart = () => {
    setView('GENERATOR');
  };

  const handleNewQR = () => {
    if (window.confirm("¿Estás seguro? Se perderán los cambios no guardados del QR actual.")) {
      setConfig(DEFAULT_CONFIG);
      setUrlInput('https://');
      setWifiSsid('');
      setWifiPass('');
      setVideoUrl('');
      setGeoLat('');
      setGeoLon('');
      setVcardName('');
      setVcardPhone('');
      setVcardEmail('');
      setDynTitle('');
      setDynDesc('');
      setDynBtn('');
      setExpiry('');
      setScanLimit('');
      setPassword('');
      setLandingLogoUrl(undefined);
      setLandingThemeColor('#4f46e5');
      setLandingBgColor('#f8fafc');
      setLandingExtraNotes('');
      setLandingWhatsapp('');
      setLandingInstagram('');
      setLandingPhone('');
      setLandingWebsite('');
      setShortId(Math.random().toString(36).substring(2, 9));
      setActiveTab('CONTENT');
    }
  };

  // Update QR Value Logic
  useEffect(() => {
    let realContent = '';
    switch (config.contentType) {
      case 'URL': realContent = urlInput; break;
      case 'WIFI': realContent = `WIFI:S:${wifiSsid};T:WPA;P:${wifiPass};;`; break;
      case 'VIDEO': realContent = videoUrl; break;
      case 'LOCATION': realContent = `geo:${geoLat},${geoLon}`; break;
      case 'VCARD': realContent = `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`; break;
    }

    let qrPayload = realContent;
    if (config.isDynamic) {
      qrPayload = `${window.location.origin}?id=${shortId}`;
    }

    setConfig(prev => ({ 
      ...prev, 
      value: qrPayload,        
      targetContent: realContent, 
      shortId: shortId,
      dynamicTitle: dynTitle,
      dynamicDescription: dynDesc,
      dynamicButtonText: dynBtn,
      landingLogoUrl: landingLogoUrl,
      landingThemeColor: landingThemeColor,
      landingBgColor: landingBgColor,
      landingExtraNotes: landingExtraNotes,
      landingWhatsapp: landingWhatsapp,
      landingInstagram: landingInstagram,
      landingPhone: landingPhone,
      landingWebsite: landingWebsite,
      expiryDate: expiry,
      scanLimit: scanLimit ? parseInt(scanLimit) : undefined,
      password: password,
      passwordProtected: !!password
    }));
    
  }, [urlInput, wifiSsid, wifiPass, videoUrl, geoLat, geoLon, vcardName, vcardPhone, vcardEmail, config.contentType, config.isDynamic, dynTitle, dynDesc, dynBtn, landingLogoUrl, landingThemeColor, landingBgColor, landingExtraNotes, landingWhatsapp, landingInstagram, landingPhone, landingWebsite, expiry, scanLimit, password, shortId]);

  // Reset dynamic defaults
  useEffect(() => {
    switch (config.contentType) {
      case 'WIFI': 
        setDynTitle(prev => prev || 'Conexión WiFi'); 
        setDynDesc(prev => prev || `Únete a la red "${wifiSsid || '...' }" fácilmente.`);
        setDynBtn(prev => prev || 'Conectar a WiFi');
        break;
      case 'URL': 
        setDynTitle(prev => prev || 'Visita nuestro enlace');
        setDynDesc(prev => prev || 'Accede al contenido oficial al instante.');
        setDynBtn(prev => prev || 'Continuar al Sitio');
        break;
      default:
        if (!dynTitle) setDynTitle('Bienvenido');
        if (!dynDesc) setDynDesc('Haz clic abajo para continuar.');
        if (!dynBtn) setDynBtn('Acceder Ahora');
    }
  }, [config.contentType]);

  const handleSave = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    
    setIsSaving(true);

    try {
      await saveQRToFirebase({
         ...config,
         ownerId: user.id
      });

      const newHistoryItem: HistoryItem = {
        ...config,
        id: config.shortId!, 
        createdAt: Date.now(),
        title: config.isDynamic ? `[Smart] ${dynTitle || 'QR Dinámico'}` : (config.contentType === 'URL' ? urlInput : config.contentType),
        wifiSsid, wifiPass, locationLat: geoLat, locationLon: geoLon, vcardName, vcardPhone, vcardEmail
      };
      
      setHistory(prev => {
        const filtered = prev.filter(h => h.shortId !== newHistoryItem.shortId);
        return [newHistoryItem, ...filtered];
      });
      
      alert("¡Guardado exitosamente en la nube!");

    } catch (error: any) {
      console.error(error);
      alert(getFirestoreErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setConfig(item);
    setShortId(item.shortId || item.id);
    
    if (item.contentType === 'URL') setUrlInput(item.targetContent || item.value);
    if (item.contentType === 'WIFI') {
      setWifiSsid(item.wifiSsid || '');
      setWifiPass(item.wifiPass || '');
    }
    if (item.contentType === 'VCARD') {
      setVcardName(item.vcardName || '');
      setVcardPhone(item.vcardPhone || '');
      setVcardEmail(item.vcardEmail || '');
    }
    setDynTitle(item.dynamicTitle || '');
    setDynDesc(item.dynamicDescription || '');
    setDynBtn(item.dynamicButtonText || '');
    setLandingLogoUrl(item.landingLogoUrl);
    setLandingThemeColor(item.landingThemeColor || '#4f46e5');
    setLandingBgColor(item.landingBgColor || '#f8fafc');
    setLandingExtraNotes(item.landingExtraNotes || '');
    setLandingWhatsapp(item.landingWhatsapp || '');
    setLandingInstagram(item.landingInstagram || '');
    setLandingPhone(item.landingPhone || '');
    setLandingWebsite(item.landingWebsite || '');
    setExpiry(item.expiryDate || '');
    setPassword(item.password || '');
    
    // Don't close sidebar on desktop when selecting, only mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleDownload = (format: 'PNG' | 'SVG') => {
    if (svgRef.current) {
      if (format === 'PNG') {
        downloadPNG(svgRef.current, `qrmaestro-${Date.now()}`, 2048);
      } else {
         downloadSVG(svgRef.current, `qrmaestro-${Date.now()}`);
      }
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLandingLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLandingLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const openAnalyticsForCurrent = () => {
     if (!user) return setAuthModalOpen(true);
     // Create a temporary HistoryItem to pass to the modal
     const item: HistoryItem = {
        ...config,
        id: config.shortId!,
        title: dynTitle || 'Mi Código QR',
        createdAt: Date.now()
     };
     setAnalyticsItem(item);
  };

  // --- RENDER LOADING ---
  if (view === 'LOADING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
         <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-slate-500 font-medium animate-pulse">Cargando QR...</p>
         </div>
      </div>
    );
  }

  // --- RENDER VIEWER ---
  if (view === 'VIEWER' && viewerData) {
    return <LandingViewer data={viewerData} />;
  }

  // --- RENDER LANDING ---
  if (view === 'LANDING') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200">
        <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-lg">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                QRMaestro
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {user ? (
                 <div className="flex items-center gap-3">
                    <span className="text-sm font-medium hidden sm:block">{user.name}</span>
                    <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-600">Salir</button>
                    <button onClick={handleStart} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Ir al Panel
                    </button>
                 </div>
              ) : (
                <div className="flex items-center gap-3">
                   <button onClick={() => setAuthModalOpen(true)} className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 font-medium">
                     Acceder
                   </button>
                   <button onClick={handleStart} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-indigo-500/20">
                     Crear QR Gratis
                   </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        <HeroSection onStart={handleStart} />
        <div className="max-w-5xl mx-auto px-4 mb-16">
           <AdPlaceholder format="horizontal" className="h-32" />
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    );
  }

  // --- RENDER GENERATOR ---
  const activeFrame = FRAMES.find(f => f.id === config.frameId) || FRAMES[0];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      
      <HistoryPanel 
        history={history}
        onSelect={handleHistorySelect}
        onDelete={handleDeleteHistory}
        onAnalytics={(item) => setAnalyticsItem(item)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button 
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
                title={sidebarOpen ? "Cerrar Menú" : "Abrir Menú"}
            >
              {sidebarOpen ? <Menu className="w-6 h-6" /> : <PanelLeftOpen className="w-6 h-6" />}
            </button>
            <button onClick={() => setView('LANDING')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg lg:hidden">
               <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-md">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg hidden sm:block">QRMaestro</span>
            </div>
          </div>

          <div className="hidden md:block flex-1 px-8">
             <AdPlaceholder format="horizontal" className="h-12 max-w-md mx-auto bg-transparent border-dashed" label="Espacio Patrocinado" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* ESTADÍSTICAS BUTTON IN TOP MENU */}
            <button 
              onClick={openAnalyticsForCurrent}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Ver estadísticas y métricas de escaneo"
            >
              <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Estadísticas</span>
            </button>

            <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {!user ? (
               <div className="flex items-center gap-2">
                 <button 
                    onClick={() => setPricingModalOpen(true)}
                    className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold uppercase tracking-wide hover:bg-amber-200 transition-colors"
                 >
                    <Zap className="w-3 h-3" /> Premium
                 </button>
                 <button onClick={() => setAuthModalOpen(true)} className="flex items-center gap-2 text-sm font-medium hover:text-indigo-500 px-2">
                    <UserIcon className="w-4 h-4" /> Acceder
                 </button>
               </div>
            ) : (
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs overflow-hidden">
                     {user.avatar ? (
                       <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                       user.name.substring(0,2).toUpperCase()
                     )}
                  </div>
                  <button onClick={handleLogout} title="Cerrar sesión">
                     <LogOut className="w-5 h-5 text-slate-400 hover:text-red-500" />
                  </button>
               </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 relative scroll-smooth">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Controls */}
            <div className="lg:col-span-7 space-y-5">
              
              <div className="flex gap-3">
                 <button 
                   onClick={handleNewQR}
                   className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-dashed border-gray-300 dark:border-slate-700 p-3 rounded-xl font-bold transition-all group"
                 >
                   <FilePlus className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                   <span>Nuevo</span>
                 </button>
              </div>

              {/* TABS */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                 <button 
                   onClick={() => setActiveTab('CONTENT')}
                   className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'CONTENT' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                 >
                   <LayoutGrid className="w-4 h-4" /> Contenido
                 </button>

                 {config.isDynamic && (
                   <button 
                     onClick={() => setActiveTab('LANDING')}
                     className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'LANDING' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                   >
                     <Smartphone className="w-4 h-4 text-indigo-400" /> Página Móvil
                   </button>
                 )}

                 <button 
                   onClick={() => setActiveTab('STYLE')}
                   className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'STYLE' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                 >
                   <Palette className="w-4 h-4" /> Estilo y Marcos
                 </button>
                 <button 
                   onClick={() => setActiveTab('TEXT')}
                   className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'TEXT' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                 >
                   <FileText className="w-4 h-4" /> Tarjeta / Texto
                 </button>
                 <button 
                   onClick={() => setActiveTab('LOGO')}
                   className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'LOGO' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                 >
                   <ImageIcon className="w-4 h-4" /> Logo QR
                 </button>
              </div>

              {/* TAB CONTENT: CONTENT */}
              {activeTab === 'CONTENT' && (
                <div className="space-y-5 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  {/* Static vs Dynamic Switch */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-1.5 flex shadow-sm border border-gray-200 dark:border-slate-800">
                     <button 
                       onClick={() => setConfig(prev => ({ ...prev, isDynamic: false }))}
                       className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${!config.isDynamic ? 'bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-inner' : 'text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}
                     >
                       <QrCode className="w-4 h-4" /> QR Estático
                     </button>
                     <button 
                       onClick={() => {
                          if(!user) setAuthModalOpen(true);
                          else setConfig(prev => ({ ...prev, isDynamic: true }));
                       }}
                       className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${config.isDynamic ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}
                     >
                       <Cloud className="w-4 h-4" /> QR Dinámico
                     </button>
                  </div>

                  {/* Content Type Tabs */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-2 flex flex-wrap gap-2">
                    {[
                      { id: 'URL', icon: Globe, label: 'Web' },
                      { id: 'WIFI', icon: Wifi, label: 'WiFi' },
                      { id: 'VCARD', icon: CreditCard, label: 'VCard' },
                      { id: 'LOCATION', icon: MapPin, label: 'Mapa' },
                      { id: 'VIDEO', icon: Video, label: 'Video' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setConfig({ ...config, contentType: type.id as ContentType })}
                        className={`flex-1 min-w-[70px] flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-lg transition-all text-xs font-medium
                          ${config.contentType === type.id 
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20' 
                            : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                      >
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </button>
                    ))}
                  </div>

                  {/* Input Forms (Standard Content) */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-5">
                    <h2 className="text-sm font-bold mb-3 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-indigo-500" />
                      {config.isDynamic ? 'Destino Final del QR' : 'Contenido del QR'}
                    </h2>
                    
                    {config.contentType === 'URL' && (
                      <div className="space-y-2">
                        <input 
                          type="url" 
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="https://ejemplo.com"
                        />
                      </div>
                    )}

                    {config.contentType === 'WIFI' && (
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          value={wifiSsid}
                          onChange={(e) => setWifiSsid(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                          placeholder="Nombre de Red (SSID)"
                        />
                        <input 
                          type="text" 
                          value={wifiPass}
                          onChange={(e) => setWifiPass(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                          placeholder="Contraseña"
                        />
                      </div>
                    )}
                    {config.contentType === 'VIDEO' && (
                         <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm" placeholder="https://youtube.com/..." />
                    )}
                    {config.contentType === 'LOCATION' && (
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" value={geoLat} onChange={(e) => setGeoLat(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm" placeholder="Latitud" />
                        <input type="text" value={geoLon} onChange={(e) => setGeoLon(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm" placeholder="Longitud" />
                      </div>
                    )}
                    {config.contentType === 'VCARD' && (
                      <div className="space-y-3">
                        <input type="text" value={vcardName} onChange={e => setVcardName(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm" placeholder="Nombre" />
                        <input type="tel" value={vcardPhone} onChange={e => setVcardPhone(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm" placeholder="Teléfono" />
                        <input type="email" value={vcardEmail} onChange={e => setVcardEmail(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm" placeholder="Email" />
                      </div>
                    )}
                  </div>

                  {/* SHORTCUT TO LANDING CUSTOMIZER IF DYNAMIC */}
                  {config.isDynamic && (
                    <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl p-4 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <Smartphone className="w-6 h-6 text-indigo-600" />
                          <div>
                            <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">Personalizar Página Móvil</p>
                            <p className="text-[11px] text-indigo-700 dark:text-indigo-400">Modifica logo, colores, texto adicional y botones de contacto.</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => setActiveTab('LANDING')}
                         className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                       >
                         <span>Configurar</span>
                         <ArrowRight className="w-3.5 h-3.5" />
                       </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: LANDING CUSTOMIZATION */}
              {activeTab === 'LANDING' && (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-5 space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  
                  {/* Header / Intro */}
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-indigo-600" />
                        Página de Destino Móvil (Landing Page)
                      </h2>
                      <p className="text-xs text-slate-500">Personaliza la experiencia completa que verán los usuarios al escanear este código QR.</p>
                    </div>
                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-mono px-2 py-1 rounded border border-indigo-200 dark:border-indigo-800">
                      ID: {config.shortId}
                    </span>
                  </div>

                  {/* Brand Logo for Landing */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 block">1. Logo / Imagen de la Landing</label>
                    <div className="flex items-center gap-4">
                       <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-700 relative overflow-hidden group shadow-sm">
                          {landingLogoUrl ? (
                            <>
                              <img src={landingLogoUrl} alt="Logo Landing" className="w-full h-full object-contain p-2" />
                              <button 
                                onClick={() => setLandingLogoUrl(undefined)} 
                                className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs"
                              >
                                Quitar
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400 text-center px-1">Sin Logo</span>
                          )}
                       </div>
                       
                       <div className="flex-1 space-y-2">
                          <label className="block w-full cursor-pointer">
                             <div className="w-full bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 rounded-xl p-3 text-center transition-all flex items-center justify-center gap-2">
                                <Upload className="w-4 h-4" />
                                <span className="text-xs font-bold">Subir Logo para la Landing</span>
                             </div>
                             <input type="file" accept="image/*" onChange={handleLandingLogoUpload} className="hidden" />
                          </label>

                          {config.logoUrl && !landingLogoUrl && (
                            <button
                              onClick={() => setLandingLogoUrl(config.logoUrl)}
                              className="text-[11px] text-indigo-600 hover:underline font-medium block"
                            >
                              Copiar logo del código QR
                            </button>
                          )}
                       </div>
                    </div>
                  </div>

                  {/* Colors Customization */}
                  <div className="space-y-4 pt-3 border-t border-gray-100 dark:border-slate-800">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">2. Colores del Tema</label>
                    
                    {/* Header/Theme Color */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Color de Cabecera y Botón Principal</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={landingThemeColor} 
                            onChange={(e) => setLandingThemeColor(e.target.value)} 
                            className="w-6 h-6 rounded cursor-pointer border-none bg-transparent" 
                          />
                          <span className="text-xs font-mono uppercase">{landingThemeColor}</span>
                        </div>
                      </div>

                      {/* Presets */}
                      <div className="flex flex-wrap gap-2">
                        {[
                          { name: 'Índigo', color: '#4f46e5' },
                          { name: 'Esmeralda', color: '#059669' },
                          { name: 'Azul', color: '#2563eb' },
                          { name: 'Púrpura', color: '#9333ea' },
                          { name: 'Rosa Neón', color: '#db2777' },
                          { name: 'Ámbar', color: '#d97706' },
                          { name: 'Grafito', color: '#1e293b' },
                        ].map((p) => (
                          <button
                            key={p.color}
                            onClick={() => setLandingThemeColor(p.color)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all"
                            style={{ 
                              borderColor: landingThemeColor === p.color ? p.color : '#e2e8f0',
                              backgroundColor: landingThemeColor === p.color ? `${p.color}15` : 'transparent' 
                            }}
                          >
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></span>
                            <span>{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Page Background Color */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Fondo de la Pantalla</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={landingBgColor} 
                            onChange={(e) => setLandingBgColor(e.target.value)} 
                            className="w-6 h-6 rounded cursor-pointer border-none bg-transparent" 
                          />
                          <span className="text-xs font-mono uppercase">{landingBgColor}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { name: 'Luminoso', color: '#f8fafc' },
                          { name: 'Blanco Puro', color: '#ffffff' },
                          { name: 'Gris Claro', color: '#f1f5f9' },
                          { name: 'Crema Cálido', color: '#fafaf9' },
                          { name: 'Oscuro Noche', color: '#0f172a' },
                        ].map((p) => (
                          <button
                            key={p.color}
                            onClick={() => setLandingBgColor(p.color)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 dark:border-slate-700 hover:border-gray-400 transition-all"
                          >
                            <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: p.color }}></span>
                            <span>{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Texts Configuration */}
                  <div className="space-y-3.5 pt-3 border-t border-gray-100 dark:border-slate-800">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">3. Textos y Mensajes de Bienvenida</label>
                    
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Título Principal</label>
                      <input 
                        type="text" 
                        value={dynTitle} 
                        onChange={e => setDynTitle(e.target.value)} 
                        className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm font-semibold" 
                        placeholder="Ej. Bienvenidos a Café Gourmet" 
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Descripción / Subtítulo</label>
                      <textarea 
                        value={dynDesc} 
                        onChange={e => setDynDesc(e.target.value)} 
                        className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm h-16 resize-none" 
                        placeholder="Ej. Toca el botón para ver nuestra carta digital con promociones exclusivas." 
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Texto del Botón de Acción</label>
                      <input 
                        type="text" 
                        value={dynBtn} 
                        onChange={e => setDynBtn(e.target.value)} 
                        className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm" 
                        placeholder="Ej. Ver Carta y Menú" 
                      />
                    </div>
                  </div>

                  {/* Additional Text Zone (Extra Notes / Schedules / Promo) */}
                  <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">4. Zona de Texto Adicional (Horarios, Notas, Promos)</label>
                      <span className="text-[10px] text-slate-400">Opcional</span>
                    </div>
                    <textarea 
                      value={landingExtraNotes} 
                      onChange={e => setLandingExtraNotes(e.target.value)} 
                      className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm h-24 resize-none leading-relaxed" 
                      placeholder="Ej: 🕒 Horario de Atención: Lunes a Viernes 09:00 a 20:00 hs.&#10;🎉 Promo del día: 15% OFF abonando en efectivo." 
                    />
                    <p className="text-[11px] text-slate-400">
                      Este bloque se mostrará destacado como una tarjeta de información complementaria dentro de la landing page.
                    </p>
                  </div>

                  {/* Direct Contact & Social Links */}
                  <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">5. Canales de Contacto Directo</label>
                      <span className="text-[10px] text-slate-400">Botones de acceso rápido</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mb-1">
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </label>
                        <input 
                          type="text" 
                          value={landingWhatsapp} 
                          onChange={e => setLandingWhatsapp(e.target.value)} 
                          className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-xs" 
                          placeholder="Ej: +5491123456789" 
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-pink-600 flex items-center gap-1 mb-1">
                          <Instagram className="w-3.5 h-3.5" /> Instagram
                        </label>
                        <input 
                          type="text" 
                          value={landingInstagram} 
                          onChange={e => setLandingInstagram(e.target.value)} 
                          className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-xs" 
                          placeholder="Ej: @mitienda" 
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-blue-600 flex items-center gap-1 mb-1">
                          <Phone className="w-3.5 h-3.5" /> Teléfono
                        </label>
                        <input 
                          type="tel" 
                          value={landingPhone} 
                          onChange={e => setLandingPhone(e.target.value)} 
                          className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-xs" 
                          placeholder="Ej: +1 555-0199" 
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-1">
                          <Globe className="w-3.5 h-3.5" /> Sitio Web Alternativo
                        </label>
                        <input 
                          type="url" 
                          value={landingWebsite} 
                          onChange={e => setLandingWebsite(e.target.value)} 
                          className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-xs" 
                          placeholder="https://mitienda.com" 
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB CONTENT: STYLE & FRAMES */}
              {activeTab === 'STYLE' && (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-5 space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  
                  {/* Colors Section */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Colores Principales</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Color del Código QR</label>
                        <div className="flex items-center gap-3 p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                          <input 
                            type="color" 
                            value={config.fgColor} 
                            onChange={(e) => setConfig({ ...config, fgColor: e.target.value })} 
                            className="w-9 h-9 rounded-lg cursor-pointer border-none p-0 bg-transparent" 
                          />
                          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 uppercase">{config.fgColor}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Color de Fondo</label>
                        <div className="flex items-center gap-3 p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                          <input 
                            type="color" 
                            value={config.bgColor} 
                            onChange={(e) => setConfig({ ...config, bgColor: e.target.value })} 
                            className="w-9 h-9 rounded-lg cursor-pointer border-none p-0 bg-transparent" 
                          />
                          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 uppercase">{config.bgColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Frames Picker */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                       <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Marcos y Siluetas</h3>
                       <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{FRAMES.length} estilos</span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                      {FRAMES.map((frame) => {
                        const isSelected = config.frameId === frame.id;
                        return (
                          <button
                            key={frame.id}
                            onClick={() => {
                              setConfig(prev => ({
                                ...prev,
                                frameId: frame.id,
                                frameText: prev.frameText || frame.defaultText || 'ESCANÉAME'
                              }));
                            }}
                            className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-between gap-1.5 transition-all text-center group
                              ${isSelected 
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 shadow-md shadow-indigo-500/10' 
                                : 'border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 bg-gray-50/50 dark:bg-slate-800/30'
                              }`}
                          >
                            <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                              <FrameThumbnail frame={frame} isSelected={isSelected} fgColor={config.fgColor} />
                            </div>
                            <span className={`text-[11px] font-bold leading-tight line-clamp-1 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                              {frame.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Frame Text & Customization Options */}
                  {config.frameId !== 'none' && (
                    <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 dark:text-indigo-300">
                        <Type className="w-4 h-4 text-indigo-600" />
                        <span>Personalizar Marco y Texto del Badge</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 mb-1 block">Texto del Marco / Llamado a la Acción</label>
                          <input 
                            type="text" 
                            value={config.frameText || ''} 
                            onChange={(e) => setConfig({ ...config, frameText: e.target.value })} 
                            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm font-semibold"
                            placeholder="Ej: ESCANÉAME, VER MENÚ, FOTOS"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-500 mb-1 block">Tipografía del Marco</label>
                          <select
                            value={config.frameFont || 'sans'}
                            onChange={(e) => setConfig({ ...config, frameFont: e.target.value as FrameFont })}
                            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm font-semibold"
                          >
                            <option value="sans">Moderna (Sans-Serif)</option>
                            <option value="serif">Elegante (Serif / Clásica)</option>
                            <option value="display">Impacto / Bold (Display)</option>
                            <option value="mono">Código (Monospace)</option>
                            <option value="handwriting">Manuscrita / Cursiva</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 mb-1 block">Color del Marco y Badge</label>
                          <div className="flex items-center gap-2 p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                            <input 
                              type="color" 
                              value={config.frameColor || config.fgColor} 
                              onChange={(e) => setConfig({ ...config, frameColor: e.target.value })} 
                              className="w-7 h-7 rounded cursor-pointer border-none p-0 bg-transparent" 
                            />
                            <span className="text-xs font-mono text-slate-500 uppercase">{config.frameColor || config.fgColor}</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 mb-1 block">Color del Texto del Marco</label>
                          <div className="flex items-center gap-2 p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                            <input 
                              type="color" 
                              value={config.frameTextColor || '#ffffff'} 
                              onChange={(e) => setConfig({ ...config, frameTextColor: e.target.value })} 
                              className="w-7 h-7 rounded cursor-pointer border-none p-0 bg-transparent" 
                            />
                            <span className="text-xs font-mono text-slate-500 uppercase">{config.frameTextColor || '#ffffff'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB CONTENT: TARJETA & TEXTO ADICIONAL */}
              {activeTab === 'TEXT' && (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-5 space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  
                  {/* Enable Card Layout Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Formato Tarjeta con Instrucciones</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Añade textos explicativos, instrucciones y diseño de cartel alrededor del QR.</p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={!!config.showCard} 
                        onChange={(e) => setConfig(prev => ({ ...prev, showCard: e.target.checked }))} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {config.showCard ? (
                    <div className="space-y-5">
                      
                      {/* Card Position Selector */}
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 block">Ubicación y Formato del Texto</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                          {[
                            { id: 'bottom', label: 'Texto Abajo', desc: 'Vertical' },
                            { id: 'top', label: 'Texto Arriba', desc: 'Encabezado' },
                            { id: 'right', label: 'Texto Derecha', desc: 'Horizontal' },
                            { id: 'left', label: 'Texto Izquierda', desc: 'Horizontal' },
                            { id: 'flyer', label: 'Cartel / Flyer', desc: 'Póster completo' },
                          ].map((pos) => {
                            const isSelected = (config.cardPosition || 'bottom') === pos.id;
                            return (
                              <button
                                key={pos.id}
                                onClick={() => setConfig(prev => ({ ...prev, cardPosition: pos.id as any }))}
                                className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 text-center transition-all
                                  ${isSelected 
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold' 
                                    : 'border-gray-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-200'
                                  }`}
                              >
                                <span className="text-xs">{pos.label}</span>
                                <span className="text-[10px] opacity-60 font-normal">{pos.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Card Content Inputs */}
                      <div className="space-y-3.5 pt-2">
                        <div>
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Título Principal de la Tarjeta</label>
                          <input 
                            type="text" 
                            value={config.cardTitle || ''} 
                            onChange={(e) => setConfig({ ...config, cardTitle: e.target.value })} 
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm font-semibold"
                            placeholder="Ej: ¡Escanea para ver nuestro menú!"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Subtítulo Descriptivo</label>
                          <input 
                            type="text" 
                            value={config.cardSubtitle || ''} 
                            onChange={(e) => setConfig({ ...config, cardSubtitle: e.target.value })} 
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                            placeholder="Ej: Apunta la cámara de tu smartphone para acceder al instante."
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Instrucciones Paso a Paso</label>
                          <input 
                            type="text" 
                            value={config.cardInstructions || ''} 
                            onChange={(e) => setConfig({ ...config, cardInstructions: e.target.value })} 
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                            placeholder="Ej: 1. Abre tu cámara • 2. Enfoca el código • 3. Toca el enlace"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Texto de Pie / Llamado a la Acción</label>
                          <input 
                            type="text" 
                            value={config.cardCta || ''} 
                            onChange={(e) => setConfig({ ...config, cardCta: e.target.value })} 
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                            placeholder="Ej: Acceso rápido sin contacto • Red WiFi: Clientes2026"
                          />
                        </div>
                      </div>

                      {/* Card Colors */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-slate-800">
                        <div>
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Color Fondo de Tarjeta</label>
                          <div className="flex items-center gap-3 p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                            <input 
                              type="color" 
                              value={config.cardBgColor || '#ffffff'} 
                              onChange={(e) => setConfig({ ...config, cardBgColor: e.target.value })} 
                              className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent" 
                            />
                            <span className="text-xs font-mono uppercase">{config.cardBgColor || '#ffffff'}</span>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Color de Texto de Tarjeta</label>
                          <div className="flex items-center gap-3 p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                            <input 
                              type="color" 
                              value={config.cardTextColor || '#1e293b'} 
                              onChange={(e) => setConfig({ ...config, cardTextColor: e.target.value })} 
                              className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent" 
                            />
                            <span className="text-xs font-mono uppercase">{config.cardTextColor || '#1e293b'}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-6 px-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                      <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Modo Tarjeta Desactivado</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Activa la casilla superior para convertir tu QR en una tarjeta de presentación, cartel o flyer listo para imprimir con títulos e instrucciones de lectura.
                      </p>
                    </div>
                  )}

                </div>
              )}

              {/* TAB CONTENT: LOGO */}
              {activeTab === 'LOGO' && (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-5 space-y-5 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <div className="flex items-center gap-4">
                     <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-700 relative overflow-hidden group shadow-inner">
                        {config.logoUrl ? (
                          <>
                            <img src={config.logoUrl} alt="Logo QR" className="w-full h-full object-contain p-2" />
                            <button 
                              onClick={() => setConfig(prev => ({ ...prev, logoUrl: undefined }))} 
                              className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs"
                            >
                              Eliminar
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400 text-center px-2">Sin Logo</span>
                        )}
                     </div>
                     <div className="flex-1 space-y-2">
                        <label className="block w-full cursor-pointer">
                           <div className="w-full bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 rounded-xl p-4 text-center transition-all flex flex-col items-center gap-1.5 shadow-sm">
                              <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                              <span className="text-sm font-bold">Subir Logo o Imagen</span>
                              <span className="text-[11px] text-slate-500 font-normal">PNG, JPG, SVG o WebP</span>
                           </div>
                           <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                     </div>
                  </div>

                  {config.logoUrl && (
                    <div className="space-y-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                           <span>Tamaño Proporcional del Logo</span>
                           <span className="text-indigo-600 font-mono">{config.logoSize || 22}% del QR</span>
                        </div>
                        <input 
                          type="range" 
                          min="15" 
                          max="32" 
                          value={config.logoSize || 22} 
                          onChange={(e) => setConfig(prev => ({ ...prev, logoSize: parseInt(e.target.value) }))} 
                          className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          El tamaño está optimizado automáticamente para garantizar el 100% de legibilidad del código QR.
                        </span>
                      </div>

                      {/* Backdrop Circle for Logo */}
                      <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-gray-200 dark:border-slate-700">
                        <input 
                          type="checkbox" 
                          checked={config.logoBackground !== false} 
                          onChange={(e) => setConfig(prev => ({ ...prev, logoBackground: e.target.checked }))} 
                          className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" 
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Fondo circular blanco de contraste</span>
                          <span className="text-[11px] text-slate-500 block">Hace que cualquier logotipo o imagen se vea nítida y resalte sobre los puntos del QR.</span>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              )}
              
              <AdPlaceholder className="h-20" label="Publicidad" />

            </div>

            {/* Right Column: Preview & Download */}
            <div className="lg:col-span-5 space-y-4">
              <div className="sticky top-4">
                
                {config.isDynamic && (
                   <div className="flex gap-2 mb-3 bg-white dark:bg-slate-900 p-1 rounded-lg border border-gray-200 dark:border-slate-800 w-fit mx-auto shadow-sm scale-90">
                      <button 
                        onClick={() => setPreviewTab('QR')} 
                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${previewTab === 'QR' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                      >
                        <QrCode className="w-3.5 h-3.5" /> QR
                      </button>
                      <button 
                         onClick={() => setPreviewTab('MOBILE')}
                         className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${previewTab === 'MOBILE' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                      >
                        <Smartphone className="w-3.5 h-3.5" /> Móvil
                      </button>
                   </div>
                )}

                {/* PREVIEW CARD */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-200 dark:border-slate-800 p-6 flex flex-col items-center gap-5 relative overflow-hidden min-h-[380px] justify-center">
                  
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                  {config.isDynamic && previewTab === 'MOBILE' ? (
                    <div className="animate-in fade-in zoom-in-95 duration-300 scale-75 origin-top -mb-10">
                       <PhonePreview config={config} />
                    </div>
                  ) : (
                    <div className="relative group animate-in fade-in zoom-in-95 duration-300 w-full flex items-center justify-center p-2">
                      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-10 blur-xl group-hover:opacity-25 transition-opacity duration-500 pointer-events-none"></div>
                      
                      {/* VIBRANT & ACCURATE QR RENDERER */}
                      <div className="max-w-[280px] w-full flex items-center justify-center drop-shadow-2xl">
                        <QRRenderer
                          config={config}
                          svgRef={svgRef}
                          className="w-full h-auto max-h-[340px] transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {(!config.isDynamic || previewTab === 'QR') && (
                    <div className="flex flex-col w-full gap-2.5 mt-1 max-w-sm">
                      <button 
                        onClick={() => handleDownload('PNG')}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all text-sm active:scale-98"
                      >
                        <Download className="w-4 h-4" />
                        Descargar PNG en Alta Calidad
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleDownload('SVG')}
                          className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-xs"
                        >
                          <ImageIcon className="w-3.5 h-3.5" /> Vector SVG
                        </button>
                        <button 
                          onClick={handleSave}
                          disabled={isSaving}
                          className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 text-xs"
                        >
                          {isSaving ? <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5 text-indigo-500" />}
                          {config.isDynamic ? 'Guardar Smart' : 'Guardar QR'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <AdPlaceholder className="mt-4 h-32" label="Espacio Patrocinado" />
              </div>
            </div>
          </div>
        </main>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      {pricingModalOpen && <PricingPlans onClose={() => setPricingModalOpen(false)} onSubscribe={() => setAuthModalOpen(true)} />}
      {analyticsItem && <AnalyticsPanel qr={analyticsItem} onClose={() => setAnalyticsItem(null)} />}
    </div>
  );
}
