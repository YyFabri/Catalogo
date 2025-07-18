
// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYDX_UPo20Ywf77o7jgNEkYXlBBfLRfpU",
  authDomain: "catalogoxventa.firebaseapp.com",
  projectId: "catalogoxventa",
  storageBucket: "catalogoxventa.appspot.com",
  messagingSenderId: "1001300119916",
  appId: "1:1001300119916:web:cd69290fab0c6d2a4a6349",
  measurementId: "G-E71YGEERX3"
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
