"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { inventoryService } from "@/services/inventory.service";
import type { InventoryItem, UpdateStockDto } from "@/types";

interface UpdateStockModalProps {
  item: InventoryItem;
  action: "add" | "remove";
  onClose: () => void;
  onSuccess: () => void;
}

export function UpdateStockModal({
  item,
  action,
  onClose,
  onSuccess,
}: UpdateStockModalProps) {
  const [inputValue, setInputValue] = useState<number | "">("");
  const [inputUnit, setInputUnit] = useState<"base" | "large">("large"); // large = Liter/Kg, base = ml/gr
  const [loading, setLoading] = useState(false);

  // Determine units based on item.unit
  const isLiquid = item.unit === "ml";
  const isWeight = item.unit === "gr";
  const canConvert = isLiquid || isWeight;

  const largeUnitLabel = isLiquid ? "Liter" : isWeight ? "Kg" : "Pcs";
  const baseUnitLabel = item.unit;

  const handleSubmit = async () => {
    if (!inputValue || inputValue <= 0) return;

    setLoading(true);
    try {
      let changeAmount = Number(inputValue);

      // Apply conversion if "Large Unit" is selected
      if (canConvert && inputUnit === "large") {
        changeAmount *= 1000;
      }

      // Apply negative sign for removal
      if (action === "remove") {
        changeAmount = -changeAmount;
      }

      const data: UpdateStockDto = {
        changeAmount: changeAmount,
        type: action === "add" ? "PURCHASE" : "USAGE",
      };
      await inventoryService.updateStock(item.id, data);
      toast.success("Stok berhasil diperbarui");
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal update stok");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-xs bg-white rounded-sm shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#F0EDE4]">
          <h3 className="text-lg font-light text-[#1A1A1A]">
            {action === "add" ? "Tambah Stok" : "Kurangi Stok"}
          </h3>
          <button
            onClick={onClose}
            className="text-[#A19E95] hover:text-[#1A1A1A]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-sm font-medium text-[#1A1A1A]">{item.name}</p>
            <p className="text-[11px] text-[#A19E95]">
              Stok saat ini: {item.stockQuantity} {item.unit}
            </p>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-2">
                Jumlah
              </label>
              <input
                type="number"
                min={1}
                value={inputValue}
                onChange={(e) => setInputValue(Number(e.target.value))}
                placeholder="0"
                className="w-full px-4 py-3 border border-[#F0EDE4] rounded-sm text-sm text-center outline-none focus:border-[#C5A059]"
              />
            </div>
            {canConvert && (
              <div className="w-24">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-2">
                  Satuan
                </label>
                <select
                  value={inputUnit}
                  onChange={(e) => setInputUnit(e.target.value as any)}
                  className="w-full px-2 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059] bg-white"
                >
                  <option value="large">{largeUnitLabel}</option>
                  <option value="base">{baseUnitLabel}</option>
                </select>
              </div>
            )}
          </div>

          {canConvert && inputValue && inputUnit === "large" && (
            <p className="text-xs text-center text-blue-600">
              = {Number(inputValue) * 1000} {item.unit}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !inputValue}
            className={`w-full py-3.5 text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm transition-colors disabled:opacity-50 ${
              action === "add"
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin mx-auto" />
            ) : action === "add" ? (
              "TAMBAH STOK"
            ) : (
              "KURANGI STOK"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
