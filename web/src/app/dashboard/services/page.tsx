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
import type {
  Service,
  CreateServiceDto,
  UnitType,
  InventoryItem,
} from "@/types";

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

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus layanan ini?")) return;
    try {
      await serviceService.delete(id);
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
              Service Management
            </span>
          </div>
          <h2 className="text-3xl font-light tracking-tight text-[#1A1A1A]">
            Daftar{" "}
            <span className="font-medium italic text-[#C5A059]">Layanan</span>
          </h2>
          <p className="text-[#A19E95] text-sm tracking-wide font-light">
            Kelola jenis layanan dan harga laundry.
          </p>
        </div>

        <button
          onClick={() => {
            setEditService(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1A] text-white text-[10px] font-bold tracking-[0.15em] rounded-sm hover:bg-[#C5A059] transition-colors"
        >
          <Plus size={14} />
          TAMBAH LAYANAN
        </button>
      </header>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A19E95]"
        />
        <input
          type="text"
          placeholder="Cari layanan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059] transition-all"
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
              className={`p-6 bg-white border rounded-sm transition-all ${
                service.isActive
                  ? "border-[#F0EDE4] hover:border-[#C5A059]/50"
                  : "border-gray-200 bg-gray-50 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FAF9F6] rounded-sm flex items-center justify-center text-2xl">
                    {serviceService.getIcon(service.name)}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#1A1A1A]">
                      {service.name}
                    </h3>
                    <p className="text-[10px] text-[#A19E95]">
                      {serviceService.getUnitTypeLabel(service.unitType)}
                    </p>
                  </div>
                </div>
                {service.isActive ? (
                  <span className="px-2 py-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 rounded">
                    AKTIF
                  </span>
                ) : (
                  <span className="px-2 py-1 text-[9px] font-bold text-gray-500 bg-gray-100 rounded">
                    NONAKTIF
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mb-4 text-[12px] text-[#A19E95]">
                <div className="flex items-center gap-1">
                  <DollarSign size={12} className="text-[#C5A059]" />
                  <span className="font-medium text-[#1A1A1A]">
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
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#FAF9F6] text-[#1A1A1A] text-[10px] font-bold tracking-[0.1em] rounded-sm hover:bg-[#C5A059]/20 transition-colors"
                >
                  <Edit size={12} />
                  EDIT
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="p-2.5 bg-red-50 text-red-600 rounded-sm hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-[#F0EDE4] rounded-sm">
          <Package
            size={40}
            strokeWidth={1}
            className="mx-auto mb-4 text-[#E5E2D9]"
          />
          <p className="text-[#A19E95]">
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
    price: Number(service?.price) || 0,
    unitType: service?.unitType || "KG",
    defaultDuration: service?.defaultDuration || 45,
    recipes:
      service?.recipes?.map((r) => ({
        inventoryItemId: r.inventoryItemId,
        quantity: r.quantity,
      })) || [],
  });
  const [isActive, setIsActive] = useState(service?.isActive ?? true);
  const [loading, setLoading] = useState(false);

  // Recipe State
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | "">("");
  const [recipeQty, setRecipeQty] = useState<number>(0);

  // Logic to load inventory
  useEffect(() => {
    // We need to import inventoryService.
    // Since it's not imported in this file yet, I'll assume we need to add the import or pass it.
    // Ideally we import it.
    // For now, let's try to dynamic import or just assume I need to add import line at top.
    // I will add import in a separate edit or assume it's available?
    // No, I must import it. I will use 'require' or just add logic assuming I can fix imports.
    // Actually, I can't easily add import with this tool if I'm replacing the bottom part.
    // I will add the import in a previous step? No, I'll try to do it all here but I can't touch top.
    // I will rely on the fact that I can edit the top part separately or use `apiClient` directly?
    // Using `apiClient` directly is safer if I can't access `inventoryService`.
    // Let's use `apiClient` to fetch /inventory-items

    const fetchInventory = async () => {
      try {
        // Assuming /inventory endpoint exists and returns array
        const response = await import("@/services/inventory.service").then(
          (m) => m.inventoryService.getAll(),
        );
        setInventoryItems(response);
      } catch (e) {
        console.error("Failed to load inventory for recipes");
      }
    };
    fetchInventory();
  }, []);

  const addRecipeItem = () => {
    if (!selectedItemId || recipeQty <= 0) return;

    // Check if already exists
    if (
      formData.recipes?.some(
        (r) => r.inventoryItemId === Number(selectedItemId),
      )
    ) {
      alert("Item ini sudah ada di resep.");
      return;
    }

    const newItem = {
      inventoryItemId: Number(selectedItemId),
      quantity: recipeQty,
    };

    setFormData({
      ...formData,
      recipes: [...(formData.recipes || []), newItem],
    });

    // Reset inputs
    setSelectedItemId("");
    setRecipeQty(0);
  };

  const removeRecipeItem = (itemId: number) => {
    setFormData({
      ...formData,
      recipes: formData.recipes?.filter((r) => r.inventoryItemId !== itemId),
    });
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-sm shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#F0EDE4]">
          <h3 className="text-lg font-light text-[#1A1A1A]">
            {service ? "Edit" : "Tambah"}{" "}
            <span className="font-medium italic text-[#C5A059]">Layanan</span>
          </h3>
          <button
            onClick={onClose}
            className="text-[#A19E95] hover:text-[#1A1A1A]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* ... Basic Info ... */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-2">
              Nama Layanan
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Contoh: Cuci Kering"
              className="w-full px-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-2">
                Harga
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A19E95] text-sm">
                  Rp
                </span>
                <input
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-2">
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
                className="w-full px-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-2">
              Satuan Harga (FR-POS-04)
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
                      ? "border-[#C5A059] bg-[#C5A059]/10 text-[#1A1A1A]"
                      : "border-[#F0EDE4] text-[#A19E95] hover:border-[#C5A059]/50"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recipe Section */}
          <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-sm">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#1A1A1A] mb-3">
              Resep / Bahan Baku (Auto-Deduct)
            </h4>

            <div className="flex gap-2 mb-3">
              <select
                value={selectedItemId}
                onChange={(e) =>
                  setSelectedItemId(Number(e.target.value) || "")
                }
                className="flex-1 px-3 py-2 border border-[#F0EDE4] rounded-sm text-xs bg-white"
              >
                <option value="">-- Pilih Item --</option>
                {inventoryItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.unit})
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Jml"
                className="w-20 px-3 py-2 border border-[#F0EDE4] rounded-sm text-xs"
                value={recipeQty || ""}
                onChange={(e) => setRecipeQty(Number(e.target.value))}
              />
              <button
                onClick={addRecipeItem}
                className="px-3 py-2 bg-[#1A1A1A] text-white rounded-sm hover:bg-[#C5A059]"
              >
                <Plus size={14} />
              </button>
            </div>

            {formData.recipes && formData.recipes.length > 0 ? (
              <div className="space-y-2">
                {formData.recipes.map((recipe, idx) => {
                  const item = inventoryItems.find(
                    (i) => i.id === recipe.inventoryItemId,
                  );
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs bg-white p-2 border border-[#F0EDE4]"
                    >
                      <span>
                        {item?.name || `Item #${recipe.inventoryItemId}`}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">
                          {recipe.quantity} {item?.unit}
                        </span>
                        <button
                          onClick={() =>
                            removeRecipeItem(recipe.inventoryItemId)
                          }
                          className="text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 italic text-center">
                Belum ada resep.
              </p>
            )}
          </div>

          {service && (
            <div className="flex items-center justify-between p-4 bg-[#FAF9F6] rounded-sm">
              <span className="text-[11px] font-medium text-[#1A1A1A]">
                Status Layanan
              </span>
              <button
                onClick={() => setIsActive(!isActive)}
                className="flex items-center gap-2"
              >
                {isActive ? (
                  <>
                    <ToggleRight size={24} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-600">
                      AKTIF
                    </span>
                  </>
                ) : (
                  <>
                    <ToggleLeft size={24} className="text-gray-400" />
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
            className="w-full py-3.5 bg-[#1A1A1A] text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-[#C5A059] transition-colors disabled:opacity-50"
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
