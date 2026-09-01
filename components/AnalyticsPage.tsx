import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart3, 
  ArrowLeft, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Layers, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  MousePointerClick, 
  Edit3, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Globe, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  Search, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Share2,
  Eye,
  Sliders,
  History,
  QrCode
} from 'lucide-react';
import { HistoryItem, QRCodeConfig, ScanEvent, ClickEvent } from '../types';
import { 
  subscribeToAnalytics, 
  subscribeToClicks, 
  subscribeToAllQRsAnalytics 
} from '../services/firebase';
import { 
  downloadAnalyticsReportPDF, 
  downloadCSV, 
  downloadQRPDF, 
  downloadEPS, 
  downloadSVG, 
  downloadPNG 
} from '../utils/download';

interface AnalyticsPageProps {
  initialQr: HistoryItem | null;
  allQrs: HistoryItem[];
  onBack: () => void;
  onSelectQrForEdit: (qr: HistoryItem) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

type DateRange = '24H' | '7D' | '30D' | '90D' | 'ALL';

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  initialQr,
  allQrs,
  onBack,
  onSelectQrForEdit,
  darkMode,
  onToggleDarkMode
}) => {
  // Selected QR or "ALL" for global overview
  const [selectedQrId, setSelectedQrId] = useState<string>(() => {
    if (initialQr) return initialQr.shortId || initialQr.id;
    if (allQrs.length > 0) return allQrs[0].shortId || allQrs[0].id;
    return 'ALL';
  });

  const [dateRange, setDateRange] = useState<DateRange>('30D');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AUDIENCE' | 'CHANGELOG' | 'LOGS'>('OVERVIEW');
  const [searchTerm, setSearchTerm] = useState('');
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Raw data collections
  const [scans, setScans] = useState<ScanEvent[]>([]);
  const [clicks, setClicks] = useState<ClickEvent[]>([]);
  const [multiScans, setMultiScans] = useState<Record<string, ScanEvent[]>>({});
  const [multiClicks, setMultiClicks] = useState<Record<string, ClickEvent[]>>({});
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Current active QR object
  const currentQr = useMemo(() => {
    if (selectedQrId === 'ALL') return null;
    return allQrs.find(q => (q.shortId || q.id) === selectedQrId) || initialQr;
  }, [selectedQrId, allQrs, initialQr]);

  // Data Subscription Effect
  useEffect(() => {
    setLoading(true);

    if (selectedQrId === 'ALL') {
      // Global Overview
      const unsub = subscribeToAllQRsAnalytics(allQrs, (data) => {
        setMultiScans(data.scansByQr);
        setMultiClicks(data.clicksByQr);
        setLoading(false);
        setLastRefreshed(new Date());
      });
      return () => unsub();
    } else {
      // Single QR Overview
      const unsubScans = subscribeToAnalytics(selectedQrId, (data) => {
        setScans(data);
        setLoading(false);
        setLastRefreshed(new Date());
      });

      const unsubClicks = subscribeToClicks(selectedQrId, (data) => {
        setClicks(data);
      });

      return () => {
        unsubScans();
        unsubClicks();
      };
    }
  }, [selectedQrId, allQrs]);

  // Consolidated Scans and Clicks based on selection
  const consolidatedScans = useMemo(() => {
    if (selectedQrId === 'ALL') {
      return Object.values(multiScans).flat().sort((a, b) => b.timestamp - a.timestamp);
    }
    return scans;
  }, [selectedQrId, scans, multiScans]);

  const consolidatedClicks = useMemo(() => {
    if (selectedQrId === 'ALL') {
      return Object.values(multiClicks).flat().sort((a, b) => b.timestamp - a.timestamp);
    }
    return clicks;
  }, [selectedQrId, clicks, multiClicks]);

  // Filtered by selected Date Range
  const filteredScans = useMemo(() => {
    const now = Date.now();
    let threshold = 0;
    if (dateRange === '24H') threshold = now - 24 * 60 * 60 * 1000;
    else if (dateRange === '7D') threshold = now - 7 * 24 * 60 * 60 * 1000;
    else if (dateRange === '30D') threshold = now - 30 * 24 * 60 * 60 * 1000;
    else if (dateRange === '90D') threshold = now - 90 * 24 * 60 * 60 * 1000;

    return consolidatedScans.filter(s => s.timestamp >= threshold);
  }, [consolidatedScans, dateRange]);

  const filteredClicks = useMemo(() => {
    const now = Date.now();
    let threshold = 0;
    if (dateRange === '24H') threshold = now - 24 * 60 * 60 * 1000;
    else if (dateRange === '7D') threshold = now - 7 * 24 * 60 * 60 * 1000;
    else if (dateRange === '30D') threshold = now - 30 * 24 * 60 * 60 * 1000;
    else if (dateRange === '90D') threshold = now - 90 * 24 * 60 * 60 * 1000;

    return consolidatedClicks.filter(c => c.timestamp >= threshold);
  }, [consolidatedClicks, dateRange]);

  // --- ADVANCED METRICS CALCULATIONS ---

  // 1. Month-over-Month Comparison
  const monthMetrics = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth();

    let curScans = 0;
    let prvScans = 0;

    consolidatedScans.forEach(s => {
      const d = new Date(s.timestamp);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        curScans++;
      } else if (d.getFullYear() === prevYear && d.getMonth() === prevMonth) {
        prvScans++;
      }
    });

    let growthPct = 0;
    if (prvScans > 0) {
      growthPct = Math.round(((curScans - prvScans) / prvScans) * 100);
    } else if (curScans > 0) {
      growthPct = 100;
    }

    return {
      currentMonthScans: curScans,
      prevMonthScans: prvScans,
      growthPct
    };
  }, [consolidatedScans]);

  // 2. CTR & Conversions
  const ctrMetrics = useMemo(() => {
    const totalScans = filteredScans.length;
    const totalClicks = filteredClicks.length;
    const ctrRate = totalScans > 0 ? ((totalClicks / totalScans) * 100) : 0;

    return {
      totalScans,
      totalClicks,
      ctrRate: Math.min(ctrRate, 100)
    };
  }, [filteredScans, filteredClicks]);

  // 3. Edit Count & Changelog info
  const editInfo = useMemo(() => {
    if (currentQr) {
      return {
        editCount: currentQr.editCount || 0,
        editHistory: currentQr.editHistory || [],
        createdAt: currentQr.createdAt || Date.now(),
        updatedAt: currentQr.updatedAt || currentQr.createdAt || Date.now()
      };
    }
    // Global aggregate edits
    const totalEdits = allQrs.reduce((acc, q) => acc + (q.editCount || 0), 0);
    return {
      editCount: totalEdits,
      editHistory: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }, [currentQr, allQrs]);

  // 4. Technology & Geography Breakdown
  const techBreakdown = useMemo(() => {
    const osMap: Record<string, number> = {};
    const devMap: Record<string, number> = { Mobile: 0, Desktop: 0, Tablet: 0 };
    const browserMap: Record<string, number> = {};
    const countryMap: Record<string, { count: number; cities: Record<string, number> }> = {};

    filteredScans.forEach(s => {
      // OS
      const os = s.os || 'Otros';
      osMap[os] = (osMap[os] || 0) + 1;

      // Device
      const dev = s.device || 'Mobile';
      devMap[dev] = (devMap[dev] || 0) + 1;

      // Browser
      const br = s.browser || 'Otros';
      browserMap[br] = (browserMap[br] || 0) + 1;

      // Geography
      const country = s.country && s.country !== 'Desconocido' ? s.country : 'Ubicación Anónima';
      const city = s.city && s.city !== 'Desconocido' ? s.city : 'Directo';

      if (!countryMap[country]) {
        countryMap[country] = { count: 0, cities: {} };
      }
      countryMap[country].count++;
      countryMap[country].cities[city] = (countryMap[country].cities[city] || 0) + 1;
    });

    const sortedCountries = Object.entries(countryMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);

    return {
      os: Object.entries(osMap).sort((a, b) => b[1] - a[1]),
      devices: devMap,
      browsers: Object.entries(browserMap).sort((a, b) => b[1] - a[1]),
      countries: sortedCountries
    };
  }, [filteredScans]);

  // 5. Hourly Activity Distribution (Heatmap Peak Hours)
  const hourlyActivity = useMemo(() => {
    const hours = new Array(24).fill(0);
    filteredScans.forEach(s => {
      const h = new Date(s.timestamp).getHours();
      hours[h]++;
    });

    const maxHour = Math.max(...hours, 1);
    const morning = hours.slice(6, 12).reduce((a, b) => a + b, 0);
    const afternoon = hours.slice(12, 18).reduce((a, b) => a + b, 0);
    const evening = hours.slice(18, 24).reduce((a, b) => a + b, 0);
    const night = hours.slice(0, 6).reduce((a, b) => a + b, 0);

    return {
      hours,
      maxHour,
      periods: { morning, afternoon, evening, night }
    };
  }, [filteredScans]);

  // 6. Timeline Series Chart Calculation
  const timelineSeries = useMemo(() => {
    const daysCount = dateRange === '24H' ? 24 : dateRange === '7D' ? 7 : dateRange === '30D' ? 30 : 14;
    const labels: string[] = [];
    const scanCounts: number[] = [];
    const clickCounts: number[] = [];

    if (dateRange === '24H') {
      const now = new Date();
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        const label = `${d.getHours().toString().padStart(2, '0')}:00`;
        labels.push(label);

        const hStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0, 0).getTime();
        const hEnd = hStart + 60 * 60 * 1000;

        const sCnt = filteredScans.filter(s => s.timestamp >= hStart && s.timestamp < hEnd).length;
        const cCnt = filteredClicks.filter(c => c.timestamp >= hStart && c.timestamp < hEnd).length;
        scanCounts.push(sCnt);
        clickCounts.push(cCnt);
      }
    } else {
      const days = dateRange === '7D' ? 7 : dateRange === '30D' ? 14 : 14;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        labels.push(label);

        const dayStr = d.toDateString();
        const sCnt = filteredScans.filter(s => new Date(s.timestamp).toDateString() === dayStr).length;
        const cCnt = filteredClicks.filter(c => new Date(c.timestamp).toDateString() === dayStr).length;
        scanCounts.push(sCnt);
        clickCounts.push(cCnt);
      }
    }

    const maxVal = Math.max(...scanCounts, ...clickCounts, 1);
    
    // Polyline points
    const scanPoints = scanCounts.map((val, idx) => {
      const denom = labels.length > 1 ? labels.length - 1 : 1;
      const x = (idx / denom) * 100;
      const y = 90 - (val / maxVal) * 75;
      return `${x},${y}`;
    }).join(' ');

    const clickPoints = clickCounts.map((val, idx) => {
      const denom = labels.length > 1 ? labels.length - 1 : 1;
      const x = (idx / denom) * 100;
      const y = 90 - (val / maxVal) * 75;
      return `${x},${y}`;
    }).join(' ');

    return {
      labels,
      scanCounts,
      clickCounts,
      scanPoints,
      clickPoints,
      maxVal
    };
  }, [dateRange, filteredScans, filteredClicks]);

  // Handle Export Operations
  const handleExportPDFReport = () => {
    const qrObj: QRCodeConfig = currentQr || {
      isDynamic: true,
      title: "Resumen Consolidado Global",
      targetContent: "Todos los códigos QR del usuario",
      value: "global_account_report",
      createdAt: Date.now()
    } as any;

    downloadAnalyticsReportPDF(
      qrObj,
      filteredScans,
      filteredClicks,
      {
        totalScans: filteredScans.length,
        currentMonthScans: monthMetrics.currentMonthScans,
        prevMonthScans: monthMetrics.prevMonthScans,
        monthGrowthPct: monthMetrics.growthPct,
        totalClicks: filteredClicks.length,
        ctrRate: ctrMetrics.ctrRate,
        editCount: editInfo.editCount,
        topCountry: techBreakdown.countries[0]?.name || 'N/A',
        topDevice: Object.entries(techBreakdown.devices).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mobile'
      }
    );
    setExportDropdownOpen(false);
  };

  const handleExportCSV = () => {
    const title = currentQr ? (currentQr.dynamicTitle || currentQr.title || 'codigo_qr') : 'resumen_global';
    downloadCSV(title, filteredScans, filteredClicks);
    setExportDropdownOpen(false);
  };

  // Search filtered event logs
  const searchedLogs = useMemo(() => {
    if (!searchTerm.trim()) return filteredScans;
    const term = searchTerm.toLowerCase();
    return filteredScans.filter(s => 
      (s.country && s.country.toLowerCase().includes(term)) ||
      (s.city && s.city.toLowerCase().includes(term)) ||
      (s.os && s.os.toLowerCase().includes(term)) ||
      (s.browser && s.browser.toLowerCase().includes(term)) ||
      (s.device && s.device.toLowerCase().includes(term))
    );
  }, [filteredScans, searchTerm]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans flex flex-col`}>
      
      {/* TOP APPLICATION NAVBAR */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-all shadow-xs active:scale-95"
            title="Volver al Generador de Códigos QR"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Volver al Generador</span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-xl shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight leading-none text-slate-900 dark:text-white">
                  Centro de Analítica Pro
                </h1>
                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  En Vivo
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Métricas de escaneo, tasas de clic (CTR) y rendimiento en tiempo real
              </p>
            </div>
          </div>
        </div>

        {/* QR SWITCHER & EXPORT ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* QR Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedQrId}
              onChange={(e) => setSelectedQrId(e.target.value)}
              className="appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold py-2 pl-3 pr-8 rounded-xl cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[170px] sm:max-w-[240px] truncate"
            >
              <option value="ALL">🌐 Todos los Códigos QR (Global)</option>
              {allQrs.map((q) => (
                <option key={q.shortId || q.id} value={q.shortId || q.id}>
                  {q.isDynamic ? '⚡ ' : '⬛ '} {q.dynamicTitle || q.title || `QR (${(q.shortId || q.id).slice(0, 6)})`}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick Edit Target if single QR */}
          {currentQr && (
            <button
              onClick={() => onSelectQrForEdit(currentQr)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Editar destino o diseño de este QR Dinámico"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar QR</span>
            </button>
          )}

          {/* EXPORT MENU */}
          <div className="relative">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-sm shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar Reportes</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            </button>

            {exportDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setExportDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Opciones de Descarga</p>
                </div>

                <div className="space-y-1 pt-1">
                  <button
                    onClick={handleExportPDFReport}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-red-500" />
                    <div>
                      <p>Reporte Ejecutivo en PDF</p>
                      <p className="text-[10px] font-normal text-slate-400">Resumen con gráficas, KPIs y tablas</p>
                    </div>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p>Exportar Datos a Excel (CSV)</p>
                      <p className="text-[10px] font-normal text-slate-400">Historial completo con timestamps</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* DASHBOARD BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* HERO / OVERVIEW BANNER */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-indigo-200 text-xs font-bold tracking-wide uppercase">
                  {selectedQrId === 'ALL' ? 'Cuenta Completa' : currentQr?.isDynamic ? 'QR Dinámico Inteligente' : 'QR Estático'}
                </span>
                {currentQr?.shortId && (
                  <span className="text-xs text-white/60 font-mono">ID: {currentQr.shortId}</span>
                )}
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {selectedQrId === 'ALL' 
                  ? 'Panel Consolidado de Rendimiento' 
                  : (currentQr?.dynamicTitle || currentQr?.title || 'Código QR Seleccionado')}
              </h2>
              
              <p className="text-sm text-indigo-200/80 leading-relaxed">
                {selectedQrId === 'ALL'
                  ? `Monitoreando ${allQrs.length} códigos QR activos simultáneamente en tu cuenta.`
                  : (currentQr?.dynamicDescription || (currentQr?.targetContent ? `Destino actual: ${currentQr.targetContent}` : 'Monitoreo de tráfico en vivo.'))}
              </p>
            </div>

            {/* DATE RANGE TOGGLES */}
            <div className="flex flex-wrap items-center gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 self-start md:self-auto">
              {(['24H', '7D', '30D', '90D', 'ALL'] as DateRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    dateRange === range
                      ? 'bg-white text-indigo-950 shadow-md scale-102'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {range === '24H' && '24 Horas'}
                  {range === '7D' && '7 Días'}
                  {range === '30D' && '30 Días'}
                  {range === '90D' && '90 Días'}
                  {range === 'ALL' && 'Todo'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 ADVANCED KPI TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* TILE 1: TOTAL SCANS WITH MOM COMPARISON */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Escaneos</span>
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <QrCode className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {filteredScans.length.toLocaleString('es-ES')}
              </div>

              {/* Month-over-Month Growth Badge */}
              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                  monthMetrics.growthPct >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}>
                  {monthMetrics.growthPct >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  )}
                  {monthMetrics.growthPct >= 0 ? `+${monthMetrics.growthPct}%` : `${monthMetrics.growthPct}%`}
                </span>
                <span className="text-[11px] text-slate-400">vs mes anterior ({monthMetrics.prevMonthScans})</span>
              </div>
            </div>
          </div>

          {/* TILE 2: CLICKS & CONVERSION RATE (CTR) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-emerald-300 dark:hover:border-emerald-800 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Clics y Conversión (CTR)</span>
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <MousePointerClick className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {ctrMetrics.totalClicks.toLocaleString('es-ES')}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg">
                  {ctrMetrics.ctrRate.toFixed(1)}% CTR
                </span>
              </div>

              <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{ctrMetrics.totalClicks} usuarios interactuaron con el botón / enlaces</span>
              </div>
            </div>
          </div>

          {/* TILE 3: COMPARISON CURRENT VS PREVIOUS MONTH */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-amber-300 dark:hover:border-amber-800 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Este Mes vs Anterior</span>
              <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {monthMetrics.currentMonthScans}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Este Mes</span>
                </div>
                <div className="text-right">
                  <span className="text-lg sm:text-xl font-bold text-slate-500 dark:text-slate-400">
                    {monthMetrics.prevMonthScans}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Mes Anterior</span>
                </div>
              </div>

              {/* Progress bar visual comparison */}
              <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all" 
                  style={{ 
                    width: `${monthMetrics.currentMonthScans + monthMetrics.prevMonthScans > 0 
                      ? (monthMetrics.currentMonthScans / (monthMetrics.currentMonthScans + monthMetrics.prevMonthScans)) * 100 
                      : 50}%` 
                  }} 
                />
              </div>
            </div>
          </div>

          {/* TILE 4: DYNAMIC QR EDITIONS & HISTORY */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-purple-300 dark:hover:border-purple-800 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ediciones Dinámicas</span>
              <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Edit3 className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {editInfo.editCount} <span className="text-sm font-semibold text-slate-400">veces</span>
              </div>

              <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-purple-500" />
                <span>Última modificación: {new Date(editInfo.updatedAt).toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
          {[
            { id: 'OVERVIEW', label: 'Evolución y Actividad', icon: TrendingUp },
            { id: 'AUDIENCE', label: 'Dispositivos y Geografía', icon: Globe },
            { id: 'CHANGELOG', label: `Historial de Edición (${editInfo.editHistory.length || editInfo.editCount})`, icon: History },
            { id: 'LOGS', label: `Registros en Vivo (${filteredScans.length})`, icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-3.5 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & EVOLUTION CHART */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            
            {/* Timeline Evolution Interactive Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    Evolución Temporal de Escaneos y Clics
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Comparación diaria del volumen de escaneos QR versus clics de conversión
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span>
                    <span>Escaneos QR</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                    <span>Clics (CTR)</span>
                  </div>
                </div>
              </div>

              {/* Chart SVG Visualization */}
              <div className="h-64 w-full relative pt-4 pb-8 flex flex-col justify-between">
                
                {filteredScans.length === 0 ? (
                  <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <QrCode className="w-10 h-10 text-slate-400 mb-2 opacity-50" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Aún no hay escaneos registrados en este período</p>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">Comparte o imprime tu código QR para comenzar a recopilar métricas de tráfico en tiempo real.</p>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex flex-col justify-end">
                    
                    {/* SVG Graphic with Area Gradient */}
                    <svg className="w-full h-44 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Area Fills */}
                      <polygon 
                        points={`0,90 ${timelineSeries.scanPoints} 100,90`} 
                        fill="url(#scanGradient)" 
                      />

                      {/* Scan Line */}
                      <polyline
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={timelineSeries.scanPoints}
                      />

                      {/* Click Line */}
                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={timelineSeries.clickPoints}
                      />
                    </svg>

                    {/* X-Axis Labels */}
                    <div className="flex justify-between w-full mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {timelineSeries.labels.map((lbl, idx) => (
                        <span key={idx} className="truncate text-center">
                          {lbl}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Peak Hours Heatmap & Time of Day */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Day Distribution Breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-1 space-y-4">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    Franjas Horarias de Mayor Tráfico
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Distribución de escaneos según la hora del día</p>
                </div>

                <div className="space-y-3 pt-2">
                  {[
                    { label: 'Mañana (06:00 - 12:00)', count: hourlyActivity.periods.morning, color: 'bg-amber-500' },
                    { label: 'Tarde (12:00 - 18:00)', count: hourlyActivity.periods.afternoon, color: 'bg-indigo-600' },
                    { label: 'Noche (18:00 - 24:00)', count: hourlyActivity.periods.evening, color: 'bg-purple-600' },
                    { label: 'Madrugada (00:00 - 06:00)', count: hourlyActivity.periods.night, color: 'bg-slate-600' }
                  ].map((p, i) => {
                    const pct = filteredScans.length > 0 ? ((p.count / filteredScans.length) * 100).toFixed(1) : "0";
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700 dark:text-slate-300">{p.label}</span>
                          <span className="text-slate-900 dark:text-white font-bold">{p.count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className={`${p.color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 24-Hour Column Histogram */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-2 space-y-4">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-500" />
                    Histograma de Horas Pico (00:00 a 23:00)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Identifica la hora exacta con mayor respuesta de tu audiencia</p>
                </div>

                <div className="h-40 flex items-end gap-1 sm:gap-2 pt-6">
                  {hourlyActivity.hours.map((cnt, hour) => {
                    const heightPct = (cnt / hourlyActivity.maxHour) * 100;
                    return (
                      <div key={hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded font-bold pointer-events-none whitespace-nowrap z-20">
                          {hour}:00 • {cnt} escaneos
                        </div>
                        <div 
                          className="w-full bg-indigo-200 dark:bg-indigo-950 group-hover:bg-indigo-600 transition-colors rounded-t-sm"
                          style={{ height: `${Math.max(heightPct, 4)}%` }}
                        />
                        <span className="text-[9px] text-slate-400 font-mono scale-90 sm:scale-100">
                          {hour % 3 === 0 ? `${hour}h` : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: AUDIENCE & GEOGRAPHY */}
        {activeTab === 'AUDIENCE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Devices Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-500" />
                Dispositivos de Acceso
              </h4>
              <div className="space-y-4 pt-2">
                {[
                  { label: 'Teléfonos Móviles', key: 'Mobile', icon: Smartphone, count: techBreakdown.devices.Mobile, color: 'bg-indigo-600' },
                  { label: 'Computadoras (Desktop)', key: 'Desktop', icon: Laptop, count: techBreakdown.devices.Desktop, color: 'bg-blue-600' },
                  { label: 'Tablets / iPads', key: 'Tablet', icon: Tablet, count: techBreakdown.devices.Tablet, color: 'bg-purple-600' }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  const pct = filteredScans.length > 0 ? ((item.count / filteredScans.length) * 100).toFixed(1) : "0";
                  return (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                          <Icon className="w-4 h-4 text-slate-400" />
                          {item.label}
                        </span>
                        <span className="font-mono">{item.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className={`${item.color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Operating Systems */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                Sistemas Operativos (OS)
              </h4>
              <div className="space-y-3 pt-2">
                {techBreakdown.os.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Sin datos registrados</p>
                ) : (
                  techBreakdown.os.slice(0, 5).map(([osName, count], idx) => {
                    const pct = filteredScans.length > 0 ? ((count / filteredScans.length) * 100).toFixed(1) : "0";
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700 dark:text-slate-300">{osName}</span>
                          <span className="text-slate-900 dark:text-white font-bold">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Geography / Locations */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                Top Países y Ciudades
              </h4>
              <div className="space-y-3 pt-2">
                {techBreakdown.countries.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Sin ubicaciones registradas</p>
                ) : (
                  techBreakdown.countries.slice(0, 5).map((loc, idx) => {
                    const pct = filteredScans.length > 0 ? ((loc.count / filteredScans.length) * 100).toFixed(1) : "0";
                    const topCity = Object.entries(loc.cities).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General';
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                            {loc.name} <span className="text-[10px] text-slate-400">({topCity})</span>
                          </span>
                          <span className="text-slate-900 dark:text-white font-bold">{loc.count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: DYNAMIC QR CHANGELOG & EDITS */}
        {activeTab === 'CHANGELOG' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-500" />
                  Historial de Ediciones y Modificaciones del QR
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Registro de cada vez que se cambió el enlace de destino o el diseño sin alterar el código impreso
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold">
                {editInfo.editCount} {editInfo.editCount === 1 ? 'Modificación Registrada' : 'Modificaciones Registradas'}
              </div>
            </div>

            {/* Timeline of edits */}
            <div className="space-y-4">
              {/* Current Version */}
              <div className="flex gap-4 items-start p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Versión Actual Activa</span>
                    <span className="text-xs text-slate-400 font-mono">Última actualización: {new Date(editInfo.updatedAt).toLocaleString('es-ES')}</span>
                  </div>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {currentQr?.dynamicTitle || currentQr?.title || 'Código QR'}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-mono break-all bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 mt-2">
                    Destino: {currentQr?.targetContent || currentQr?.value || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Historic edits */}
              {editInfo.editHistory.length > 0 ? (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {editInfo.editHistory.map((item, idx) => (
                    <div key={idx} className="relative flex gap-3 items-start">
                      <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-purple-500 border-2 border-white dark:border-slate-900"></div>
                      <div className="flex-1 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {item.note || `Modificación de Destino`}
                          </span>
                          <span className="text-slate-400 font-mono">
                            {new Date(item.timestamp).toLocaleString('es-ES')}
                          </span>
                        </div>
                        {item.targetContent && (
                          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 break-all bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                            Destino previo: {item.targetContent}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Este código QR se mantiene con su configuración inicial original. Cada vez que edites su destino, quedará registrado automáticamente aquí.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: LIVE SCANS STREAM & SEARCH TABLE */}
        {activeTab === 'LOGS' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  Registro Detallado de Escaneos en Vivo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Lista en tiempo real con fecha, hora, ubicación geográfica y navegador
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar país, dispositivo, S.O..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Ubicación</th>
                    <th className="py-3 px-4">Dispositivo</th>
                    <th className="py-3 px-4">Sistema Operativo</th>
                    <th className="py-3 px-4">Navegador</th>
                    <th className="py-3 px-4 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {searchedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No se encontraron registros que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    searchedLogs.slice(0, 50).map((log, idx) => (
                      <tr key={log.id || idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('es-ES', {
                            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {log.city && log.city !== 'Desconocido' ? `${log.city}, ` : ''}{log.country || 'Anónimo'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
                            {log.device === 'Mobile' && <Smartphone className="w-3 h-3 text-indigo-500" />}
                            {log.device === 'Desktop' && <Laptop className="w-3 h-3 text-blue-500" />}
                            {log.device === 'Tablet' && <Tablet className="w-3 h-3 text-purple-500" />}
                            {log.device || 'Mobile'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {log.os || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {log.browser || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Completado
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {searchedLogs.length > 50 && (
              <p className="text-center text-xs text-slate-400">
                Mostrando los 50 eventos más recientes. Para exportar la totalidad de registros, utiliza la opción "Exportar a Excel (CSV)".
              </p>
            )}
          </div>
        )}

      </main>
    </div>
  );
};
