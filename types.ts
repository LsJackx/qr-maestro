
export type QRCodeLevel = 'L' | 'M' | 'Q' | 'H';

export type ContentType = 'URL' | 'WIFI' | 'VIDEO' | 'LOCATION' | 'VCARD' | 'TEXT';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export type FrameFont = 'sans' | 'serif' | 'mono' | 'display' | 'handwriting';

export type FrameCategory = 
  | 'all'
  | 'standard' 
  | 'professions' 
  | 'love' 
  | 'events' 
  | 'business' 
  | 'hospitality' 
  | 'nature' 
  | 'creative' 
  | 'custom';

export interface QRFrame {
  id: string;
  name: string;
  description?: string;
  category?: FrameCategory;
  viewBox: string;
  qrSize: number; // Size of the inner QR relative to viewBox
  qrX: number; // X position
  qrY: number; // Y position
  hasText?: boolean;
  defaultText?: string;
  textPosition?: 'bottom' | 'top' | 'none';
  borderRadius?: number;
  badgeStyle?: 'banner' | 'pill' | 'bubble' | 'phone' | 'polaroid' | 'clipboard' | 'tag' | 'circle' | 'brackets' | 'none' | 'ribbon' | 'ticket';
  
  // Custom Frame & Thematic Silhouettes (Admin Studio)
  isCustom?: boolean;
  createdBy?: string;
  createdAt?: number;
  silhouetteShape?: 'square' | 'rounded' | 'heart' | 'envelope' | 'ticket' | 'shopping_bag' | 'parchment' | 'cocktail' | 'oriental_arch' | 'rosette' | 'phone' | 'chat_bubble' | 'clipboard' | 'tech_hud';
  topIcon?: string; // Emoji, SVG icon symbol, or label (e.g. 👷‍♂️, 🎂, 💖, 🍸, 🛍️, 🌸, ☕)
  topIconLabel?: string;
  topBadgeBg?: string;
  cornerStyle?: 'none' | 'flowers' | 'pine_holly' | 'autumn_leaves' | 'confetti' | 'arrows' | 'hearts' | 'lanterns' | 'stars' | 'tech_hud' | 'cocktail_lime';
  bottomStyle?: 'none' | 'hanging_hearts' | 'quill_ink' | 'gift_ribbon' | 'flower_garland' | 'banner' | 'pill';
  themeColor?: string;
  accentColor?: string;
  customSvgMarkup?: string;
}

export interface QRCodeConfig {
  value: string; // Lo que el QR escanea (en Dinámico es la URL corta)
  targetContent?: string; // El destino final real (URL real, WiFi string, etc)
  
  // Visuals
  fgColor: string;
  bgColor: string;
  level: QRCodeLevel;
  size: number;
  includeMargin: boolean;
  frameId: string;
  
  // Frame customization (estilo QR.io)
  frameText?: string;
  frameTextColor?: string;
  frameColor?: string;
  frameFont?: FrameFont;
  
  // Logo
  logoUrl?: string;
  logoSize?: number; // Represented as percentage: 15 to 35 (default: 22)
  logoBackground?: boolean; // Circular/Rounded white background behind logo
  
  // Text & Card mode (Tarjeta informativa adicional)
  showCard?: boolean;
  cardPosition?: 'bottom' | 'top' | 'right' | 'left' | 'flyer';
  cardTitle?: string;
  cardSubtitle?: string;
  cardInstructions?: string;
  cardCta?: string;
  cardBgColor?: string;
  cardTextColor?: string;

  contentType: ContentType;
  
  // Specific fields for form restoration
  wifiSsid?: string;
  wifiPass?: string;
  wifiHidden?: boolean;
  locationLat?: string;
  locationLon?: string;
  vcardName?: string;
  vcardPhone?: string;
  vcardEmail?: string;

  // Dynamic QR / Smart QR Fields & Landing Customization
  isDynamic: boolean;
  title?: string; // Título o nombre asignado al QR
  dynamicTitle?: string;
  dynamicDescription?: string;
  dynamicButtonText?: string;
  dynamicImageUrl?: string;
  shortId?: string; // ID único para la base de datos
  
  // Landing Page Detailed Customization
  landingLogoUrl?: string; // Logo específico para la landing
  landingThemeColor?: string; // Color primario de marca / botones / header
  landingBgColor?: string; // Fondo de la landing page
  landingTextColor?: string; // Color de texto
  landingExtraNotes?: string; // Zona de texto adicional / horarios / promos / disclaimer
  landingWhatsapp?: string; // Enlace directo a WhatsApp
  landingInstagram?: string; // Usuario / Link de Instagram
  landingPhone?: string; // Botón de llamada directa
  landingWebsite?: string; // Botón de sitio web adicional
  
  // Restrictions / Life Cycle
  expiryDate?: string; // ISO String
  scanLimit?: number; // Max number of scans
  passwordProtected?: boolean;
  password?: string;
  
  // Dynamic QR Modifications & Analytics tracking
  editCount?: number;
  editHistory?: {
    timestamp: number;
    targetContent?: string;
    note?: string;
  }[];
  
  // Metadata
  ownerId?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface HistoryItem extends QRCodeConfig {
  id: string; // Local/History ID
  createdAt: number; // Ensure compatibility
  title: string;
}

export interface ScanEvent {
  id?: string;
  qrId: string;
  timestamp: number;
  os: string;
  browser: string;
  device: 'Mobile' | 'Desktop' | 'Tablet';
  country?: string;
  city?: string;
}

export interface ClickEvent {
  id?: string;
  qrId: string;
  timestamp: number;
  actionType: 'primary_button' | 'whatsapp' | 'instagram' | 'phone' | 'website' | 'direct_redirect';
  targetUrl?: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type QRFormat = 'SVG' | 'PNG' | 'PDF' | 'EPS';
