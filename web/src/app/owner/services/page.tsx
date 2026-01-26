"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  X,
  DollarSign,
  Clock,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { serviceService } from "@/services/service.service";
import type { Service, CreateServiceDto, UnitType } from "@/types";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);

  const fetchServices = async () => {
    try {
      const data = await serviceService.getAll();
      setServices(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    serviceId: number | null;
  }>({
    isOpen: false,
    serviceId: null,
  });

  const handleDeleteClick = (id: number) => {
    setConfirmModal({ isOpen: true, serviceId: id });
  };

  const confirmDelete = async () => {
    if (!confirmModal.serviceId) return;

    try {
      await serviceService.delete(confirmModal.serviceId);
      setConfirmModal({ isOpen: false, serviceId: null });
      fetchServices();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-[#C5A059]" />
            <span className="text-[10px] font-bold tracking-[0.4em] text-[#C5A059] uppercase">
              Owner Panel
            </span>
          </div>
          <h2 className="text-3xl font-light tracking-tight text-white">
            Katalog{" "}
            <span className="font-medium italic text-[#C5A059]">Layanan</span>
          </h2>
          <p className="text-[#808080] text-sm tracking-wide font-light">
            Kelola jenis layanan dan harga laundry (Akses Owner).
          </p>
        </div>

        <button
          onClick={() => {
            setEditService(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C5A059] text-[#1A1A1A] text-[10px] font-bold tracking-[0.15em] rounded-sm hover:bg-[#B08D4C] transition-colors"
        >
          <Plus size={14} />
          TAMBAH LAYANAN
        </button>
      </header>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#808080]"
        />
        <input
          type="text"
          placeholder="Cari layanan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm text-sm text-white outline-none focus:border-[#C5A059] transition-all placeholder:text-[#505050]"
        />
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-[#C5A059]" />
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className={`p-6 bg-[#1A1A1A] border rounded-sm transition-all ${
                service.isActive
                  ? "border-[#2A2A2A] hover:border-[#C5A059]/30"
                  : "border-[#2A2A2A] opacity-50"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#0F0F0F] border border-[#2A2A2A] rounded-sm flex items-center justify-center text-2xl text-[#C5A059]">
                    {serviceService.getIcon(service.name)}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      {service.name}
                    </h3>
                    <p className="text-[10px] text-[#808080]">
                      {serviceService.getUnitTypeLabel(service.unitType)}
                    </p>
                  </div>
                </div>
                {service.isActive ? (
                  <span className="px-2 py-1 text-[9px] font-bold text-emerald-500 bg-emerald-950/30 border border-emerald-900/50 rounded">
                    AKTIF
                  </span>
                ) : (
                  <span className="px-2 py-1 text-[9px] font-bold text-red-500 bg-red-950/30 border border-red-900/50 rounded">
                    NONAKTIF
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mb-4 text-[12px] text-[#808080]">
                <div className="flex items-center gap-1">
                  <DollarSign size={12} className="text-[#C5A059]" />
                  <span className="font-medium text-[#C5A059]">
                    {serviceService.formatPrice(service.price)}
                  </span>
                  <span>
                    /{serviceService.getUnitTypeShort(service.unitType)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{service.defaultDuration} menit</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditService(service);
                    setShowModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#2A2A2A] text-white text-[10px] font-bold tracking-[0.1em] rounded-sm hover:bg-[#3A3A3A] transition-colors"
                >
                  <Edit size={12} />
                  EDIT
                </button>
                <button
                  onClick={() => handleDeleteClick(service.id)}
                  className="p-2.5 bg-red-950/20 text-red-500 border border-red-900/30 rounded-sm hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm">
          <Package
            size={40}
            strokeWidth={1}
            className="mx-auto mb-4 text-[#333]"
          />
          <p className="text-[#808080]">
            {searchQuery
              ? "Tidak ada layanan ditemukan"
              : "Belum ada data layanan"}
          </p>
        </div>
      )}

      {/* Service Modal */}
      {showModal && (
        <ServiceModal
          service={editService}
          onClose={() => {
            setShowModal(false);
            setEditService(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditService(null);
            fetchServices();
          }}
        />
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1A1A1A] border border-[#333] rounded-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-950/30 border border-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Hapus Layanan?
            </h3>
            <p className="text-sm text-[#808080] mb-6">
              Layanan yang dihapus tidak dapat dikembalikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setConfirmModal({ isOpen: false, serviceId: null })
                }
                className="flex-1 py-2.5 border border-[#333] text-[#808080] text-xs font-bold tracking-wider uppercase rounded-sm hover:bg-[#2A2A2A] hover:text-white transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-600 text-white text-xs font-bold tracking-wider uppercase rounded-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Service Modal
function ServiceModal({
  service,
  onClose,
  onSuccess,
}: {
  service: Service | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<CreateServiceDto>({
    name: service?.name || "",
    price: service?.price || 0,
    unitType: service?.unitType || "KG",
    defaultDuration: service?.defaultDuration || 45,
  });
  const [isActive, setIsActive] = useState(service?.isActive ?? true);
  const [loading, setLoading] = useState(false);

  const unitTypes: { value: UnitType; label: string }[] = [
    { value: "KG", label: "Kilogram (KG)" },
    { value: "PCS", label: "Satuan (PCS)" },
    { value: "LOAD", label: "Per-Cuci (LOAD)" },
  ];

  const handleSubmit = async () => {
    if (!formData.name || formData.price <= 0) return;

    setLoading(true);
    try {
      if (service) {
        await serviceService.update(service.id, { ...formData, isActive });
      } else {
        await serviceService.create(formData);
      }
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1A1A1A] border border-[#333] rounded-sm shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A059]/5 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A] relative z-10">
          <h3 className="text-lg font-light text-white">
            {service ? "Edit" : "Tambah"}{" "}
            <span className="font-medium italic text-[#C5A059]">Layanan</span>
          </h3>
          <button
            onClick={onClose}
            className="text-[#808080] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 relative z-10">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#808080] block mb-2">
              Nama Layanan
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Contoh: Cuci Kering"
              className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-sm text-sm text-white outline-none focus:border-[#C5A059] placeholder:text-[#333]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#808080] block mb-2">
                Harga
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#808080] text-sm">
                  Rp
                </span>
                <input
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-sm text-sm text-white outline-none focus:border-[#C5A059] placeholder:text-[#333]"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#808080] block mb-2">
                Durasi (menit)
              </label>
              <input
                type="number"
                value={formData.defaultDuration || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultDuration: Number(e.target.value),
                  })
                }
                placeholder="45"
                className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-sm text-sm text-white outline-none focus:border-[#C5A059] placeholder:text-[#333]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#808080] block mb-2">
              Satuan Harga
            </label>
            <div className="grid grid-cols-3 gap-2">
              {unitTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() =>
                    setFormData({ ...formData, unitType: type.value })
                  }
                  className={`py-3 text-[11px] font-bold rounded-sm border transition-all ${
                    formData.unitType === type.value
                      ? "border-[#C5A059] bg-[#C5A059]/10 text-[#C5A059]"
                      : "border-[#2A2A2A] bg-[#0F0F0F] text-[#808080] hover:border-[#C5A059]/50 hover:text-[#C5A059]"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {service && (
            <div className="flex items-center justify-between p-4 bg-[#0F0F0F] border border-[#2A2A2A] rounded-sm">
              <span className="text-[11px] font-medium text-white">
                Status Layanan
              </span>
              <button
                onClick={() => setIsActive(!isActive)}
                className="flex items-center gap-2"
              >
                {isActive ? (
                  <>
                    <ToggleRight size={24} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-500">
                      AKTIF
                    </span>
                  </>
                ) : (
                  <>
                    <ToggleLeft size={24} className="text-gray-600" />
                    <span className="text-[10px] font-bold text-gray-500">
                      NONAKTIF
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !formData.name || formData.price <= 0}
            className="w-full py-3.5 bg-[#C5A059] text-[#1A1A1A] text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-[#B08D4C] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin mx-auto" />
            ) : service ? (
              "SIMPAN PERUBAHAN"
            ) : (
              "TAMBAH LAYANAN"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
