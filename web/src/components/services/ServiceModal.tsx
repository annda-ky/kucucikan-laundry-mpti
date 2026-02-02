"use client";

import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  X,
  Plus,
  ToggleRight,
  ToggleLeft,
  ChevronDown,
  Search,
} from "lucide-react";
import { serviceService } from "@/services/service.service";
import { inventoryService } from "@/services/inventory.service";
import type {
  Service,
  CreateServiceDto,
  UnitType,
  InventoryItem,
} from "@/types";

interface ServiceModalProps {
  service: Service | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ServiceModal({
  service,
  onClose,
  onSuccess,
}: ServiceModalProps) {
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

  // Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Logic to load inventory
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await inventoryService.getAll();
        setInventoryItems(response);
      } catch (e) {
        console.error("Failed to load inventory for recipes");
      }
    };
    fetchInventory();
  }, []);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const addRecipeItem = () => {
    if (!selectedItemId || recipeQty <= 0) return;

    // Check if already exists
    if (
      formData.recipes?.some(
        (r) => r.inventoryItemId === Number(selectedItemId),
      )
    ) {
      alert("Item ini sudah ada di daftar.");
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
    setSearchTerm("");
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

  const filteredInventory = inventoryItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedItemObject = inventoryItems.find(
    (i) => i.id === selectedItemId,
  );

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
              Pemakaian Bahan (Auto-Deduct)
            </h4>

            <div className="flex gap-2 mb-3 z-10 relative">
              {/* Custom Dropdown */}
              <div className="flex-1 relative" ref={dropdownRef}>
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full px-3 py-2 border rounded-sm text-xs cursor-pointer flex items-center justify-between transition-all bg-white ${
                    isDropdownOpen
                      ? "border-[#C5A059] ring-1 ring-[#C5A059]/20"
                      : "border-[#F0EDE4] hover:border-[#C5A059]/50"
                  }`}
                >
                  <span
                    className={
                      selectedItemObject ? "text-[#1A1A1A]" : "text-gray-400"
                    }
                  >
                    {selectedItemObject
                      ? `${selectedItemObject.name} (${selectedItemObject.unit})`
                      : "-- Pilih Item --"}
                  </span>
                  <ChevronDown size={14} className="text-[#A19E95]" />
                </div>

                {/* Dropdown Content */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#F0EDE4] rounded-sm shadow-xl p-2 flex flex-col gap-2 z-50">
                    <div className="relative">
                      <Search
                        size={12}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Cari item..."
                        className="w-full pl-7 pr-2 py-2 border border-[#F0EDE4] rounded-sm text-xs outline-none focus:border-[#C5A059] bg-[#FAF9F6]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="max-h-[150px] overflow-y-auto space-y-1">
                      {filteredInventory.length > 0 ? (
                        filteredInventory.map((item) => (
                          <div
                            key={item.id}
                            className={`p-2 hover:bg-[#FAF9F6] cursor-pointer text-xs rounded-sm flex justify-between items-center transition-colors ${
                              selectedItemId === item.id
                                ? "bg-[#C5A059]/10 text-[#1A1A1A] font-medium"
                                : "text-[#5E5E5E]"
                            }`}
                            onClick={() => {
                              setSelectedItemId(item.id);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <span>{item.name}</span>
                            <span className="text-[10px] text-[#A19E95]">
                              {item.unit}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-400 text-[10px] italic">
                          Item tidak ditemukan
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <input
                type="number"
                placeholder="Jml"
                className="w-20 px-3 py-2 border border-[#F0EDE4] rounded-sm text-xs outline-none focus:border-[#C5A059]"
                value={recipeQty || ""}
                onChange={(e) => setRecipeQty(Number(e.target.value))}
              />
              <button
                onClick={addRecipeItem}
                className="px-3 py-2 bg-[#1A1A1A] text-white rounded-sm hover:bg-[#C5A059] transition-colors"
                title="Tambah item"
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
                      className="flex items-center justify-between text-xs bg-white p-2 border border-[#F0EDE4] rounded-sm group hover:border-[#F0EDE4] transition-colors"
                    >
                      <span className="font-medium text-[#1A1A1A]">
                        {item?.name || `Item #${recipe.inventoryItemId}`}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[#C5A059]">
                          {recipe.quantity} {item?.unit}
                        </span>
                        <button
                          onClick={() =>
                            removeRecipeItem(recipe.inventoryItemId)
                          }
                          className="text-[#A19E95] hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-gray-300 border border-dashed border-gray-200 rounded-sm bg-[#FAF9F6]">
                <p className="text-[10px] italic">
                  Belum ada bahan yang dipilih.
                </p>
              </div>
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
