"use client";

import {
  Trash2,
  MessageCircle,
  DollarSign,
  Eye,
  ReceiptText,
} from "lucide-react";
import { orderService } from "@/services/order.service";
import { reportService } from "@/services/report.service";
import type { Order } from "@/types";

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  searchQuery?: string;
  onPay: (order: Order) => void;
  onVoid: (order: Order) => void;
  onReceipt: (order: Order) => void;
  onWhatsApp: (order: Order) => void;
}

export function OrderTable({
  orders,
  loading,
  searchQuery,
  onPay,
  onVoid,
  onReceipt,
  onWhatsApp,
}: OrderTableProps) {
  return (
    <div className="bg-white border border-[#F0EDE4] rounded-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#F0EDE4] bg-[#FAF9F6]">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
                Invoice
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A19E95]">
                Pelanggan
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A19E95]">
                Status Laundry
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A19E95]">
                Pembayaran
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A19E95] text-right">
                Total
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A19E95] text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EDE4]">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-6">
                    <div className="h-4 bg-[#FAF9F6] rounded w-full" />
                  </td>
                </tr>
              ))
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-[#FAF9F6]/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-[12px] font-bold tracking-wider text-[#1A1A1A]">
                      {order.invoiceNumber}
                    </p>
                    <p className="text-[10px] text-[#A19E95] mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#1A1A1A]">
                      {order.customer?.name || "-"}
                    </p>
                    <p className="text-[10px] text-[#A19E95]">
                      {order.customer?.phone || "-"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-[0.1em] ${orderService.getLaundryStatusColor(
                        order.statusLaundry,
                      )}`}
                    >
                      {orderService.getLaundryStatusLabel(order.statusLaundry)}
                    </span>
                    {order.rackLocation && (
                      <p className="text-[9px] text-[#A19E95] mt-0.5">
                        Rak: {order.rackLocation}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {/* FR-POS-05: Status Bayar Tegas */}
                    <span
                      className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold ${orderService.getPaymentStatusColor(
                        order.statusPayment,
                      )}`}
                    >
                      {orderService.getPaymentStatusLabel(order.statusPayment)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {reportService.formatRevenue(order.totalAmount)}
                    </p>
                    {order.paidAmount > 0 &&
                      order.paidAmount < order.totalAmount && (
                        <p className="text-[10px] text-emerald-600">
                          Dibayar:{" "}
                          {reportService.formatRevenue(order.paidAmount)}
                        </p>
                      )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {order.statusPayment !== "VOID" && (
                        <button
                          onClick={() => onVoid(order)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                          title="Void Transaksi"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      {/* WhatsApp Button */}
                      <button
                        onClick={() => onWhatsApp(order)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-sm transition-colors"
                        title="Hubungi Pelanggan"
                      >
                        <MessageCircle size={16} />
                      </button>

                      {order.statusPayment !== "PAID" &&
                        order.statusPayment !== "VOID" && (
                          <button
                            onClick={() => onPay(order)}
                            className="p-2 text-[#C5A059] hover:bg-[#FAF9F6] rounded-sm transition-colors"
                            title="Bayar"
                          >
                            <DollarSign size={16} />
                          </button>
                        )}
                      <button
                        onClick={() => onReceipt(order)}
                        className="p-2 text-[#A19E95] hover:text-[#1A1A1A] hover:bg-[#FAF9F6] rounded-sm transition-colors"
                        title="Lihat Struk"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-16 text-center text-[#A19E95]"
                >
                  <ReceiptText
                    size={32}
                    strokeWidth={1}
                    className="mx-auto mb-3 opacity-50"
                  />
                  <p>
                    {searchQuery
                      ? "Tidak ada transaksi ditemukan"
                      : "Belum ada transaksi"}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
