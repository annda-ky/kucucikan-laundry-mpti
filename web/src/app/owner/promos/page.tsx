"use client";

import { useState, useEffect } from "react";
import { Plus, Tag, Calendar, Trash2, Edit2, Search } from "lucide-react";
import { promoService } from "@/services/promo.service";
import { toast } from "react-hot-toast";
import type { Promo, CreatePromoDto, PromoType } from "@/types";

export default function OwnerPromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreatePromoDto>({
    code: "",
    type: "PERCENTAGE",
    value: 0,
    description: "",
    validUntil: "",
  });

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const data = await promoService.getAll();
      setPromos(data);
    } catch (error) {
      console.error("Error fetching promos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await promoService.create(formData);
      toast.success("Promo berhasil dibuat");
      setShowModal(false);
      fetchPromos();
      setFormData({
        code: "",
        type: "PERCENTAGE",
        value: 0,
        description: "",
        validUntil: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal membuat promo");
    }
  };

  const toggleActive = async (promo: Promo) => {
    try {
      await promoService.update(promo.id, { isActive: !promo.isActive });
      toast.success(
        `Promo ${!promo.isActive ? "diaktifkan" : "dinonaktifkan"}`,
      );
      fetchPromos();
    } catch (error) {
      toast.error("Gagal update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus promo ini?")) return;
    try {
      await promoService.delete(id);
      toast.success("Promo dihapus");
      fetchPromos();
    } catch (error) {
      toast.error("Gagal menghapus promo");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight">
            Manajemen{" "}
            <span className="text-[#C5A059] font-medium italic">Promo</span>
          </h1>
          <p className="text-[#808080] text-sm">Buat dan atur kode diskon</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#C5A059] text-[#1A1A1A] text-[11px] font-bold uppercase tracking-[0.1em] rounded-sm hover:bg-[#D4AF6A] flex items-center gap-2"
        >
          <Plus size={14} />
          Buat Promo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map((promo) => (
          <div
            key={promo.id}
            className={`p-5 border rounded-sm transition-all ${
              promo.isActive
                ? "bg-[#1A1A1A] border-[#2A2A2A]"
                : "bg-[#1A1A1A]/50 border-red-900/30 opacity-70"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    promo.isActive
                      ? "bg-[#C5A059]/10 text-[#C5A059]"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    {promo.code}
                  </h3>
                  <p className="text-[10px] text-[#808080]">
                    {promo.description || "No description"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-lg font-bold ${promo.isActive ? "text-[#C5A059]" : "text-[#808080]"}`}
                >
                  {promo.type === "PERCENTAGE"
                    ? `${promo.value}%`
                    : `Rp ${promo.value.toLocaleString()}`}
                </span>
                <p className="text-[9px] text-[#808080] uppercase">OFF</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2A2A2A] flex justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] text-[#808080]">
                <Calendar size={12} />
                <span>
                  {promo.validUntil
                    ? new Date(promo.validUntil).toLocaleDateString()
                    : "Selamanya"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleActive(promo)}
                  className={`px-3 py-1 rounded-sm text-[9px] font-bold uppercase ${
                    promo.isActive
                      ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                      : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  }`}
                >
                  {promo.isActive ? "Aktif" : "Non-aktif"}
                </button>
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="p-1.5 text-[#808080] hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] w-full max-w-md rounded-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              Buat Promo Baru
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#808080]">
                  Kode Promo
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] p-3 text-white text-sm focus:border-[#C5A059] outline-none rounded-sm"
                  placeholder="Contoh: MERDEKA45"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#808080]">
                    Tipe Diskon
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as PromoType,
                      })
                    }
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] p-3 text-white text-sm focus:border-[#C5A059] outline-none rounded-sm"
                  >
                    <option value="PERCENTAGE">Persentase (%)</option>
                    <option value="FIXED_AMOUNT">Nominal (Rp)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#808080]">
                    Nilai
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        value: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] p-3 text-white text-sm focus:border-[#C5A059] outline-none rounded-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#808080]">
                  Berlaku Sampai (Opsional)
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData({ ...formData, validUntil: e.target.value })
                  }
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] p-3 text-white text-sm focus:border-[#C5A059] outline-none rounded-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#808080]">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] p-3 text-white text-sm focus:border-[#C5A059] outline-none rounded-sm h-20"
                  placeholder="Keterangan singkat..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-[#2A2A2A] text-[#808080] text-[11px] font-bold uppercase rounded-sm hover:text-white hover:border-white transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#C5A059] text-[#1A1A1A] text-[11px] font-bold uppercase rounded-sm hover:bg-[#D4AF6A] transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
