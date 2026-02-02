"use client";

import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { serviceService } from "@/services/service.service";
import type { Service } from "@/types";

interface CartItem {
  service: Service;
  quantity: number;
}

interface CartSummaryProps {
  cart: CartItem[];
  onUpdateQuantity: (serviceId: number, quantity: number) => void;
  onReset: () => void;
}

export function CartSummary({
  cart,
  onUpdateQuantity,
  onReset,
}: CartSummaryProps) {
  const total = cart.reduce(
    (sum, item) => sum + item.service.price * item.quantity,
    0,
  );

  return (
    <div className="bg-white border border-[#F0EDE4] rounded-sm p-6 h-fit sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingCart size={18} className="text-[#C5A059]" />
        <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
          Keranjang
        </h3>
      </div>

      {cart.length > 0 ? (
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.service.id}
              className="flex items-center justify-between py-3 border-b border-[#F0EDE4]"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {serviceService.getIcon(item.service.name)}
                </span>
                <div>
                  <p className="text-[11px] font-medium text-[#1A1A1A]">
                    {item.service.name}
                  </p>
                  <p className="text-[10px] text-[#A19E95]">
                    {item.quantity}{" "}
                    {serviceService.getUnitTypeShort(item.service.unitType)} ×{" "}
                    {serviceService.formatPrice(item.service.price)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onUpdateQuantity(item.service.id, item.quantity - 1)
                  }
                  className="w-6 h-6 flex items-center justify-center border border-[#F0EDE4] rounded text-[#A19E95] hover:border-[#C5A059] hover:text-[#C5A059]"
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-[11px] font-bold">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    onUpdateQuantity(item.service.id, item.quantity + 1)
                  }
                  className="w-6 h-6 flex items-center justify-center border border-[#F0EDE4] rounded text-[#A19E95] hover:border-[#C5A059] hover:text-[#C5A059]"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-[#1A1A1A]/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
                Total
              </span>
              <span className="text-xl font-bold text-[#C5A059]">
                {serviceService.formatPrice(total)}
              </span>
            </div>
          </div>

          <button
            onClick={onReset}
            className="w-full py-2 text-[10px] font-bold text-red-500 hover:bg-red-50 rounded-sm transition-colors flex items-center justify-center gap-1"
          >
            <Trash2 size={12} />
            Kosongkan
          </button>
        </div>
      ) : (
        <div className="text-center py-8 text-[#A19E95]">
          <ShoppingCart
            size={24}
            strokeWidth={1}
            className="mx-auto mb-2 opacity-50"
          />
          <p className="text-[11px]">Keranjang kosong</p>
        </div>
      )}
    </div>
  );
}
