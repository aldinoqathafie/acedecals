// ============================================================
// src/App.jsx (FINAL ROUTE + AUTO-CREATE USER FIRESTORE)
// ============================================================

import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import app, { auth } from "./firebase";

// 🧩 Halaman & Komponen
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Viewer3D from "./components/Viewer3D.jsx";
import CustomizerPanel from "./components/CustomizerPanel.jsx";
import ModelSelector from "./components/ModelSelector.jsx";

// ============================================================
// 📦 Daftar model GLB
// ============================================================
const models = [
  { id: 1, name: "Kosan 40", file: "Kosan_40.glb" },
  { id: 2, name: "Gunungan 37x43", file: "Gunungan_37x43.glb" },
  { id: 3, name: "Nepak Cagak Oval", file: "Nepak_Cagak_Oval.glb" },
  { id: 4, name: "Sangkar Murai", file: "Sangkar_Murai.glb" },
  { id: 5, name: "Tebok Lovebird", file: "Tebok_Lovebird.glb" },
];

// ============================================================
// 🔐 Protected Route
// ============================================================
function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ============================================================
// 🎨 Halaman utama untuk User biasa (3D Viewer)
// ============================================================
function UserHome({ user, handleLogout }) {
  const [activeModel, setActiveModel] = useState(models[0].file);
  const [highlightMesh, setHighlightMesh] = useState(null);
  const [colorDataMap, setColorDataMap] = useState({});
  const [decalDataMap, setDecalDataMap] = useState({});

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-800 to-black relative overflow-hidden">
      {/* 🔓 User Info Bar */}
      <div className="absolute top-3 right-3 z-30 bg-black/40 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt="user"
            className="w-6 h-6 rounded-full border border-gray-500"
          />
        )}
        <span>{user.displayName || user.email}</span>
        <button
          onClick={handleLogout}
          className="ml-2 px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-xs"
        >
          Logout
        </button>
      </div>

      {/* 🧱 3D Viewer */}
      <Viewer3D
        key={activeModel}
        modelPath={`/models/${activeModel}`}
        colorData={colorDataMap[activeModel] || {}}
        decalData={decalDataMap[activeModel] || {}}
        highlightMesh={highlightMesh}
      />

      {/* 🎚️ Sidebar Customizer */}
      <CustomizerPanel
        key={`panel-${activeModel}`}
        activeModel={activeModel}
        onColorChange={(mesh, conf) =>
          setColorDataMap((p) => ({
            ...p,
            [activeModel]: { ...(p[activeModel] || {}), [mesh]: conf },
          }))
        }
        onDecalChange={(mesh, conf) =>
          setDecalDataMap((p) => ({
            ...p,
            [activeModel]: { ...(p[activeModel] || {}), [mesh]: conf },
          }))
        }
        onHighlight={(mesh) =>
          setHighlightMesh((prev) => (prev === mesh ? null : mesh))
        }
      />

      {/* 🔽 Model Selector */}
      <div
        className="absolute bottom-6 left-0 w-full flex justify-center pointer-events-none"
        style={{ zIndex: 20 }}
      >
        <div className="pointer-events-auto">
          <ModelSelector
            activeModel={activeModel}
            onSelect={(file) => setActiveModel(file)}
            models={models}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 🧠 APP UTAMA (Auth + Route + Auto-create Firestore user)
// ============================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        // 🔹 Jika user belum ada di Firestore → buat baru
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || "User Baru",
            photo: currentUser.photoURL || "",
            role: "pending",
            createdAt: serverTimestamp(),
          });
          setRole("pending");
        } else {
          setRole(userSnap.data().role || "pending");
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // 🚪 Logout
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  // 💬 Loading
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-white bg-black">
        Loading...
      </div>
    );

  // ============================================================
  // 🧭 Routing
  // ============================================================
  return (
    <Router>
      <Routes>
        {/* 🔑 LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* 👑 ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user}>
              {role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )}
            </ProtectedRoute>
          }
        />

        {/* 👤 USER VIEWER */}
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              {role === "pending" ? (
                <div className="flex flex-col items-center justify-center h-screen text-white bg-black">
                  <p className="mb-4">
                    Akun kamu masih menunggu persetujuan admin...
                  </p>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded"
                  >
                    Logout
                  </button>
                </div>
              ) : role === "rejected" ? (
                <div className="flex flex-col items-center justify-center h-screen text-white bg-black">
                  <p className="mb-4">Akun kamu ditolak oleh admin.</p>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded"
                  >
                    Logout
                  </button>
                </div>
              ) : role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <UserHome user={user} handleLogout={handleLogout} />
              )}
            </ProtectedRoute>
          }
        />

        {/* 🚫 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
