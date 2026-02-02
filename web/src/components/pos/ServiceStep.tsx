"use client";

import { ArrowRight } from "lucide-react";
import { serviceService } from "@/services/service.service";
import type { Service } from "@/types";

interface CartItem {
  service: Service;
  quantity: number;
}

interface ServiceStepProps {
  services: Service[];
  cart: CartItem[];
  onUpdateCart: (service: Service, quantity: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export function ServiceStep({
  services,
  cart,
  onUpdateCart,
  onBack,
  onNext,
}: ServiceStepProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
        Pilih Layanan & Masukkan Jumlah
      </h3>

      <div className="space-y-3">
        {services.map((service) => {
          const inCart = cart.find((c) => c.service.id === service.id);
          const unitLabel = serviceService.getUnitTypeShort(service.unitType);

          return (
            <div
              key={service.id}
              className={`flex items-center justify-between p-4 rounded-sm border transition-all ${
                inCart && inCart.quantity > 0
                  ? "border-[#C5A059] bg-[#C5A059]/5"
                  : "border-[#F0EDE4]"
              }`}
            >
              {/* Service Info */}
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {serviceService.getIcon(service.name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {service.name}
                  </p>
                  <p className="text-[11px] text-[#C5A059] font-medium">
                    {serviceService.formatPrice(service.price)}/{unitLabel}
                  </p>
                </div>
              </div>

              {/* Direct Input */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step={service.unitType === "KG" ? "0.1" : "1"}
                  placeholder="0"
                  value={inCart?.quantity || ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    onUpdateCart(service, val);
                  }}
                  className="w-20 px-3 py-2 border border-[#F0EDE4] rounded-sm text-center text-sm font-bold outline-none focus:border-[#C5A059] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[11px] font-bold text-[#A19E95] w-8">
                  {unitLabel}
                </span>

                {/* Subtotal */}
                {inCart && inCart.quantity > 0 && (
                  <span className="text-sm font-bold text-[#C5A059] min-w-[80px] text-right">
                    {serviceService.formatPrice(
                      service.price * inCart.quantity,
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-[#F0EDE4] text-[#A19E95] text-[11px] font-bold tracking-[0.15em] uppercase rounded-sm hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
        >
          Kembali
        </button>
        <button
          onClick={onNext}
          disabled={cart.length === 0 || cart.every((c) => c.quantity <= 0)}
          className="flex-1 py-3 bg-[#1A1A1A] text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-[#C5A059] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          Lanjut Pilih Mesin
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
