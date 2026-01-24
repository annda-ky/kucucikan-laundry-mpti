"use client";

import { useState, useEffect } from "react";
import { Users, Search, MapPin, Phone, TrendingUp, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { customerService } from "@/services/customer.service";
import { reportService } from "@/services/report.service";
import type { Customer } from "@/types";

export default function OwnerCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "leaderboard" | "passive">(
    "all",
  );

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        let data: Customer[] = [];
        if (viewMode === "leaderboard") {
          data = await customerService.getLeaderboard("totalSpend");
        } else if (viewMode === "passive") {
          data = await customerService.getPassive();
        } else {
          data = await customerService.getAll();
        }
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [viewMode]);

  const handleBlast = (phone: string, name: string) => {
    const message = `Halo Kak ${name}, kami kangen nih! 👋\n\nLaundry Kucucikan ada promo spesial buat Kakak. Yuk cuci sekarang, bajunya biar kami yang urus! 🧺✨`;
    const url = `https://wa.me/${phone.replace(/\D/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery),
  );

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Hapus permanen pelanggan "${name}"?\nPerhatian: Data tidak bisa dikembalikan.`,
      )
    )
      return;

    try {
      await customerService.delete(id);
      toast.success(`Pelanggan "${name}" berhasil dihapus`);
      // Refresh list
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Gagal menghapus. Pastikan tidak ada transaksi aktif.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight">
            Data{" "}
            <span className="text-[#C5A059] font-medium italic">
              {viewMode === "passive" ? "Marketing" : "Pelanggan"}
            </span>
          </h1>
          <p className="text-[#808080] text-sm">
            {viewMode === "passive"
              ? "Target pelanggan pasif (>30 hari tidak datang)"
              : "Database pelanggan dan riwayat kunjungan"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm">
            <button
              onClick={() => setViewMode("all")}
              className={`px-4 py-2 text-[10px] font-bold tracking-[0.1em] rounded-sm transition-all ${
                viewMode === "all"
                  ? "bg-[#C5A059] text-[#1A1A1A]"
                  : "text-[#808080] hover:text-white"
              }`}
            >
              SEMUA
            </button>
            <button
              onClick={() => setViewMode("leaderboard")}
              className={`px-4 py-2 text-[10px] font-bold tracking-[0.1em] rounded-sm transition-all ${
                viewMode === "leaderboard"
                  ? "bg-[#C5A059] text-[#1A1A1A]"
                  : "text-[#808080] hover:text-white"
              }`}
            >
              <TrendingUp size={12} className="inline mr-1" />
              TOP SPENDER
            </button>
            <button
              onClick={() => setViewMode("passive")}
              className={`px-4 py-2 text-[10px] font-bold tracking-[0.1em] rounded-sm transition-all ${
                viewMode === "passive"
                  ? "bg-[#C5A059] text-[#1A1A1A]"
                  : "text-[#808080] hover:text-white"
              }`}
            >
              PASIF (MARKETING)
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#808080]"
        />
        <input
          type="text"
          placeholder="Cari nama atau no HP..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm text-sm text-white placeholder:text-[#4A4A4A] focus:border-[#C5A059] outline-none w-full md:w-64"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer, index) => (
          <div
            key={customer.id}
            className="p-5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm hover:border-[#C5A059]/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {viewMode === "leaderboard" && (
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      index === 0
                        ? "bg-[#C5A059] text-[#1A1A1A]"
                        : index === 1
                          ? "bg-[#E5E5E5] text-[#1A1A1A]"
                          : index === 2
                            ? "bg-[#A16207] text-white"
                            : "bg-[#2A2A2A] text-[#808080]"
                    }`}
                  >
                    {index + 1}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-white">
                    {customer.name}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-[#808080]">
                    <Phone size={10} />
                    <span>{customer.phone}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="px-2 py-1 bg-[#2A2A2A] text-[9px] font-bold text-[#808080] rounded">
                  {customer.totalVisits}x Visit
                </span>
                <button
                  onClick={() => handleDelete(customer.id, customer.name)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-all"
                  title="Hapus Pelanggan"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2A2A2A] flex justify-between items-end">
              <div>
                <p className="text-[9px] text-[#808080] uppercase tracking-wider">
                  Total Belanja
                </p>
                <p className="text-sm font-medium text-[#C5A059]">
                  {reportService.formatRevenue(customer.totalSpend)}
                </p>
              </div>

              {viewMode === "passive" ? (
                <button
                  onClick={() => handleBlast(customer.phone, customer.name)}
                  className="px-3 py-1.5 bg-[#25D366] text-[#1A1A1A] text-[10px] font-bold uppercase rounded-sm hover:bg-[#128C7E] hover:text-white transition-colors flex items-center gap-1"
                >
                  <Phone size={12} />
                  Kirim Promo
                </button>
              ) : (
                customer.address && (
                  <div className="flex items-center gap-1 text-[10px] text-[#808080] max-w-[120px] truncate">
                    <MapPin size={10} />
                    <span className="truncate">{customer.address}</span>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredCustomers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-[#2A2A2A] rounded-sm bg-[#1A1A1A]/50">
          <Users size={48} className="text-[#2A2A2A] mb-4" />
          <p className="text-white font-medium mb-1">
            {viewMode === "passive"
              ? "Tidak ada pelanggan pasif"
              : viewMode === "leaderboard"
                ? "Belum ada data transaksi"
                : "Data pelanggan tidak ditemukan"}
          </p>
          <p className="text-[#808080] text-xs max-w-md">
            {viewMode === "passive"
              ? "Semua pelanggan rajin datang! Tidak ada yang absen > 30 hari."
              : searchQuery
                ? `Tidak ada hasil pencarian untuk "${searchQuery}"`
                : "Belum ada data pelanggan yang tersimpan."}
          </p>
        </div>
      )}
    </div>
  );
}
