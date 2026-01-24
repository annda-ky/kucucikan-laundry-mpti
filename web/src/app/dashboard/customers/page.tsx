"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Loader2,
  X,
  User,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { customerService } from "@/services/customer.service";
import { reportService } from "@/services/report.service";
import type { Customer, CreateCustomerDto } from "@/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "leaderboard" | "passive">(
    "all",
  );

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      let data: Customer[];
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

  useEffect(() => {
    fetchCustomers();
  }, [viewMode]);

  // Filter customers based on search (4 digit phone search - FR-POS-03)
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery),
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-[#C5A059]" />
            <span className="text-[10px] font-bold tracking-[0.4em] text-[#C5A059] uppercase">
              Customer Management
            </span>
          </div>
          <h2 className="text-3xl font-light tracking-tight text-[#1A1A1A]">
            Data{" "}
            <span className="font-medium italic text-[#C5A059]">Pelanggan</span>
          </h2>
          <p className="text-[#A19E95] text-sm tracking-wide font-light max-w-md">
            Kelola data pelanggan dan riwayat transaksi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex p-1 bg-[#F5F4F1] rounded-sm">
            <button
              onClick={() => setViewMode("all")}
              className={`px-4 py-2 text-[10px] font-bold tracking-[0.1em] rounded-sm transition-all ${
                viewMode === "all"
                  ? "bg-white shadow-sm text-[#1A1A1A]"
                  : "text-[#A19E95] hover:text-[#1A1A1A]"
              }`}
            >
              SEMUA
            </button>
            <button
              onClick={() => setViewMode("leaderboard")}
              className={`px-4 py-2 text-[10px] font-bold tracking-[0.1em] rounded-sm transition-all ${
                viewMode === "leaderboard"
                  ? "bg-white shadow-sm text-[#1A1A1A]"
                  : "text-[#A19E95] hover:text-[#1A1A1A]"
              }`}
            >
              <TrendingUp size={12} className="inline mr-1" />
              TOP SPENDER
            </button>
            <button
              onClick={() => setViewMode("passive")}
              className={`px-4 py-2 text-[10px] font-bold tracking-[0.1em] rounded-sm transition-all ${
                viewMode === "passive"
                  ? "bg-white shadow-sm text-red-600"
                  : "text-[#A19E95] hover:text-[#1A1A1A]"
              }`}
            >
              <Clock size={12} className="inline mr-1" />
              PASIF
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1A] text-white text-[10px] font-bold tracking-[0.15em] rounded-sm hover:bg-[#C5A059] transition-colors"
          >
            <Plus size={14} />
            TAMBAH
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A19E95]"
        />
        <input
          type="text"
          placeholder="Cari nama atau 4 digit terakhir nomor HP..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059] transition-all placeholder:text-[#E5E2D9]"
        />
      </div>

      {/* Customer List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-[#C5A059]" />
        </div>
      ) : filteredCustomers.length > 0 ? (
        <div className="bg-white border border-[#F0EDE4] rounded-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F0EDE4] bg-[#FAF9F6]">
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-[#A19E95]">
                  Pelanggan
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-[#A19E95]">
                  Kontak
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#A19E95]">
                  Kunjungan
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-[#A19E95]">
                  Total Belanja
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE4]">
              {filteredCustomers.map((customer, index) => (
                <tr
                  key={customer.id}
                  className="hover:bg-[#FAF9F6]/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {viewMode === "leaderboard" && (
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            index === 0
                              ? "bg-[#C5A059] text-white"
                              : index === 1
                                ? "bg-gray-300 text-gray-700"
                                : index === 2
                                  ? "bg-amber-600 text-white"
                                  : "bg-[#F0EDE4] text-[#A19E95]"
                          }`}
                        >
                          {index + 1}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">
                          {customer.name}
                        </p>
                        {customer.notes && (
                          <p className="text-[10px] text-[#A19E95] truncate max-w-[200px]">
                            {customer.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[12px] text-[#1A1A1A]">
                        <Phone size={12} className="text-[#C5A059]" />
                        {customerService.formatPhone(customer.phone)}
                      </div>
                      {customer.address && (
                        <div className="flex items-center gap-2 text-[11px] text-[#A19E95]">
                          <MapPin size={11} />
                          <span className="truncate max-w-[150px]">
                            {customer.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-3 py-1 bg-[#FAF9F6] rounded-full text-[11px] font-bold text-[#1A1A1A]">
                      {customer.totalVisits}x
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {reportService.formatRevenue(customer.totalSpend)}
                    </p>
                    {customer.lastVisitAt && (
                      <p className="text-[10px] text-[#A19E95]">
                        Terakhir:{" "}
                        {new Date(customer.lastVisitAt).toLocaleDateString(
                          "id-ID",
                        )}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-[#F0EDE4] rounded-sm">
          <Users
            size={40}
            strokeWidth={1}
            className="mx-auto mb-4 text-[#E5E2D9]"
          />
          <p className="text-[#A19E95]">
            {searchQuery
              ? "Tidak ada pelanggan ditemukan"
              : "Belum ada data pelanggan"}
          </p>
        </div>
      )}

      {/* Add Customer Modal */}
      {showModal && (
        <CustomerModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchCustomers();
          }}
        />
      )}
    </div>
  );
}

// Customer Modal Component
function CustomerModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<CreateCustomerDto>({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setError("Nama dan nomor HP wajib diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await customerService.create(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menambahkan pelanggan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-sm shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#F0EDE4]">
          <div>
            <h3 className="text-lg font-light text-[#1A1A1A]">
              Tambah{" "}
              <span className="font-medium italic text-[#C5A059]">
                Pelanggan
              </span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#A19E95] hover:text-[#1A1A1A] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-sm">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
              Nama Pelanggan *
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E5E2D9]"
              />
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Masukkan nama..."
                className="w-full pl-10 pr-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
              Nomor HP *
            </label>
            <div className="relative">
              <Phone
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E5E2D9]"
              />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="0812xxxxxxxx"
                className="w-full pl-10 pr-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
              Alamat
            </label>
            <div className="relative">
              <MapPin
                size={16}
                className="absolute left-3 top-3 text-[#E5E2D9]"
              />
              <textarea
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Alamat (opsional)"
                rows={2}
                className="w-full pl-10 pr-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059] transition-all resize-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
              Catatan
            </label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Catatan tambahan..."
              rows={2}
              className="w-full px-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059] transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#1A1A1A] text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-[#C5A059] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin mx-auto" />
            ) : (
              "SIMPAN PELANGGAN"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
