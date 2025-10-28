// ============================================================
// src/firebase.js
// ============================================================

// Import dari Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";

// ============================================================
// 🔑 Konfigurasi Firebase kamu
// (sudah sesuai project acedecals-login)
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyDsICb9ourWvtAnFRwnZTPyqgXbKhVrDqU",
  authDomain: "acedecals-login.firebaseapp.com",
  projectId: "acedecals-login",
  storageBucket: "acedecals-login.firebasestorage.app",
  messagingSenderId: "36438281371",
  appId: "1:36438281371:web:e054854ae8d0cbc71dca3e",
  measurementId: "G-JK90BGQVBY",
};

// ============================================================
// 🚀 Inisialisasi Firebase
// ============================================================
const app = initializeApp(firebaseConfig);

// Database utama
export const db = getFirestore(app);

// Storage (buat upload gambar, decal, dll)
export const storage = getStorage(app);

// Auth (login user)
export const auth = getAuth(app);

// Provider Login
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Debug log biar tau terkoneksi
console.log("🔥 Firebase Connected:", app.name);

// Ekspor default app
export default app;
