"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { inventoryService } from "@/services/inventory.service";
import { formatDisplayUnit } from "@/lib/utils";
import type { InventoryItem, InventoryLog } from "@/types";

interface StockHistoryModalProps {
  item: InventoryItem;
  onClose: () => void;
}

export function StockHistoryModal({ item, onClose }: StockHistoryModalProps) {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await inventoryService.getLogs(item.id);
        setLogs(data);
      } catch (error) {
        console.error("Error fetching logs:", error);
        toast.error("Gagal memuat riwayat");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [item.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-6 border-b border-[#F0EDE4]">
          <div>
            <h3 className="text-lg font-light text-[#1A1A1A]">Riwayat Stok</h3>
            <p className="text-xs text-[#A19E95] mt-1">
              {item.name} ({formatDisplayUnit(item.stockQuantity, item.unit)})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#A19E95] hover:text-[#1A1A1A]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-0">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-[#C5A059]" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-[#A19E95] text-sm">
              Belum ada riwayat transaksi.
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-[#FAF9F6] text-[#A19E95] font-medium text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Waktu</th>
                  <th className="px-6 py-3">Aktivitas</th>
                  <th className="px-6 py-3 text-right">Jumlah</th>
                  <th className="px-6 py-3 text-right">Oleh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE4]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 text-[#1A1A1A]">
                      {new Date(log.createdAt).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.type === "PURCHASE"
                            ? "bg-emerald-50 text-emerald-600"
                            : log.type === "USAGE"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {log.type === "PURCHASE"
                          ? "BELI"
                          : log.type === "USAGE"
                            ? "PAKAI"
                            : "ADJUST"}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-3 text-right font-medium ${
                        log.changeAmount > 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {log.changeAmount > 0 ? "+" : ""}
                      {formatDisplayUnit(log.changeAmount, item.unit).replace(
                        item.unit,
                        "",
                      )}{" "}
                      {log.changeAmount} {item.unit}
                    </td>
                    <td className="px-6 py-3 text-right text-[#A19E95] text-xs">
                      {log.actor?.username || "System"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-[#F0EDE4] bg-[#FAF9F6]">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white border border-[#E5E2D9] text-[#1A1A1A] text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:border-[#C5A059] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
