
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  AuthError
} from "firebase/auth";
import { QRCodeConfig, ScanEvent } from "../types";

// Configuration checks are handled by the environment variables or local fallback
const firebaseConfig = {
  apiKey: "AIzaSyBpsQwDnXakMj_yGXxqgANbcEUBJrLSKQI",
  authDomain: "marketa-pjbwh.firebaseapp.com",
  projectId: "marketa-pjbwh",
  storageBucket: "marketa-pjbwh.firebasestorage.app",
  messagingSenderId: "260172136725",
  appId: "1:260172136725:web:867fba66fa0c8627c5691c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);

// Collection name constant
const COLLECTION_NAME = "neoqr_codes";
const SCANS_COLLECTION = "neoqr_scans";

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
    // Update Display Name immediately
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

/**
 * Traduce errores de Firebase a Español amigable
 */
export const getAuthErrorMessage = (error: any): string => {
  const code = error.code || "";
  switch (code) {
    case 'auth/email-already-in-use': return 'Este correo ya está registrado.';
    case 'auth/invalid-email': return 'El correo electrónico no es válido.';
    case 'auth/weak-password': return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/user-not-found': return 'No existe cuenta con este correo.';
    case 'auth/wrong-password': return 'Contraseña incorrecta.';
    case 'auth/popup-closed-by-user': return 'Se canceló el inicio de sesión.';
    case 'auth/invalid-credential': return 'Credenciales inválidas.';
    case 'auth/unauthorized-domain': return 'Dominio no autorizado. Agrega este dominio en Firebase Console > Auth > Settings.';
    case 'auth/operation-not-allowed': return 'El método de acceso no está habilitado en Firebase Console.';
    default: return `Error de acceso: ${code}`;
  }
};

// --- FIRESTORE SERVICES ---

const cleanData = (data: any) => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
};

export const saveQRToFirebase = async (config: QRCodeConfig) => {
  const docId = config.shortId || (config.isDynamic ? config.shortId : crypto.randomUUID());
  if (!docId) throw new Error("Error interno: No ID generation possible");
  
  const dataToSave = cleanData({
    ...config,
    shortId: docId, 
    updatedAt: Date.now(),
  });

  try {
    await setDoc(doc(db, COLLECTION_NAME, docId), dataToSave, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving QR to Firebase:", error);
    throw error;
  }
};

export const getQRFromFirebase = async (shortId: string): Promise<QRCodeConfig | null> => {
  try {
    if (!shortId) return null;
    const docRef = doc(db, COLLECTION_NAME, shortId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as QRCodeConfig;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching QR:", error);
    return null;
  }
};

// --- ANALYTICS SERVICES ---

/**
 * Records a scan event for a specific QR code
 */
export const recordScan = async (qrId: string) => {
  console.log("[DEBUG] Attempting to record scan for ID:", qrId);
  try {
    // Detect User Agent Info
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

    // Determine location using free GeoIP lookup or browser timezone fallback
    let country = 'Desconocido';
    let city = 'Desconocido';

    try {
      // Fast non-blocking IP location lookup
      const geoRes = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(2500) });
      if (geoRes.ok) {
        const geoJson = await geoRes.json();
        if (geoJson.success) {
          country = geoJson.country || country;
          city = geoJson.city || city;
        }
      }
    } catch {
      // Fallback to timezone heuristics
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

    // Save to a subcollection 'scans' inside the QR document for organization
    // Path: neoqr_codes/{qrId}/scans/{scanDocId}
    const scansRef = collection(db, COLLECTION_NAME, qrId, 'scans');
    const res = await addDoc(scansRef, scanData);
    console.log("[DEBUG] Scan recorded successfully for:", qrId, "Doc ID:", res.id);
  } catch (error) {
    console.error("[DEBUG] Error recording scan:", error);
    // Silent fail to not disrupt user experience
  }
};

/**
 * Fetches analytics data for a specific QR (One-time fetch)
 */
export const getAnalytics = async (qrId: string): Promise<ScanEvent[]> => {
  try {
    const scansRef = collection(db, COLLECTION_NAME, qrId, 'scans');
    const q = query(scansRef, orderBy('timestamp', 'desc')); 
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScanEvent));
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return [];
  }
};

/**
 * Subscribes to real-time analytics updates
 */
export const subscribeToAnalytics = (qrId: string, callback: (data: ScanEvent[]) => void) => {
  console.log("[DEBUG] Subscribing to analytics for ID:", qrId);
  try {
    const scansRef = collection(db, COLLECTION_NAME, qrId, 'scans');
    const q = query(scansRef, orderBy('timestamp', 'desc'));
    
    // Return the unsubscribe function
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScanEvent));
      console.log(`[DEBUG] Realtime update received. Scans count: ${data.length}`);
      callback(data);
    }, (error) => {
      console.error("[DEBUG] Snapshot Listener Error:", error);
    });
  } catch (error) {
    console.error("[DEBUG] Error subscribing to analytics:", error);
    return () => {}; // Return empty unsubscribe function on error
  }
};

const getBrowserName = (userAgent: string) => {
  if(userAgent.includes("Firefox")) return "Firefox";
  if(userAgent.includes("SamsungBrowser")) return "Samsung Internet";
  if(userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera";
  if(userAgent.includes("Trident")) return "Internet Explorer";
  if(userAgent.includes("Edge")) return "Edge";
  if(userAgent.includes("Chrome")) return "Chrome";
  if(userAgent.includes("Safari")) return "Safari";
  return "Otros";
};

export const getFirestoreErrorMessage = (error: any): string => {
  const code = error.code || "";
  const msg = error.message || "";
  if (code === 'permission-denied') return 'No tienes permiso. Verifica las Reglas en Firestore Console.';
  if (msg.includes("undefined")) return 'Error interno: Datos corruptos (undefined).';
  return `Error al guardar: ${msg}`;
};
