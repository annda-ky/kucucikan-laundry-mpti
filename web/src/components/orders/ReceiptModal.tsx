"use client";

import {
  X,
  Printer,
  MessageCircle,
  WashingMachine,
  MapPin,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { orderService } from "@/services/order.service";
import { reportService } from "@/services/report.service";
import type { Order } from "@/types";

interface ReceiptModalProps {
  order: Order;
  onClose: () => void;
}

export function ReceiptModal({ order, onClose }: ReceiptModalProps) {
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
