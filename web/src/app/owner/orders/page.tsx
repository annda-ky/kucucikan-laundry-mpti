"use client";

import { useState, useEffect } from "react";
import { History, Search, Filter, Eye, DollarSign } from "lucide-react";
import { orderService } from "@/services/order.service";
import { reportService } from "@/services/report.service";
import type { Order } from "@/types";

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getAll(page, 10);
      setOrders(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (page < meta.totalPages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight">
            Riwayat{" "}
            <span className="text-[#C5A059] font-medium italic">Transaksi</span>
          </h1>
          <p className="text-[#808080] text-sm">
            Semua transaksi yang tercatat di sistem (Total: {meta.total})
          </p>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#2A2A2A] bg-[#0F0F0F]">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080]">
                  Invoice
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080]">
                  Date
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080]">
                  Customer
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080]">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080] text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="animate-pulse text-[#C5A059]">
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#C5A059]/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-white">
                        {order.invoiceNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-[#808080]">
                        {new Date(order.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-white">
                          {order.customer?.name || "-"}
                        </span>
                        <span className="text-[10px] text-[#808080]">
                          {order.customer?.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase ${orderService.getLaundryStatusColor(order.statusLaundry)}`}
                        >
                          {orderService.getLaundryStatusLabel(
                            order.statusLaundry,
                          )}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 rounded ${
                            order.statusPayment === "PAID"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {order.statusPayment}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-medium text-[#C5A059]">
                        {reportService.formatRevenue(order.totalAmount)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-[#808080]"
                  >
                    Tidak ada data transaksi found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 border-t border-[#2A2A2A] flex items-center justify-between">
          <span className="text-xs text-[#808080]">
            Page {meta.page} of {meta.totalPages} ({meta.total} records)
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-bold text-white bg-[#2A2A2A] rounded-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3A3A3A] transition-colors"
            >
              PREV
            </button>
            <button
              onClick={handleNextPage}
              disabled={page >= meta.totalPages}
              className="px-3 py-1.5 text-xs font-bold text-[#0F0F0F] bg-[#C5A059] rounded-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#D5B069] transition-colors"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
