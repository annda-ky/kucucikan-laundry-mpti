"use client";

import { useState, useEffect } from "react";
import { Boxes, PackagePlus, ArrowDownLeft, AlertCircle } from "lucide-react";
// Assuming inventory service exists, if not I'll mock it or use a placeholder
import { inventoryService } from "@/services/inventory.service";
import type { InventoryItem } from "@/types";

export default function OwnerInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await inventoryService.getAll();
        setItems(data);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light text-white tracking-tight">
          Stok{" "}
          <span className="text-[#C5A059] font-medium italic">Inventaris</span>
        </h1>
        <p className="text-[#808080] text-sm">
          Monitor persediaan barang operasional
        </p>
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#2A2A2A] bg-[#0F0F0F]">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080]">
                Item
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080]">
                Stok
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080]">
                Min. Stok
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080]">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2A]">
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-[#C5A059]/5 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#2A2A2A] rounded-sm text-[#C5A059]">
                      <Boxes size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-[#808080]">{item.unit}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-white">
                    {item.stockQuantity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-[#808080]">
                    {item.minStockAlert}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {item.stockQuantity <= item.minStockAlert ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold rounded">
                      <AlertCircle size={10} /> LOW STOCK
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded">
                      AMAN
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
