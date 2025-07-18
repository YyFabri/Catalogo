
// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ====================================================================================
// TODO: ¡ACCIÓN REQUERIDA!
// 1. Ve a tu proyecto en la Consola de Firebase.
// 2. Ve a Configuración del Proyecto (el engranaje ⚙️).
// 3. En la sección "Tus apps", copia el objeto `firebaseConfig` de tu aplicación web.
// 4. Pega ese objeto aquí para reemplazar el que está debajo.
// ====================================================================================
const firebaseConfig = {
  apiKey: "PON_TU_API_KEY_AQUI",
  authDomain: "PON_TU_AUTH_DOMAIN_AQUI",
  projectId: "PON_TU_PROJECT_ID_AQUI",
  storageBucket: "PON_TU_STORAGE_BUCKET_AQUI",
  messagingSenderId: "PON_TU_MESSAGING_SENDER_ID_AQUI",
  appId: "PON_TU_APP_ID_AQUI"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

export { db };
