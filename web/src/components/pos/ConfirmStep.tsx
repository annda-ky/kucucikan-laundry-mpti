"use client";

import { Check, Loader2, StickyNote, WashingMachine } from "lucide-react";
import { serviceService } from "@/services/service.service";
import type { Customer, Machine, Service } from "@/types";

interface CartItem {
  service: Service;
  quantity: number;
}

interface ConfirmStepProps {
  customerName: string;
  customerPhone: string;
  machine: Machine | null;
  cart: CartItem[];
  note: string;
  onUpdateNote: (note: string) => void;
  total: number;
  submitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export function ConfirmStep({
  customerName,
  customerPhone,
  machine,
  cart,
  note,
  onUpdateNote,
  total,
  submitting,
  onBack,
  onSubmit,
}: ConfirmStepProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
        Konfirmasi Order
      </h3>

      {/* Customer Info */}
      <div className="p-4 bg-[#FAF9F6] rounded-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] mb-2">
          Pelanggan
        </p>
        <p className="text-sm font-medium text-[#1A1A1A]">{customerName}</p>
        <p className="text-[11px] text-[#A19E95]">{customerPhone}</p>
      </div>

      {/* Machine Info */}
      <div className="p-4 bg-[#FAF9F6] rounded-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] mb-2">
          Mesin Cuci
        </p>
        <div className="flex items-center gap-2">
          <WashingMachine size={18} className="text-[#C5A059]" />
          <p className="text-sm font-medium text-[#1A1A1A]">{machine?.name}</p>
        </div>
      </div>

      {/* Note Input */}
      <div className="p-4 bg-[#FAF9F6] rounded-sm space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] flex items-center gap-2">
          <StickyNote size={12} />
          Catatan Order
        </p>
        <textarea
          value={note}
          onChange={(e) => onUpdateNote(e.target.value)}
          placeholder="Tambahkan catatan khusus (opsional)..."
          className="w-full p-2 bg-white border border-[#E5E2D9] rounded-sm text-sm outline-none focus:border-[#C5A059] min-h-[80px]"
        />
      </div>

      {/* Items */}
      <div className="p-4 bg-[#FAF9F6] rounded-sm space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
          Layanan
        </p>
        {cart.map((item) => (
          <div
            key={item.service.id}
            className="flex items-center justify-between py-2 border-b border-[#E5E2D9] last:border-0"
          >
            <div className="flex items-center gap-2">
              <span>{serviceService.getIcon(item.service.name)}</span>
              <span className="text-sm text-[#1A1A1A]">
                {item.service.name}
              </span>
              <span className="text-[11px] text-[#A19E95]">
                {item.quantity}{" "}
                {serviceService.getUnitTypeShort(item.service.unitType)}
              </span>
            </div>
            <span className="text-sm font-medium text-[#1A1A1A]">
              {serviceService.formatPrice(item.service.price * item.quantity)}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2 border-t border-[#1A1A1A]/10">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#1A1A1A]">
            Total
          </span>
          <span className="text-lg font-bold text-[#C5A059]">
            {serviceService.formatPrice(total)}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-[#F0EDE4] text-[#A19E95] text-[11px] font-bold tracking-[0.15em] uppercase rounded-sm hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
        >
          Kembali
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 py-3.5 bg-emerald-500 text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Check size={16} />
              Buat Order
            </>
          )}
        </button>
      </div>
    </div>
  );
}
