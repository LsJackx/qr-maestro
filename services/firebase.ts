
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot 
} from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from "firebase/auth";
import { QRCodeConfig, HistoryItem, ScanEvent, ClickEvent } from "../types";
import configJson from "../firebase-applet-config.json";

// Use environment variables if present (for Vercel / production), or fallback to firebase-applet-config.json
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || configJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || configJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || configJson.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || configJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || configJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || configJson.appId
};

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || configJson.firestoreDatabaseId;

// Initialize Firebase App and Firestore Database instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = (firestoreDatabaseId && firestoreDatabaseId !== "(default)")
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);

// Collection name constants
const COLLECTION_NAME = "neoqr_codes";

// --- AUTHENTICATION SERVICES ---

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error Google Login:", error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
    return userCredential.user;
  } catch (error) {
    console.error("Error Register:", error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  } catch (error) {
    console.error("Error Login:", error);
    throw error;
  }
};

export const logoutFirebase = async () => {
  await signOut(auth);
};

export const getAuthErrorMessage = (error: any): string => {
  const code = error?.code || "";
  switch (code) {
    case 'auth/email-already-in-use': return 'Este correo ya está registrado.';
    case 'auth/invalid-email': return 'El correo electrónico no es válido.';
    case 'auth/weak-password': return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/user-not-found': return 'No existe cuenta con este correo.';
    case 'auth/wrong-password': return 'Contraseña incorrecta.';
    case 'auth/popup-closed-by-user': return 'Se canceló el inicio de sesión.';
    case 'auth/invalid-credential': return 'Credenciales inválidas.';
    case 'auth/unauthorized-domain': return 'Dominio no autorizado en Firebase Auth.';
    case 'auth/operation-not-allowed': return 'El método de acceso no está habilitado.';
    default: return `Error de autenticación: ${code || error?.message || 'Desconocido'}`;
  }
};

// --- FIRESTORE PERSISTENCE SERVICES ---

const cleanData = (data: any) => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
};

/**
 * Saves a QR code to Firestore (both dynamic and static QR codes).
 */
export const saveQRToFirebase = async (config: QRCodeConfig | HistoryItem, ownerId?: string): Promise<string> => {
  const docId = config.shortId || (config as any).id || crypto.randomUUID();
  
  // Check if document already exists to track edit counts and edit history
  let existingEditCount = (config as any).editCount || 0;
  let existingHistory = (config as any).editHistory || [];
  let originalCreatedAt = config.createdAt || Date.now();

  try {
    const docRef = doc(db, COLLECTION_NAME, docId);
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      const existingData = existingSnap.data() as QRCodeConfig;
      originalCreatedAt = existingData.createdAt || originalCreatedAt;
      existingEditCount = (existingData.editCount || 0) + 1;
      existingHistory = existingData.editHistory || [];
      
      // Append new edit record
      existingHistory.unshift({
        timestamp: Date.now(),
        targetContent: config.targetContent || config.value || '',
        note: `Modificación #${existingEditCount}: Destino actualizado a ${config.targetContent || config.value || 'nuevo contenido'}`
      });
      // Limit history to last 20 edits
      if (existingHistory.length > 20) {
        existingHistory = existingHistory.slice(0, 20);
      }
    }
  } catch (e) {
    console.warn("Could not check existing QR version:", e);
  }

  const dataToSave = cleanData({
    ...config,
    shortId: docId,
    id: docId,
    ownerId: ownerId || config.ownerId || auth.currentUser?.uid || 'anonymous',
    editCount: existingEditCount,
    editHistory: existingHistory,
    updatedAt: Date.now(),
    createdAt: originalCreatedAt
  });

  try {
    await setDoc(doc(db, COLLECTION_NAME, docId), dataToSave, { merge: true });
    return docId;
  } catch (error) {
    console.error("Error saving QR to Firebase:", error);
    throw error;
  }
};

/**
 * Fetches a single QR by shortId or doc ID from Firestore.
 */
export const getQRFromFirebase = async (shortId: string): Promise<QRCodeConfig | null> => {
  try {
    if (!shortId) return null;
    const docRef = doc(db, COLLECTION_NAME, shortId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as QRCodeConfig;
    }
    return null;
  } catch (error) {
    console.error("Error fetching QR from Firebase:", error);
    return null;
  }
};

/**
 * Deletes a QR code from Firestore.
 */
