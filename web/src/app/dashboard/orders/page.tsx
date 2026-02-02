"use client";

import { useState, useEffect } from "react";
import { Search, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { orderService } from "@/services/order.service";
import type { Order } from "@/types";
import { OrderTable } from "@/components/orders/OrderTable";
import { PayModal } from "@/components/orders/PayModal";
import { ReceiptModal } from "@/components/orders/ReceiptModal";
import { VoidModal } from "@/components/orders/VoidModal";

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

      {/* Orders Table Component */}
      <OrderTable
        orders={filteredOrders}
        loading={loading}
        searchQuery={searchQuery}
        onPay={(order) => {
          setSelectedOrder(order);
          setShowPayModal(true);
        }}
        onVoid={(order) => {
          setSelectedOrder(order);
          setShowVoidModal(true);
        }}
        onReceipt={(order) => {
          setSelectedOrder(order);
          setShowReceiptModal(true);
        }}
        onWhatsApp={handleWhatsApp}
      />

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
