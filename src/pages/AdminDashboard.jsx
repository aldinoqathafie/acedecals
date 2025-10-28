// ============================================================
// src/pages/AdminDashboard.jsx
// ============================================================
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import app from "../firebase";
import { Check, X, Trash2, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const db = getFirestore(app);
  const auth = getAuth(app);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // 🧭 Ambil semua data user realtime
  // ============================================================
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ============================================================
  // ✅ Approve User
  // ============================================================
  const approveUser = async (id) => {
    await updateDoc(doc(db, "users", id), { role: "approved" });
  };

  // ============================================================
  // ❌ Tolak / Nonaktifkan User
  // ============================================================
  const rejectUser = async (id) => {
    await updateDoc(doc(db, "users", id), { role: "rejected" });
  };

  // ============================================================
  // 🗑️ Hapus User
  // ============================================================
  const deleteUser = async (id) => {
    if (window.confirm("Yakin ingin menghapus user ini?")) {
      await deleteDoc(doc(db, "users", id));
    }
  };

  // ============================================================
  // 🚪 Logout Admin
  // ============================================================
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-3">
        <h1 className="text-2xl font-bold">👑 Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm"
        >
          <LogOut size={16} /> Keluar
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Memuat data user...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-400">Belum ada user terdaftar.</p>
      ) : (
        <table className="w-full text-sm border border-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="text-left p-3">Nama</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t border-gray-800 hover:bg-gray-900/70 transition"
              >
                <td className="p-3">{user.name || "-"}</td>
                <td className="p-3 text-gray-300">{user.email}</td>
                <td
                  className={`p-3 font-medium ${
                    user.role === "admin"
                      ? "text-yellow-400"
                      : user.role === "approved"
                      ? "text-green-400"
                      : user.role === "pending"
                      ? "text-orange-400"
                      : "text-red-400"
                  }`}
                >
                  {user.role}
                </td>
                <td className="p-3 flex gap-2">
                  {user.role === "pending" && (
                    <>
                      <button
                        onClick={() => approveUser(user.id)}
                        className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded flex items-center gap-1"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => rejectUser(user.id)}
                        className="bg-yellow-600 hover:bg-yellow-500 px-3 py-1 rounded flex items-center gap-1"
                      >
                        <X size={14} /> Tolak
                      </button>
                    </>
                  )}
                  {user.role !== "admin" && (
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="bg-red-700 hover:bg-red-600 px-3 py-1 rounded flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
