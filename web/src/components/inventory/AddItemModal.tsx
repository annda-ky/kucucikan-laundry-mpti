"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { inventoryService } from "@/services/inventory.service";
import type { CreateInventoryItemDto } from "@/types";

interface AddItemModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddItemModal({ onClose, onSuccess }: AddItemModalProps) {
  const [formData, setFormData] = useState<CreateInventoryItemDto>({
    name: "",
    unit: "ml", // Default to ml for safety
    stockQuantity: 0,
    minStockAlert: 100,
  });
  const [inputUnit, setInputUnit] = useState<
    "ml" | "liter" | "gr" | "kg" | "pcs"
  >("liter"); // Default smart input
  const [inputValue, setInputValue] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  // Auto-convert input to base unit (ml/gr)
  useEffect(() => {
    if (typeof inputValue === "number") {
      let multiplier = 1;
      if (inputUnit === "liter" || inputUnit === "kg") multiplier = 1000;

      setFormData((prev) => ({
        ...prev,
        stockQuantity: inputValue * multiplier,
        unit:
          inputUnit === "liter" || inputUnit === "ml"
            ? "ml"
            : inputUnit === "kg" || inputUnit === "gr"
              ? "gr"
              : "pcs",
      }));
    }
  }, [inputValue, inputUnit]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.unit) return;

    setLoading(true);
    try {
      await inventoryService.create(formData);
      toast.success("Item berhasil ditambahkan");
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal menambah item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-sm shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#F0EDE4]">
          <h3 className="text-lg font-light text-[#1A1A1A]">Tambah Item</h3>
          <button
            onClick={onClose}
            className="text-[#A19E95] hover:text-[#1A1A1A]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-2">
              Nama Item
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Contoh: Deterjen Cair"
              className="w-full px-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Smart Unit Selection */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-2">
                Satuan Beli
              </label>
              <select
                value={inputUnit}
                onChange={(e) => setInputUnit(e.target.value as any)}
                className="w-full px-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059] bg-white"
              >
                <option value="liter">Liter (L)</option>
                <option value="ml">Mililiter (ml)</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="gr">Gram (gr)</option>
                <option value="pcs">Pcs</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-2">
                Jumlah Beli
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(Number(e.target.value))}
                placeholder="0"
                className="w-full px-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          {/* Conversion Preview */}
          <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-sm">
            Akan disimpan sebagai:{" "}
            <strong>
              {formData.stockQuantity} {formData.unit}
            </strong>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-2">
              Batas Minimum Alert ({formData.unit})
            </label>
            <input
              type="number"
              value={formData.minStockAlert || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minStockAlert: Number(e.target.value),
                })
              }
              placeholder="100"
              className="w-full px-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !formData.name}
            className="w-full py-3.5 bg-[#1A1A1A] text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-[#C5A059] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin mx-auto" />
            ) : (
              "SIMPAN"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
