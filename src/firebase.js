// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsICb9ourWvtAnFRwnZTPyqgXbKhVrDqU",
  authDomain: "acedecals-login.firebaseapp.com",
  projectId: "acedecals-login",
  storageBucket: "acedecals-login.firebasestorage.app",
  messagingSenderId: "36438281371",
  appId: "1:36438281371:web:e054854ae8d0cbc71dca3e",
  measurementId: "G-JK90BGQVBY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
