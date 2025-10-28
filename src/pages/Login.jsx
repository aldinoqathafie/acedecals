// ============================================================
// src/pages/Login.jsx (final version, with video background)
// ============================================================
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getFirestore, setDoc, getDoc } from "firebase/firestore";
import app from "../firebase";
import { Loader2, LogIn, UserPlus, Chrome, Mail, Lock } from "lucide-react";

const db = getFirestore(app);

export default function Login() {
  const auth = getAuth(app);
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError("");
  };

  // 📧 Email/password auth
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCred = isRegister
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);

      await ensureUserDoc(userCred.user);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🌐 Google login
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, provider);
      await ensureUserDoc(result.user);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Cek atau buat dokumen user
  const ensureUserDoc = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || "",
        email: user.email,
        photoURL: user.photoURL || "",
        role: "pending", // semua user baru butuh approval admin
        createdAt: new Date(),
      });
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center text-white">
      {/* 🎞️ Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-cover"
      >
        <source src="/videos/login-bg.mp4" type="video/mp4" />
      </video>

      {/* Overlay hitam transparan */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Konten utama */}
      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md px-6">
        {/* Logo */}
        <img
          src="/images/logo.png"
          alt="Logo"
          className="w-40 object-contain select-none"
        />

        {/* Kotak Login */}
        <div className="w-full bg-black/70 p-6 rounded-2xl shadow-lg space-y-4">
          <h2 className="text-xl font-semibold text-center">
            {isRegister ? "Buat Akun Baru" : "Masuk ke Akun Anda"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center bg-gray-800/80 rounded-lg px-3 py-2">
              <Mail className="text-gray-400 mr-2" size={18} />
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-transparent outline-none text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center bg-gray-800/80 rounded-lg px-3 py-2">
              <Lock className="text-gray-400 mr-2" size={18} />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-transparent outline-none text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 transition rounded-lg py-2 font-medium"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isRegister ? (
                <>
                  <UserPlus size={18} /> Daftar
                </>
              ) : (
                <>
                  <LogIn size={18} /> Masuk
                </>
              )}
            </button>
          </form>

          {/* Garis pemisah */}
          <div className="flex items-center justify-center text-gray-400 text-sm">
            <span>atau</span>
          </div>

          {/* Tombol Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 border border-gray-600 hover:bg-gray-800 transition rounded-lg py-2 font-medium"
          >
            <Chrome size={18} /> Masuk dengan Google
          </button>

          {/* Toggle mode */}
          <p className="text-center text-sm text-gray-400 mt-3">
            {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <button
              onClick={toggleMode}
              className="text-blue-400 hover:underline"
            >
              {isRegister ? "Masuk" : "Daftar"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
