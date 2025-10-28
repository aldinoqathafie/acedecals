import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'

// 🔍 Ambil IP address lokal otomatis (contoh: 192.168.1.10)
function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,            // ✅ Izinkan koneksi dari perangkat lain (bukan cuma localhost)
    port: 5173,            // Bisa ubah kalau perlu
    open: false,           // Jangan auto-buka di desktop
    strictPort: true,      // Port fix (biar HP tahu alamatnya)
    // 💡 Optional: tampilkan IP di terminal saat run
    onListening(server) {
      const address = server.httpServer.address()
      const localIP = getLocalIP()
      console.log(`\n🚀  Akses dari HP:  http://${localIP}:${address.port}/\n`)
    },
  },
})