export const deleteQRFromFirebase = async (shortId: string): Promise<boolean> => {
  try {
    if (!shortId) return false;
    const docRef = doc(db, COLLECTION_NAME, shortId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting QR from Firebase:", error);
    return false;
  }
};

/**
 * Fetches all QR codes belonging to a specific user.
 */
export const getUserQRsFromFirebase = async (userId: string): Promise<HistoryItem[]> => {
  try {
    if (!userId) return [];
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('ownerId', '==', userId), 
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HistoryItem));
  } catch (error) {
    console.error("Error getting user QRs:", error);
    return [];
  }
};

/**
 * Subscribes to real-time updates for a user's QR codes.
 */
export const subscribeToUserQRs = (userId: string, callback: (items: HistoryItem[]) => void) => {
  try {
    if (!userId) {
      callback([]);
      return () => {};
    }
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('ownerId', '==', userId), 
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HistoryItem));
      callback(items);
    }, (err) => {
      console.warn("Snapshot listener fallback:", err);
    });
  } catch (error) {
    console.error("Error subscribing to user QRs:", error);
    return () => {};
  }
};

// --- ANALYTICS SERVICES ---

/**
 * Records a scan event in Firestore subcollection
 */
export const recordScan = async (qrId: string) => {
  try {
    const ua = navigator.userAgent;
    let os = 'Unknown';
    if (ua.indexOf("Win") !== -1) os = "Windows";
    if (ua.indexOf("Mac") !== -1) os = "MacOS";
    if (ua.indexOf("Linux") !== -1) os = "Linux";
    if (ua.indexOf("Android") !== -1) os = "Android";
    if (ua.indexOf("like Mac") !== -1) os = "iOS";

    let device: 'Mobile' | 'Desktop' | 'Tablet' = 'Desktop';
    if (/Mobi|Android/i.test(ua)) device = 'Mobile';
    if (/Tablet|iPad/i.test(ua)) device = 'Tablet';

    let country = 'Desconocido';
    let city = 'Desconocido';

    try {
      const geoRes = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(2500) });
      if (geoRes.ok) {
        const geoJson = await geoRes.json();
        if (geoJson.success) {
          country = geoJson.country || country;
          city = geoJson.city || city;
        }
      }
    } catch {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz) {
          const parts = tz.split('/');
          if (parts.length > 1) {
            city = parts[1].replace(/_/g, ' ');
            country = parts[0];
          }
        }
      } catch {}
    }

    const scanData: ScanEvent = {
      qrId,
      timestamp: Date.now(),
      os,
      browser: getBrowserName(ua),
      device,
      country,
      city
    };

    const scansRef = collection(db, COLLECTION_NAME, qrId, 'scans');
    await addDoc(scansRef, scanData);
  } catch (error) {
    console.error("Error recording scan:", error);
  }
};

/**
 * Fetches analytics data for a QR code
 */
export const getAnalytics = async (qrId: string): Promise<ScanEvent[]> => {
  try {
    const scansRef = collection(db, COLLECTION_NAME, qrId, 'scans');
    const q = query(scansRef, orderBy('timestamp', 'desc')); 
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as ScanEvent));
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return [];
  }
};

/**
 * Subscribes to real-time analytics updates
 */
export const subscribeToAnalytics = (qrId: string, callback: (data: ScanEvent[]) => void) => {
  try {
    const scansRef = collection(db, COLLECTION_NAME, qrId, 'scans');
    const q = query(scansRef, orderBy('timestamp', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ScanEvent));
      callback(data);
    }, (error) => {
      console.error("Analytics Snapshot Error:", error);
    });
  } catch (error) {
    console.error("Error subscribing to analytics:", error);
    return () => {};
  }
};

/**
 * Subscribes to live incoming scans across all QRs owned by the user.
 * Invokes onNewScan whenever a scan with timestamp after listenerStartTime occurs.
 */
export const subscribeToMultipleQRScans = (
  qrs: { shortId?: string; id?: string; title?: string }[],
  listenerStartTime: number,
  onNewScan: (scan: ScanEvent & { qrTitle?: string }) => void
) => {
  const unsubscribers: (() => void)[] = [];
  const processedScanIds = new Set<string>();

  qrs.forEach((item) => {
    const qrId = item.shortId || item.id;
    if (!qrId) return;

    try {
      const scansRef = collection(db, COLLECTION_NAME, qrId, 'scans');
      const q = query(scansRef, orderBy('timestamp', 'desc'), limit(5));

      const unsub = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data() as ScanEvent;
            const scanId = change.doc.id;

            // Only trigger for scans that occurred after connection started or within the last 15 seconds
            if (!processedScanIds.has(scanId) && (data.timestamp >= listenerStartTime - 15000)) {
              processedScanIds.add(scanId);
              onNewScan({
                ...data,
                id: scanId,
                qrTitle: item.title || 'Código QR'
              });
            }
          }
        });
      }, (err) => {
        console.warn(`Scan listener error for ${qrId}:`, err);
      });

      unsubscribers.push(unsub);
    } catch (e) {
      console.error("Error listening to scans for QR:", qrId, e);
    }
  });

  return () => {
    unsubscribers.forEach(u => u());
  };
};

