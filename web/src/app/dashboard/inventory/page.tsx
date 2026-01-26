"use client";

import { apiClient, getErrorMessage } from "@/lib/api-client";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

import { useState, useEffect } from "react";
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  Package,
  Loader2,
  X,
  Minus,
  Trash2,
} from "lucide-react";
import { inventoryService } from "@/services/inventory.service";
import type {
  InventoryItem,
  CreateInventoryItemDto,
  UpdateStockDto,
  InventoryLogType,
} from "@/types";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [stockAction, setStockAction] = useState<"add" | "remove" | null>(null);

  const fetchItems = async () => {
    try {
      const data = await inventoryService.getAll();
      setItems(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const lowStockItems = inventoryService.getLowStockItems(items);

  // --- Modal State ---
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: "danger" | "warning" | "info";
    isLoading: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "info",
    isLoading: false,
  });

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDelete = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Item Inventory",
      message:
        "Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.",
      variant: "danger",
      isLoading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        try {
          await inventoryService.delete(id);
          closeConfirmModal();
          fetchItems();
          // Optional: Toast success here if needed, but fetchItems updates UI
        } catch (error) {
          console.error("Error deleting item:", error);
          // Show error in a new modal state or via toast.
          // For now, let's close the confirm modal and show an error modal or reuse logic?
          // Simplest is to update the confirm modal to show error or close it and show alert (the user said no alert).
          // Better: Close confirm, and show Error via Alert/Toast (User uses react-hot-toast elsewhere? No, inventory page doesn't seem to import it yet. Users page does.)
          // Let's import toast or show error in modal?
          // Since user requested custom alert even for errors, let's change message.

          setConfirmModal({
            isOpen: true,
            title: "Gagal Menghapus",
            message: getErrorMessage(error),
            variant: "danger",
            isLoading: false,
            onConfirm: closeConfirmModal, // Close on OK
            confirmLabel: "Tutup",
            cancelLabel: "", // Hide cancel
          } as any);
        }
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-[#C5A059]" />
            <span className="text-[10px] font-bold tracking-[0.4em] text-[#C5A059] uppercase">
              Stock Management
            </span>
          </div>
          <h2 className="text-3xl font-light tracking-tight text-[#1A1A1A]">
            Master{" "}
            <span className="font-medium italic text-[#C5A059]">Inventory</span>
          </h2>
          <p className="text-[#A19E95] text-sm tracking-wide font-light">
            Kelola stok sabun, parfum, dan perlengkapan laundry.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1A] text-white text-[10px] font-bold tracking-[0.15em] rounded-sm hover:bg-[#C5A059] transition-colors"
        >
          <Plus size={14} />
          TAMBAH ITEM
        </button>
      </header>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm flex items-center gap-4">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {lowStockItems.length} item hampir habis
            </p>
            <p className="text-[12px] text-amber-600">
              {lowStockItems.map((i) => i.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A19E95]"
        />
        <input
          type="text"
          placeholder="Cari item..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059] transition-all"
        />
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-[#C5A059]" />
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const status = inventoryService.getStockStatus(item);
            return (
              <div
                key={item.id}
                className="p-6 bg-white border border-[#F0EDE4] rounded-sm hover:border-[#C5A059]/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FAF9F6] rounded-sm flex items-center justify-center">
                      <Package size={18} className="text-[#C5A059]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#1A1A1A]">
                        {item.name}
                      </h3>
                      <p className="text-[10px] text-[#A19E95]">{item.unit}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-2 py-1 text-[9px] font-bold rounded ${status.color}`}
                    >
                      {status.label}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                      title="Hapus Item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-light text-[#1A1A1A]">
                      {item.stockQuantity}
                    </p>
                    <p className="text-[10px] text-[#A19E95]">
                      Min: {item.minStockAlert} {item.unit}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setStockAction("add");
                      }}
                      className="p-2 bg-emerald-50 text-emerald-600 rounded-sm hover:bg-emerald-100 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setStockAction("remove");
                      }}
                      className="p-2 bg-red-50 text-red-600 rounded-sm hover:bg-red-100 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-[#F0EDE4] rounded-sm">
          <Boxes
            size={40}
            strokeWidth={1}
            className="mx-auto mb-4 text-[#E5E2D9]"
          />
          <p className="text-[#A19E95]">
            {searchQuery
              ? "Tidak ada item ditemukan"
              : "Belum ada data inventory"}
          </p>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchItems();
          }}
        />
      )}

      {/* Update Stock Modal */}
      {selectedItem && stockAction && (
        <UpdateStockModal
          item={selectedItem}
          action={stockAction}
          onClose={() => {
            setSelectedItem(null);
            setStockAction(null);
          }}
          onSuccess={() => {
            setSelectedItem(null);
            setStockAction(null);
            fetchItems();
          }}
        />
      )}
    </div>
  );
}

// Add Item Modal
function AddItemModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<CreateInventoryItemDto>({
    name: "",
    unit: "",
    stockQuantity: 0,
    minStockAlert: 5,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.unit) return;

    setLoading(true);
    try {
      await inventoryService.create(formData);
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
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
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-2">
                Satuan
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                placeholder="liter, pcs, kg"
                className="w-full px-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-2">
                Stok Awal
              </label>
              <input
                type="number"
                value={formData.stockQuantity || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stockQuantity: Number(e.target.value),
                  })
                }
                placeholder="0"
                className="w-full px-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-2">
              Batas Minimum Stok
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
              placeholder="5"
              className="w-full px-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !formData.name || !formData.unit}
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

// Update Stock Modal
function UpdateStockModal({
  item,
  action,
  onClose,
  onSuccess,
}: {
  item: InventoryItem;
  action: "add" | "remove";
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (amount <= 0) return;

    setLoading(true);
    try {
      const data: UpdateStockDto = {
        changeAmount: action === "add" ? amount : -amount,
        type: action === "add" ? "PURCHASE" : "USAGE",
      };
      await inventoryService.updateStock(item.id, data);
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
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

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-2">
              Jumlah
            </label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-3 border border-[#F0EDE4] rounded-sm text-sm text-center outline-none focus:border-[#C5A059]"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || amount <= 0}
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
