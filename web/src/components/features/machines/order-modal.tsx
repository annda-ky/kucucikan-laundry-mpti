"use client";

import { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  Package,
  ArrowRight,
  Waves,
  Search,
  Loader2,
  StickyNote,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { serviceService } from "@/services/service.service";
import { customerService } from "@/services/customer.service";
import type { Service, Customer, CreateOrderItemDto } from "@/types";

interface OrderModalProps {
  machineName: string;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function OrderModal({
  machineName,
  onClose,
  onSubmit,
}: OrderModalProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
  const [note, setNote] = useState("");
  const [cart, setCart] = useState<{ service: Service; quantity: number }[]>(
    [],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData] = await Promise.all([serviceService.getActive()]);
        setServices(servicesData);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Search customers by phone (FR-POS-03: 4 digit search)
  useEffect(() => {
    const search = async () => {
      if (phoneSearch.length >= 4) {
        try {
          const results = await customerService.searchByPhone(phoneSearch);
          setCustomers(results);
        } catch {
          setCustomers([]);
        }
      } else {
        setCustomers([]);
      }
    };
    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [phoneSearch]);

  const addToCart = (service: Service) => {
    const existing = cart.find((c) => c.service.id === service.id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.service.id === service.id ? { ...c, quantity: c.quantity + 1 } : c,
        ),
      );
    } else {
      setCart([...cart, { service, quantity: 1 }]);
    }
  };

  const removeFromCart = (serviceId: number) => {
    setCart(cart.filter((c) => c.service.id !== serviceId));
  };

  const updateQuantity = (serviceId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(serviceId);
    } else {
      setCart(
        cart.map((c) => (c.service.id === serviceId ? { ...c, quantity } : c)),
      );
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + item.service.price * item.quantity,
    0,
  );

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    if (!selectedCustomer && (!newCustomer.name || !newCustomer.phone)) return;

    setSubmitting(true);
    try {
      // Create customer if new
      let customerId = selectedCustomer?.id;
      if (!customerId && newCustomer.name && newCustomer.phone) {
        const customer = await customerService.create(newCustomer);
        customerId = customer.id;
      }

      const items: CreateOrderItemDto[] = cart.map((c) => ({
        serviceId: c.service.id,
        quantity: c.quantity,
      }));

      await onSubmit({
        customerId,
        items,
        note,
      });
      toast.success("Order berhasil dibuat");
    } catch (error: any) {
      console.error("Error:", error);
      const msg = error.response?.data?.message || "Gagal memproses order";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A1A1A]/30 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-white rounded-sm shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 flex justify-between items-start border-b border-[#F0EDE4] flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-[1px] w-4 bg-[#C5A059]" />
              <span className="text-[9px] font-bold tracking-[0.3em] text-[#C5A059] uppercase">
                New Order
              </span>
            </div>
            <h3 className="text-xl font-light text-[#1A1A1A]">
              {machineName} <span className="text-[#C5A059]">.</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#A19E95] hover:text-[#1A1A1A] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Customer Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                Data Pelanggan
              </h4>
              {selectedCustomer && (
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-[10px] text-[#C5A059] hover:underline"
                >
                  Ganti
                </button>
              )}
            </div>

            {selectedCustomer ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {selectedCustomer.name}
                    </p>
                    <p className="text-[11px] text-[#A19E95]">
                      {customerService.formatPhone(selectedCustomer.phone)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Phone Search (FR-POS-03) */}
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E5E2D9]"
                  />
                  <input
                    type="text"
                    placeholder="Cari 4 digit terakhir HP..."
                    value={phoneSearch}
                    onChange={(e) => setPhoneSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
                  />
                </div>

                {/* Customer Results */}
                {customers.length > 0 && (
                  <div className="border border-[#F0EDE4] rounded-sm divide-y divide-[#F0EDE4]">
                    {customers.slice(0, 3).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setPhoneSearch("");
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-[#FAF9F6] text-left transition-colors"
                      >
                        <User size={14} className="text-[#C5A059]" />
                        <div>
                          <p className="text-sm text-[#1A1A1A]">{c.name}</p>
                          <p className="text-[10px] text-[#A19E95]">
                            {c.phone}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* New Customer Form */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <User
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E5E2D9]"
                    />
                    <input
                      type="text"
                      placeholder="Nama baru..."
                      value={newCustomer.name}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, name: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div className="relative">
                    <Phone
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E5E2D9]"
                    />
                    <input
                      type="tel"
                      placeholder="0812..."
                      value={newCustomer.phone}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          phone: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Services Section (FR-POS-02: Visual Selection) */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
              Pilih Layanan
            </h4>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-[#C5A059]" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {services.map((service) => {
                  const inCart = cart.find((c) => c.service.id === service.id);
                  return (
                    <button
                      key={service.id}
                      onClick={() => addToCart(service)}
                      className={`flex items-center gap-3 p-4 rounded-sm border transition-all ${
                        inCart
                          ? "border-[#C5A059] bg-[#C5A059]/5"
                          : "border-[#F0EDE4] hover:border-[#C5A059]/50"
                      }`}
                    >
                      <div className="text-2xl">
                        {serviceService.getIcon(service.name)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[12px] font-bold text-[#1A1A1A]">
                          {service.name}
                        </p>
                        <p className="text-[10px] text-[#A19E95]">
                          {serviceService.formatPrice(service.price)}/
                          {serviceService.getUnitTypeShort(service.unitType)}
                        </p>
                      </div>
                      {inCart && (
                        <div className="w-6 h-6 bg-[#C5A059] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                          {inCart.quantity}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="space-y-3 p-4 bg-[#FAF9F6] rounded-sm">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                Ringkasan Order
              </h4>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.service.id}
                    className="flex items-center justify-between py-2 border-b border-[#F0EDE4] last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {serviceService.getIcon(item.service.name)}
                      </span>
                      <span className="text-[12px] text-[#1A1A1A]">
                        {item.service.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.service.id, item.quantity - 1)
                          }
                          className="w-6 h-6 flex items-center justify-center bg-white border border-[#F0EDE4] rounded text-[#A19E95] hover:border-[#C5A059] hover:text-[#C5A059]"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-[12px] font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.service.id, item.quantity + 1)
                          }
                          className="w-6 h-6 flex items-center justify-center bg-white border border-[#F0EDE4] rounded text-[#A19E95] hover:border-[#C5A059] hover:text-[#C5A059]"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[12px] font-medium text-[#1A1A1A] w-24 text-right">
                        {serviceService.formatPrice(
                          item.service.price * item.quantity,
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#E5E2D9]">
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
                  Total
                </span>
                <span className="text-lg font-medium text-[#1A1A1A]">
                  {serviceService.formatPrice(total)}
                </span>
              </div>
            </div>
          )}

          {/* Note Input */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center gap-2">
              <StickyNote size={12} className="text-[#C5A059]" />
              Catatan
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tambahkan catatan..."
              className="w-full p-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059] min-h-[80px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-[#FAF9F6] border-t border-[#F0EDE4] flex-shrink-0">
          <button
            disabled={
              submitting ||
              cart.length === 0 ||
              (!selectedCustomer && (!newCustomer.name || !newCustomer.phone))
            }
            onClick={handleSubmit}
            className="group flex items-center justify-between w-full p-4 bg-[#1A1A1A] text-white rounded-sm transition-all duration-300 hover:bg-[#C5A059] disabled:bg-[#E5E2D9] disabled:text-[#A19E95]"
          >
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase">
              {submitting ? "Memproses..." : "Buat Order"}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowRight size={16} />
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