/**
 * Subtle Web Audio chime for scan notifications (no external MP3 required)
 */
export const playScanNotificationSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch {
    // Audio context may be blocked before first user gesture
  }
};

const getBrowserName = (userAgent: string) => {
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("SamsungBrowser")) return "Samsung Internet";
  if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera";
  if (userAgent.includes("Trident")) return "Internet Explorer";
  if (userAgent.includes("Edge")) return "Edge";
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Safari")) return "Safari";
  return "Otros";
};

/**
 * Records a click / conversion event on a dynamic QR landing or redirect
 */
export const recordClick = async (
  qrId: string, 
  actionType: 'primary_button' | 'whatsapp' | 'instagram' | 'phone' | 'website' | 'direct_redirect',
  targetUrl?: string
) => {
  try {
    if (!qrId) return;
    const clicksRef = collection(db, COLLECTION_NAME, qrId, 'clicks');
    const clickData: ClickEvent = {
      qrId,
      timestamp: Date.now(),
      actionType,
      targetUrl: targetUrl || ''
    };
    await addDoc(clicksRef, clickData);
  } catch (error) {
    console.warn("Error recording click event:", error);
  }
};

/**
 * Fetches click conversion events for a QR code
 */
export const getClicks = async (qrId: string): Promise<ClickEvent[]> => {
  try {
    const clicksRef = collection(db, COLLECTION_NAME, qrId, 'clicks');
    const q = query(clicksRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ClickEvent));
  } catch (error) {
    console.error("Error fetching clicks:", error);
    return [];
  }
};

/**
 * Subscribes to real-time click updates for a QR code
 */
export const subscribeToClicks = (qrId: string, callback: (data: ClickEvent[]) => void) => {
  try {
    const clicksRef = collection(db, COLLECTION_NAME, qrId, 'clicks');
    const q = query(clicksRef, orderBy('timestamp', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ClickEvent));
      callback(data);
    }, (error) => {
      console.warn("Clicks Snapshot Error:", error);
    });
  } catch (error) {
    console.error("Error subscribing to clicks:", error);
    return () => {};
  }
};

/**
 * Subscribes to real-time analytics and clicks for ALL QRs belonging to a user (Global Overview)
 */
export const subscribeToAllQRsAnalytics = (
  qrs: HistoryItem[], 
  callback: (data: { scansByQr: Record<string, ScanEvent[]>; clicksByQr: Record<string, ClickEvent[]> }) => void
) => {
  const unsubscribers: (() => void)[] = [];
  const scansByQr: Record<string, ScanEvent[]> = {};
  const clicksByQr: Record<string, ClickEvent[]> = {};

  if (!qrs || qrs.length === 0) {
    callback({ scansByQr: {}, clicksByQr: {} });
    return () => {};
  }

  qrs.forEach((qr) => {
    const qrId = qr.shortId || qr.id;
    if (!qrId) return;

    // Listen to scans
    try {
      const scansRef = collection(db, COLLECTION_NAME, qrId, 'scans');
      const qScans = query(scansRef, orderBy('timestamp', 'desc'));
      const unsubScans = onSnapshot(qScans, (snap) => {
        scansByQr[qrId] = snap.docs.map(d => ({ id: d.id, ...d.data() } as ScanEvent));
        callback({ scansByQr: { ...scansByQr }, clicksByQr: { ...clicksByQr } });
      }, () => {});
      unsubscribers.push(unsubScans);
    } catch {}

    // Listen to clicks
    try {
      const clicksRef = collection(db, COLLECTION_NAME, qrId, 'clicks');
      const qClicks = query(clicksRef, orderBy('timestamp', 'desc'));
      const unsubClicks = onSnapshot(qClicks, (snap) => {
        clicksByQr[qrId] = snap.docs.map(d => ({ id: d.id, ...d.data() } as ClickEvent));
        callback({ scansByQr: { ...scansByQr }, clicksByQr: { ...clicksByQr } });
      }, () => {});
      unsubscribers.push(unsubClicks);
    } catch {}
  });

  return () => {
    unsubscribers.forEach(u => u());
  };
};

export const getFirestoreErrorMessage = (error: any): string => {
  const code = error?.code || "";
  const msg = error?.message || "";
  if (code === 'permission-denied') return 'No tienes permiso para realizar esta acción.';
  if (msg.includes("undefined")) return 'Error de datos no válidos.';
  return `Error en la base de datos: ${msg || code}`;
};
