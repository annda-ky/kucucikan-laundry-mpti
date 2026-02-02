"use client";

import { useState, useEffect } from "react";
import { Settings, Save, ShieldAlert, LogOut } from "lucide-react";
import { authService } from "@/services/auth.service";
import { settingsService } from "@/services/settings.service";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function OwnerSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    store_name: "",
    store_address: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getAll();
        setSettings({
          store_name: data.store_name || "",
          store_address: data.store_address || "",
        });
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await settingsService.updateBulk(settings);
      toast.success("Pengaturan berhasil disimpan");
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push("/login");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight">
            Pengaturan{" "}
            <span className="text-[#C5A059] font-medium italic">Sistem</span>
          </h1>
          <p className="text-[#808080] text-sm">
            Konfigurasi aplikasi dan keamanan
          </p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Settings */}
        <div className="p-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Settings size={18} className="text-[#C5A059]" />
            Pengaturan Umum
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#808080] block mb-2">
                Nama Outlet
              </label>
              <input
                type="text"
                value={settings.store_name}
                onChange={(e) =>
                  setSettings({ ...settings, store_name: e.target.value })
                }
                placeholder="Nama Toko"
                className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-sm text-sm text-white focus:border-[#C5A059] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#808080] block mb-2">
                Alamat
              </label>
              <textarea
                value={settings.store_address}
                onChange={(e) =>
                  setSettings({ ...settings, store_address: e.target.value })
                }
                placeholder="Alamat Lengkap"
                rows={3}
                className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-sm text-sm text-white focus:border-[#C5A059] outline-none"
              />
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-[#2A2A2A]">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-[#C5A059] text-[#0F0F0F] text-[10px] font-bold tracking-[0.15em] uppercase rounded-sm hover:bg-[#D4AF6A] transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              {loading ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
            </button>
          </div>
        </div>

        {/* Security Zone */}
        <div className="p-6 bg-red-900/10 border border-red-500/20 rounded-sm">
          <h3 className="text-lg font-medium text-red-500 mb-4 flex items-center gap-2">
            <ShieldAlert size={18} />
            Zona Bahaya
          </h3>
          <p className="text-sm text-[#808080] mb-4">
            Tindakan di sini tidak dapat dibatalkan. Harap berhati-hati.
          </p>
          <div className="space-y-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-bold tracking-[0.15em] uppercase rounded-sm hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut size={14} />
              LOGOUT DARI SEMUA SESI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
