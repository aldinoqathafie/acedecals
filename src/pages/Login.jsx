// ============================================================
// src/pages/Login.jsx
// ============================================================
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app from "../firebase"; // pastikan ini path ke file konfigurasi firebase.js
import { LogIn, UserPlus, Loader2, Mail, Lock, Chrome } from "lucide-react";

export default function LoginPage() {
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

  // 🔐 Email/Password Auth
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/"); // setelah login langsung ke 3D Viewer
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🌐 Login via Google
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white p-4">
      <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-6">
        <h2 className="text-2xl font-semibold text-center mb-4">
          {isRegister ? "Buat Akun Baru" : "Masuk ke Akun Anda"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="flex items-center bg-gray-800 rounded-lg p-2">
              <Mail className="text-gray-400 mr-2" size={18} />
              <input
                type="email"
                required
                className="w-full bg-transparent outline-none text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="flex items-center bg-gray-800 rounded-lg p-2">
              <Lock className="text-gray-400 mr-2" size={18} />
              <input
                type="password"
                required
                className="w-full bg-transparent outline-none text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

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

        <div className="flex items-center justify-center my-3">
          <span className="text-gray-400 text-sm">atau</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 border border-gray-600 hover:bg-gray-800 transition rounded-lg py-2 font-medium"
        >
          <Chrome size={18} /> Masuk dengan Google
        </button>

        <p className="text-center text-sm text-gray-400 mt-3">
          {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <button onClick={toggleMode} className="text-blue-400 hover:underline">
            {isRegister ? "Masuk" : "Daftar"}
          </button>
        </p>
      </div>
    </div>
  );
}
