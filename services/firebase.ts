
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
import { QRCodeConfig, HistoryItem, ScanEvent } from "../types";
import configJson from "../firebase-applet-config.json";

// Use provisioned Firebase configuration
const firebaseConfig = {
  apiKey: configJson.apiKey,
  authDomain: configJson.authDomain,
  projectId: configJson.projectId,
  storageBucket: configJson.storageBucket,
  messagingSenderId: configJson.messagingSenderId,
  appId: configJson.appId
};

// Initialize Firebase App and Firestore Database instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = (configJson.firestoreDatabaseId && configJson.firestoreDatabaseId !== "(default)")
  ? getFirestore(app, configJson.firestoreDatabaseId)
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
  
  const dataToSave = cleanData({
    ...config,
    shortId: docId,
    id: docId,
    ownerId: ownerId || config.ownerId || auth.currentUser?.uid || 'anonymous',
    updatedAt: Date.now(),
    createdAt: config.createdAt || Date.now()
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

export const getFirestoreErrorMessage = (error: any): string => {
  const code = error?.code || "";
  const msg = error?.message || "";
  if (code === 'permission-denied') return 'No tienes permiso para realizar esta acción.';
  if (msg.includes("undefined")) return 'Error de datos no válidos.';
  return `Error en la base de datos: ${msg || code}`;
};
