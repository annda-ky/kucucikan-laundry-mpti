"use client";

import { useState } from "react";
import { X, Loader2, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { orderService } from "@/services/order.service";
import { reportService } from "@/services/report.service";
import { promoService } from "@/services/promo.service";
import type { Order, PaymentMethod } from "@/types";

interface PayModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

export function PayModal({ order, onClose, onSuccess }: PayModalProps) {
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
