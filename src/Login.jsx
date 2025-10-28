import React, { useState } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // 🧩 LOGIN MANUAL (username/password)
  const handleManualLogin = async () => {
    if (!username || !password)
      return alert("Isi username dan password terlebih dahulu.");
    try {
      const userRef = doc(db, "users", username);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        alert("Akun tidak ditemukan.");
        return;
      }

      const data = snap.data();
      if (data.password === password) {
        alert(`Selamat datang kembali, ${data.name || username}!`);
        onLogin({ ...data, uid: username });
      } else {
        alert("Password salah.");
      }
    } catch (err) {
      console.error("❌ Login manual gagal:", err);
      alert("Terjadi kesalahan saat login manual.");
    }
  };

  // 🧩 LOGIN GOOGLE / FACEBOOK (Sign Up jika baru)
  const handleProviderLogin = async (providerName) => {
    try {
      setLoading(true);
      const provider =
        providerName === "google"
          ? new GoogleAuthProvider()
          : new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        // user baru → daftarkan
        await setDoc(userRef, {
          name: user.displayName || "User",
          email: user.email,
          photoURL: user.photoURL || "",
          role: "user",
          password: null, // nanti bisa diset di profile
          createdAt: new Date(),
        });
      }

      alert(`Login berhasil, selamat datang ${user.displayName || "User"}!`);
      onLogin({ ...user, role: "user" });
    } catch (err) {
      console.error("❌ Login gagal:", err);
      alert("Login gagal. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden text-white">
      {/* 🎥 Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover brightness-[0.35]"
      >
        <source src="/videos/login-bg.mp4" type="video/mp4" />
      </video>

      {/* Overlay lembut */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 🪟 Panel login transparan */}
      <div className="relative z-10 flex flex-col items-center text-center w-[90%] max-w-sm 
                      bg-black/60 border border-white/20 rounded-2xl 
                      p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] animate-fade-in">
        {/* 🪶 Logo */}
        <img
          src="/images/logo.png"
          alt="Logo"
          className="w-auto h-24 mb-6 object-contain"
        />

        {/* ===== Input Login Manual ===== */}
        <div className="flex flex-col w-full space-y-3 mb-5">
          <input
            type="text"
            placeholder="Username (UID Firestore)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 bg-transparent border-b border-gray-500 text-sm text-center text-gray-300"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-transparent border-b border-gray-500 text-sm text-center text-gray-300"
          />
        </div>

        {/* Tombol Login Manual */}
        <button
          onClick={handleManualLogin}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white uppercase tracking-widest rounded-md mb-4"
        >
          Login
        </button>

        <p className="text-xs text-gray-300 mb-3">or sign in using</p>

        {/* 🔘 Login Sosial */}
        <div className="flex justify-center gap-6">
          <button
            onClick={() => handleProviderLogin("google")}
            className={`hover:scale-110 transition-transform ${
              loading ? "opacity-50" : ""
            }`}
            disabled={loading}
          >
            <img src="/images/google-icon.svg" alt="Google" className="w-8 h-8" />
          </button>
          <button
            onClick={() => handleProviderLogin("facebook")}
            className={`hover:scale-110 transition-transform ${
              loading ? "opacity-50" : ""
            }`}
            disabled={loading}
          >
            <img src="/images/facebook-icon.svg" alt="Facebook" className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
}
