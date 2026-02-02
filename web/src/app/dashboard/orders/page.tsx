"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  ReceiptText,
  Loader2,
  RefreshCw,
  Eye,
  DollarSign,
  X,
  Check,
  Printer,
  MapPin,
  WashingMachine,
  Trash2,
  MessageCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { orderService } from "@/services/order.service";
import { reportService } from "@/services/report.service";
// Import promoService
import { promoService } from "@/services/promo.service";
import type { Order, PayOrderDto, PaymentMethod } from "@/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [showVoidModal, setShowVoidModal] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getAll(1, 50); // Fetch 50 recent orders
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(
    (order) =>
      order.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.phone?.includes(searchQuery),
  );

  const handleWhatsApp = (order: Order) => {
    if (!order.customer?.phone) {
      toast.error("Nomor HP pelanggan tidak tersedia");
      return;
    }

    let phone = order.customer.phone.replace(/\D/g, "");
    if (phone.startsWith("0")) {
      phone = "62" + phone.slice(1);
    }

    const isDone =
      order.statusLaundry === "DONE" || order.statusLaundry === "PICKED_UP";
    const isPaid = order.statusPayment === "PAID";
    const total = order.totalAmount - (order.discountAmount || 0);

    let message = "";

    if (isDone) {
      message = `Halo Kak *${order.customer.name}*,\n\nKabar gembira! Laundry Anda di *Kucucikan* sudah SELESAI dan siap diambil.\n\nNo. Invoice: *${order.invoiceNumber}*\nTotal: *Rp ${Number(total).toLocaleString("id-ID")}*\nInfo: *${isPaid ? "LUNAS" : "BELUM LUNAS"}*\n\nSilakan datang ke outlet kami untuk pengambilan. Terima kasih sudah mempercayakan pakaian Anda pada kami!`;
    } else {
      message = `Halo Kak *${order.customer.name}*,\n\nTerima kasih telah mencuci di *Kucucikan*.\n\nLaundry Anda dengan No. Invoice: *${order.invoiceNumber}* sedang kami proses dengan sepenuh hati.\n\nKami akan kabari lagi jika sudah selesai. Terima kasih!`;
    }

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-[#C5A059]" />
            <span className="text-[10px] font-bold tracking-[0.4em] text-[#C5A059] uppercase">
              Service Registry
            </span>
          </div>
          <h2 className="text-3xl font-light tracking-tight text-[#1A1A1A]">
            Riwayat{" "}
            <span className="font-medium italic text-[#C5A059]">Transaksi</span>
          </h2>
          <p className="text-[#A19E95] text-sm tracking-wide font-light max-w-md">
            Arsip digital aktivitas layanan dan transaksi pelanggan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A19E95]"
              size={16}
            />
            <input
              type="text"
              placeholder="Cari invoice/customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-64 pl-12 pr-4 py-3 bg-white border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059] transition-all"
            />
          </div>
          <button
            onClick={fetchOrders}
            className="p-3 bg-white border border-[#F0EDE4] rounded-sm text-[#A19E95] hover:text-[#C5A059] hover:border-[#C5A059] transition-colors"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {/* Orders Table */}
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
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
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
                        {orderService.getLaundryStatusLabel(
                          order.statusLaundry,
                        )}
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
                        {orderService.getPaymentStatusLabel(
                          order.statusPayment,
                        )}
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
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowVoidModal(true);
                            }}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                            title="Void Transaksi"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        {/* WhatsApp Button */}
                        <button
                          onClick={() => handleWhatsApp(order)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-sm transition-colors"
                          title="Hubungi Pelanggan"
                        >
                          <MessageCircle size={16} />
                        </button>

                        {order.statusPayment !== "PAID" &&
                          order.statusPayment !== "VOID" && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowPayModal(true);
                              }}
                              className="p-2 text-[#C5A059] hover:bg-[#FAF9F6] rounded-sm transition-colors"
                              title="Bayar"
                            >
                              <DollarSign size={16} />
                            </button>
                          )}
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowReceiptModal(true);
                          }}
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

      {/* Pay Modal */}
      {showPayModal && selectedOrder && (
        <PayModal
          order={selectedOrder}
          onClose={() => {
            setShowPayModal(false);
            setSelectedOrder(null);
          }}
          onSuccess={() => {
            setShowPayModal(false);
            setSelectedOrder(null);
            fetchOrders();
          }}
        />
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedOrder && (
        <ReceiptModal
          order={selectedOrder}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* Void Modal */}
      {showVoidModal && selectedOrder && (
        <VoidModal
          order={selectedOrder}
          onClose={() => {
            setShowVoidModal(false);
            setSelectedOrder(null);
          }}
          onSuccess={() => {
            setShowVoidModal(false);
            setSelectedOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}

// Pay Modal Component
function PayModal({
  order,
  onClose,
  onSuccess,
}: {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const remaining =
    currentOrder.totalAmount -
    (currentOrder.discountAmount || 0) -
    currentOrder.paidAmount;
  const [amount, setAmount] = useState<number>(remaining);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);

  const presets = [remaining, 50000, 100000, 200000].filter(
    (v, i, arr) => arr.indexOf(v) === i && v > 0,
  );

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setApplyingPromo(true);
    try {
      const updatedOrder = await promoService.apply(currentOrder.id, promoCode);
      setCurrentOrder(updatedOrder as Order); // Update local state
      toast.success("Promo berhasil dipasang!");
      // Reset amount to new remaining
      const newRemaining =
        updatedOrder.totalAmount -
        (updatedOrder.discountAmount || 0) -
        updatedOrder.paidAmount;
      setAmount(newRemaining);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Promo tidak valid");
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleSubmit = async () => {
    if (amount <= 0) return;

    setLoading(true);
    try {
      await orderService.pay(currentOrder.id, {
        paidAmount: amount,
        paymentMethod: paymentMethod,
      });
      toast.success("Pembayaran berhasil dicatat");
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal memproses pembayaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-sm shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#F0EDE4]">
          <h3 className="text-lg font-light text-[#1A1A1A]">Pembayaran</h3>
          <button
            onClick={onClose}
            className="text-[#A19E95] hover:text-[#1A1A1A]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Order Info */}
          <div className="p-4 bg-[#FAF9F6] rounded-sm space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#A19E95]">Invoice</span>
              <span className="font-bold text-[#1A1A1A]">
                {order.invoiceNumber}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#A19E95]">Total</span>
              <span className="font-medium text-[#1A1A1A]">
                {reportService.formatRevenue(order.totalAmount)}
              </span>
            </div>
            {currentOrder.paidAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#A19E95]">Sudah Bayar</span>
                <span className="text-emerald-600">
                  {reportService.formatRevenue(currentOrder.paidAmount)}
                </span>
              </div>
            )}

            {/* Discount Display */}
            {currentOrder.discountAmount && currentOrder.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#A19E95]">Diskon Promo</span>
                <span className="text-emerald-600 font-bold">
                  - {reportService.formatRevenue(currentOrder.discountAmount)}
                </span>
              </div>
            )}

            {/* Promo Input - Moved inside for better visibility */}
            {(!currentOrder.discountAmount ||
              currentOrder.discountAmount <= 0) && (
              <div className="flex gap-2 py-2 border-t border-[#E5E2D9]">
                <input
                  type="text"
                  placeholder="Punya Kode Promo?"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-1.5 bg-white border border-[#E5E2D9] rounded-sm text-xs outline-none focus:border-[#C5A059]"
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={applyingPromo || !promoCode}
                  className="px-3 py-1.5 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase rounded-sm hover:bg-[#C5A059] disabled:opacity-50 transition-colors"
                >
                  {applyingPromo ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
            )}

            <div className="flex justify-between text-sm pt-2 border-t border-[#E5E2D9]">
              <span className="font-medium text-[#1A1A1A]">Sisa Tagihan</span>
              <span className="font-bold text-[#C5A059]">
                {reportService.formatRevenue(remaining)}
              </span>
            </div>
          </div>

          {/* Preset Amounts */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-2">
              Jumlah Bayar
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {presets.slice(0, 4).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`py-2.5 text-[11px] font-bold rounded-sm transition-all ${
                    amount === preset
                      ? "bg-[#C5A059] text-white"
                      : "bg-[#FAF9F6] text-[#1A1A1A] hover:bg-[#C5A059]/20"
                  }`}
                >
                  {reportService.formatRevenue(preset)}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A19E95] text-sm">
                Rp
              </span>
              <input
                type="number"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          {/* Payment Method Selection - FR-POS-07 */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] block mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["CASH", "QRIS", "TRANSFER", "DEBIT"] as const).map(
                (method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-3 border rounded-sm text-[11px] font-bold transition-all flex items-center justify-center gap-2 ${
                      paymentMethod === method
                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                        : "bg-white text-[#A19E95] border-[#F0EDE4] hover:border-[#1A1A1A]"
                    }`}
                  >
                    {paymentMethod === method && <Check size={12} />}
                    {method}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Change Calculation */}
          {amount > remaining && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm">
              <p className="text-[11px] text-amber-700">
                <strong>Kembalian:</strong>{" "}
                {reportService.formatRevenue(amount - remaining)}
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || amount <= 0}
            className="w-full py-3.5 bg-emerald-500 text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Check size={16} />
                PROSES PEMBAYARAN
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Receipt Modal Component (Struk)
function ReceiptModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Struk - ${order.invoiceNumber}</title>
        <style>
          @page { margin: 0; }
          body { 
            font-family: 'Courier New', monospace; 
            margin: 0; 
            padding: 5px; 
            width: 58mm; /* Ukuran kertas 58mm */
            font-size: 10px; /* Font lebih kecil */
            color: #000;
          }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 5px; }
          .header h1 { font-size: 14px; margin: 0; font-weight: bold; }
          .header p { font-size: 9px; margin: 2px 0; }
          
          .info { margin: 5px 0; font-size: 9px; }
          .info div { display: flex; justify-content: space-between; margin: 2px 0; }
          
          .items { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin: 5px 0; }
          .item { font-size: 9px; margin: 3px 0; }
          .item-name { font-weight: bold; }
          .item-detail { display: flex; justify-content: space-between; }
          
          .total { font-size: 11px; font-weight: bold; display: flex; justify-content: space-between; margin: 5px 0; }
          
          .footer { text-align: center; font-size: 9px; margin-top: 10px; border-top: 1px dashed #000; padding-top: 5px; }
          
          .status { display: inline-block; padding: 2px 6px; border: 1px solid #000; border-radius: 3px; font-size: 9px; font-weight: bold; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>KUCUCIKAN</h1>
          <p>Laundry & Dry Cleaning</p>
          <p>${new Date(order.createdAt).toLocaleString("id-ID")}</p>
        </div>
        
        <div class="info">
          <div><span>No. Invoice:</span><span>${order.invoiceNumber}</span></div>
          <div><span>Pelanggan:</span><span>${order.customer?.name || "-"}</span></div>
          <div><span>Kasir:</span><span>${order.cashier?.username || "-"}</span></div>
          ${order.machine ? `<div><span>Mesin:</span><span>${order.machine.name}</span></div>` : ""}
          ${order.rackLocation ? `<div><span>Rak:</span><span>${order.rackLocation}</span></div>` : ""}
        </div>

        <div class="items">
          ${(order.orderItems || [])
            .map(
              (item: any) => `
            <div class="item">
              <div class="item-name">${item.serviceNameSnapshot}</div>
              <div class="item-detail">
                <span>${item.quantity} x Rp ${Number(item.priceSnapshot).toLocaleString("id-ID")}</span>
                <span>Rp ${Number(item.subtotal).toLocaleString("id-ID")}</span>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>

        <div class="total" style="border-bottom: none; margin-bottom: 2px;">
          <span>SUBTOTAL</span>
          <span>Rp ${Number(order.totalAmount).toLocaleString("id-ID")}</span>
        </div>

        ${
          order.discountAmount && order.discountAmount > 0
            ? `
          <div class="total" style="font-weight: normal; font-size: 9px; margin: 0;">
            <span>Diskon (${order.promo?.code || "PROMO"})</span>
            <span>- Rp ${Number(order.discountAmount).toLocaleString("id-ID")}</span>
          </div>
          <div class="total" style="border-top: 1px dashed #000; margin-top: 5px; padding-top: 5px;">
            <span>TOTAL TAGIHAN</span>
            <span>Rp ${Number(order.totalAmount - order.discountAmount).toLocaleString("id-ID")}</span>
          </div>
          `
            : `
          <div class="total" style="border-top: none; margin-top: 0;">
            <span>TOTAL</span>
            <span>Rp ${Number(order.totalAmount).toLocaleString("id-ID")}</span>
          </div>
          `
        }

        ${
          order.paidAmount > 0
            ? `
          <div class="info" style="margin-top: 5px;">
            <div><span>Dibayar:</span><span>Rp ${Number(order.paidAmount).toLocaleString("id-ID")}</span></div>
            <div><span>Kembalian:</span><span>Rp ${Number(
              order.changeAmount || 0,
            ).toLocaleString("id-ID")}</span></div>
          </div>
        `
            : ""
        }

        <div style="text-align: center; margin: 10px 0;">
          <span class="status">
            ${order.statusPayment === "PAID" ? "LUNAS" : "BELUM LUNAS"}
          </span>
        </div>

        <div class="footer">
          <p>Terima kasih atas kepercayaan Anda!</p>
          <p>Simpan struk ini sebagai bukti pengambilan.</p>
        </div>

        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  const handleSendWA = () => {
    if (!order.customer?.phone) {
      toast.error("Nomor HP pelanggan tidak tersedia");
      return;
    }

    let phone = order.customer.phone.replace(/\D/g, "");
    if (phone.startsWith("0")) {
      phone = "62" + phone.slice(1);
    }

    const message = `Halo ${order.customer.name},
    
Terima kasih telah menggunakan jasa KUCUCIKAN.
Berikut adalah detail transaksi Anda:

No. Invoice: *${order.invoiceNumber}*
Total: *Rp ${Number(order.totalAmount - (order.discountAmount || 0)).toLocaleString("id-ID")}*
Status: *${order.statusPayment === "PAID" ? "LUNAS ✅" : "BELUM LUNAS ❌"}*

Terima kasih!`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-sm shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[#F0EDE4] sticky top-0 bg-white">
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
              Struk Transaksi
            </h3>
            <p className="text-[10px] text-[#A19E95]">{order.invoiceNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendWA}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-sm transition-colors"
              title="Kirim ke WhatsApp"
            >
              <MessageCircle size={18} />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-[#C5A059] hover:bg-[#FAF9F6] rounded-sm transition-colors"
              title="Cetak Struk"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={onClose}
              className="text-[#A19E95] hover:text-[#1A1A1A]"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Header Info */}
          <div className="text-center pb-4 border-b border-dashed border-[#E5E2D9]">
            <h2 className="text-lg font-bold text-[#1A1A1A]">KUCUCIKAN</h2>
            <p className="text-[11px] text-[#A19E95]">Laundry & Dry Cleaning</p>
            <p className="text-[10px] text-[#A19E95] mt-1">
              {new Date(order.createdAt).toLocaleString("id-ID")}
            </p>
          </div>

          {/* Customer & Order Info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#A19E95]">Pelanggan</span>
              <span className="font-medium text-[#1A1A1A]">
                {order.customer?.name || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A19E95]">Telepon</span>
              <span className="text-[#1A1A1A]">
                {order.customer?.phone || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A19E95]">Kasir</span>
              <span className="text-[#1A1A1A]">
                {order.cashier?.username || "-"}
              </span>
            </div>
            {order.machine && (
              <div className="flex justify-between items-center">
                <span className="text-[#A19E95] flex items-center gap-1">
                  <WashingMachine size={12} /> Mesin
                </span>
                <span className="text-[#1A1A1A]">{order.machine.name}</span>
              </div>
            )}
            {order.rackLocation && (
              <div className="flex justify-between items-center">
                <span className="text-[#A19E95] flex items-center gap-1">
                  <MapPin size={12} /> Lokasi Rak
                </span>
                <span className="text-[#1A1A1A]">{order.rackLocation}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="border-t border-b border-dashed border-[#E5E2D9] py-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
              Detail Layanan
            </p>
            {(order.orderItems || []).map((item: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {item.serviceNameSnapshot}
                </p>
                <div className="flex justify-between text-[11px] text-[#A19E95]">
                  <span>
                    {item.quantity} x{" "}
                    {reportService.formatRevenue(item.priceSnapshot)}
                  </span>
                  <span className="font-medium text-[#1A1A1A]">
                    {reportService.formatRevenue(item.subtotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="space-y-2">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-[#1A1A1A]">TOTAL</span>
              <span className="text-[#C5A059]">
                {reportService.formatRevenue(order.totalAmount)}
              </span>
            </div>
            {order.paidAmount > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-[#A19E95]">Dibayar</span>
                  <span className="text-emerald-600">
                    {reportService.formatRevenue(order.paidAmount)}
                  </span>
                </div>
                {order.changeAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A19E95]">Kembalian</span>
                    <span className="text-[#1A1A1A]">
                      {reportService.formatRevenue(order.changeAmount)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Status */}
          <div className="flex justify-center gap-3 pt-2">
            <span
              className={`px-4 py-2 rounded text-[11px] font-bold ${orderService.getPaymentStatusColor(order.statusPayment)}`}
            >
              {orderService.getPaymentStatusLabel(order.statusPayment)}
            </span>
            <span
              className={`px-4 py-2 rounded text-[11px] font-bold bg-opacity-10 ${orderService.getLaundryStatusColor(order.statusLaundry)}`}
            >
              {orderService.getLaundryStatusLabel(order.statusLaundry)}
            </span>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-dashed border-[#E5E2D9]">
            <p className="text-[11px] text-[#A19E95]">
              Terima kasih atas kepercayaan Anda!
            </p>
            <p className="text-[10px] text-[#A19E95]">
              Simpan struk ini sebagai bukti pengambilan.
            </p>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="w-full py-3 bg-[#1A1A1A] text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-[#C5A059] transition-colors flex items-center justify-center gap-2"
          >
            <Printer size={16} />
            Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
}
// Void Modal Component (FR-SEC-03)
function VoidModal({
  order,
  onClose,
  onSuccess,
}: {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!pin) return;
    setLoading(true);
    setError("");

    try {
      await orderService.void(order.id, { ownerPin: pin });
      toast.success("Transaksi berhasil dibatalkan (VOID)");
      onSuccess();
    } catch (err: any) {
      console.error("Error voiding order:", err);
      const msg =
        err.response?.data?.message || "PIN Salah atau terjadi kesalahan";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-sm shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#F0EDE4] bg-red-50">
          <h3 className="text-lg font-light text-red-600">Void Transaksi</h3>
          <button onClick={onClose} className="text-red-400 hover:text-red-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-[#1A1A1A]">
              Anda akan membatalkan order:
            </p>
            <p className="text-xl font-bold text-[#1A1A1A]">
              {order.invoiceNumber}
            </p>
            <p className="text-xs text-[#A19E95]">
              Perlu PIN Owner untuk melanjutkan. Tindakan ini tidak dapat
              dibatalkan.
            </p>
          </div>

          <div>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Masukkan PIN Owner"
              className="w-full px-4 py-3 text-center tracking-widest text-lg border border-[#F0EDE4] rounded-sm outline-none focus:border-red-500"
              maxLength={6}
            />
            {error && (
              <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || pin.length < 4}
            className="w-full py-3.5 bg-red-600 text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "KONFIRMASI VOID"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
