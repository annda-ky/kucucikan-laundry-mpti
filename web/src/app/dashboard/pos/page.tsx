"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  User,
  Phone,
  Search,
  Plus,
  Minus,
  Trash2,
  WashingMachine,
  ArrowRight,
  Loader2,
  X,
  Check,
  StickyNote,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { serviceService } from "@/services/service.service";
import { customerService } from "@/services/customer.service";
import { machineService } from "@/services/machine.service";
import { orderService } from "@/services/order.service";
import { reportService } from "@/services/report.service";
import type { Service, Customer, Machine, CreateOrderItemDto } from "@/types";

interface CartItem {
  service: Service;
  quantity: number;
}

export default function POSPage() {
  // Data states
  const [services, setServices] = useState<Service[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [phoneSearch, setPhoneSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [note, setNote] = useState("");
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [step, setStep] = useState<
    "customer" | "services" | "machine" | "confirm"
  >("customer");

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, machinesData] = await Promise.all([
          serviceService.getActive(),
          machineService.getAll(),
        ]);
        setServices(servicesData);
        setMachines(machinesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Search customer by phone (FR-POS-03: 4 digit search)
  useEffect(() => {
    const search = async () => {
      if (phoneSearch.length >= 4) {
        try {
          const results = await customerService.searchByPhone(phoneSearch);
          setSearchResults(results);
        } catch {
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    };
    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [phoneSearch]);

  // Keyboard shortcuts (FR-POS-01)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();
        // Save/Next step
        if (
          step === "customer" &&
          (selectedCustomer || (newCustomer.name && newCustomer.phone))
        ) {
          setStep("services");
        } else if (step === "services" && cart.length > 0) {
          setStep("machine");
        } else if (step === "machine" && selectedMachine) {
          setStep("confirm");
        }
      }
      if (e.key === "F2") {
        e.preventDefault();
        // Submit order
        if (step === "confirm") {
          handleSubmit();
        }
      }
      if (e.key === "Escape") {
        // Reset
        handleReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, selectedCustomer, newCustomer, cart, selectedMachine]);

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

  const updateQuantity = (serviceId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((c) => c.service.id !== serviceId));
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

  const idleMachines = machines.filter((m) => m.status === "IDLE");

  const handleReset = () => {
    setSelectedCustomer(null);
    setNewCustomer({ name: "", phone: "" });
    setPhoneSearch("");
    setSearchResults([]);
    setCart([]);
    setSelectedMachine(null);
    setNote("");
    setStep("customer");
  };

  const handleSubmit = async () => {
    if (cart.length === 0 || !selectedMachine) return;
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

      await orderService.create({
        customerId: customerId!,
        machineId: selectedMachine.id,
        items,
        note,
      });

      // Success - reset form
      handleReset();
      toast.success("Order berhasil dibuat! Struk tercetak.");
    } catch (error: any) {
      console.error("Error creating order:", error);
      const msg = error.response?.data?.message || "Gagal membuat order";

      if (msg.includes("Shift")) {
        toast.error("Shift Kasir belum dimulai! Silakan buka menu Shift.");
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[#C5A059]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-[#C5A059]" />
            <span className="text-[10px] font-bold tracking-[0.4em] text-[#C5A059] uppercase">
              Point of Sale
            </span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-[#1A1A1A]">
            Buat{" "}
            <span className="font-medium italic text-[#C5A059]">Order</span>
          </h2>
        </div>

        {/* Keyboard Hints */}
        <div className="hidden lg:flex items-center gap-4 text-[9px] font-bold text-[#A19E95]">
          <span>
            <kbd className="px-2 py-1 bg-[#F5F4F1] rounded text-[#1A1A1A]">
              F1
            </kbd>{" "}
            Lanjut
          </span>
          <span>
            <kbd className="px-2 py-1 bg-[#F5F4F1] rounded text-[#1A1A1A]">
              F2
            </kbd>{" "}
            Submit
          </span>
          <span>
            <kbd className="px-2 py-1 bg-[#F5F4F1] rounded text-[#1A1A1A]">
              ESC
            </kbd>{" "}
            Reset
          </span>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {["customer", "services", "machine", "confirm"].map((s, i) => (
          <div key={s} className="flex items-center">
            <button
              onClick={() => {
                // Allow going back
                if (i === 0) setStep("customer");
                else if (
                  i === 1 &&
                  (selectedCustomer || (newCustomer.name && newCustomer.phone))
                )
                  setStep("services");
                else if (i === 2 && cart.length > 0) setStep("machine");
                else if (i === 3 && selectedMachine) setStep("confirm");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm transition-all ${
                step === s
                  ? "bg-[#C5A059] text-white"
                  : i <
                      ["customer", "services", "machine", "confirm"].indexOf(
                        step,
                      )
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-[#F5F4F1] text-[#A19E95]"
              }`}
            >
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">
                {i <
                ["customer", "services", "machine", "confirm"].indexOf(step) ? (
                  <Check size={12} />
                ) : (
                  i + 1
                )}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] hidden sm:block">
                {s === "customer"
                  ? "Pelanggan"
                  : s === "services"
                    ? "Layanan"
                    : s === "machine"
                      ? "Mesin"
                      : "Konfirmasi"}
              </span>
            </button>
            {i < 3 && <div className="w-4 h-[1px] bg-[#E5E2D9]" />}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Step Content */}
        <div className="lg:col-span-2 bg-white border border-[#F0EDE4] rounded-sm p-6">
          {/* Step 1: Customer */}
          {step === "customer" && (
            <div className="space-y-6">
              <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                Data Pelanggan
              </h3>

              {selectedCustomer ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm flex items-center justify-between">
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
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-[#A19E95] hover:text-red-500"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  {/* Search Existing Customer */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
                      Cari Pelanggan (4 digit terakhir HP)
                    </label>
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E5E2D9]"
                      />
                      <input
                        type="text"
                        placeholder="Ketik 4 digit terakhir..."
                        value={phoneSearch}
                        onChange={(e) => setPhoneSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
                      />
                    </div>

                    {searchResults.length > 0 && (
                      <div className="border border-[#F0EDE4] rounded-sm divide-y divide-[#F0EDE4]">
                        {searchResults.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedCustomer(c);
                              setPhoneSearch("");
                              setSearchResults([]);
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
                  </div>

                  <div className="relative flex items-center gap-4">
                    <div className="flex-1 h-[1px] bg-[#F0EDE4]" />
                    <span className="text-[10px] font-bold text-[#A19E95]">
                      ATAU
                    </span>
                    <div className="flex-1 h-[1px] bg-[#F0EDE4]" />
                  </div>

                  {/* New Customer */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
                      Pelanggan Baru
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <User
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E5E2D9]"
                        />
                        <input
                          type="text"
                          placeholder="Nama..."
                          value={newCustomer.name}
                          onChange={(e) =>
                            setNewCustomer({
                              ...newCustomer,
                              name: e.target.value,
                            })
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
                </>
              )}

              <button
                onClick={() => setStep("services")}
                disabled={
                  !selectedCustomer && (!newCustomer.name || !newCustomer.phone)
                }
                className="w-full py-3.5 bg-[#1A1A1A] text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-[#C5A059] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Lanjut Pilih Layanan
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Services - Direct Input */}
          {step === "services" && (
            <div className="space-y-6">
              <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                Pilih Layanan & Masukkan Jumlah
              </h3>

              <div className="space-y-3">
                {services.map((service) => {
                  const inCart = cart.find((c) => c.service.id === service.id);
                  const unitLabel = serviceService.getUnitTypeShort(
                    service.unitType,
                  );

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
                            {serviceService.formatPrice(service.price)}/
                            {unitLabel}
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
                            if (val > 0) {
                              const existing = cart.find(
                                (c) => c.service.id === service.id,
                              );
                              if (existing) {
                                setCart(
                                  cart.map((c) =>
                                    c.service.id === service.id
                                      ? { ...c, quantity: val }
                                      : c,
                                  ),
                                );
                              } else {
                                setCart([...cart, { service, quantity: val }]);
                              }
                            } else {
                              setCart(
                                cart.filter((c) => c.service.id !== service.id),
                              );
                            }
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
                  onClick={() => setStep("customer")}
                  className="px-6 py-3 border border-[#F0EDE4] text-[#A19E95] text-[11px] font-bold tracking-[0.15em] uppercase rounded-sm hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={() => setStep("machine")}
                  disabled={
                    cart.length === 0 || cart.every((c) => c.quantity <= 0)
                  }
                  className="flex-1 py-3 bg-[#1A1A1A] text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-[#C5A059] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Lanjut Pilih Mesin
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Machine Selection */}
          {step === "machine" && (
            <div className="space-y-6">
              <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                Pilih Mesin Cuci
              </h3>

              {idleMachines.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {idleMachines.map((machine) => (
                    <button
                      key={machine.id}
                      onClick={() => setSelectedMachine(machine)}
                      className={`flex flex-col items-center p-4 rounded-sm border transition-all ${
                        selectedMachine?.id === machine.id
                          ? "border-[#C5A059] bg-[#C5A059]/10"
                          : "border-emerald-200 bg-emerald-50 hover:border-[#C5A059]"
                      }`}
                    >
                      <WashingMachine
                        size={32}
                        className={
                          selectedMachine?.id === machine.id
                            ? "text-[#C5A059]"
                            : "text-emerald-500"
                        }
                      />
                      <p className="text-[11px] font-bold text-[#1A1A1A] mt-2">
                        {machine.name}
                      </p>
                      <p className="text-[9px] text-emerald-600 font-medium">
                        Tersedia
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-amber-50 border border-amber-200 rounded-sm">
                  <WashingMachine
                    size={40}
                    className="mx-auto mb-3 text-amber-500"
                  />
                  <p className="text-amber-700 font-medium">
                    Tidak ada mesin tersedia
                  </p>
                  <p className="text-[12px] text-amber-600">
                    Semua mesin sedang digunakan
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("services")}
                  className="px-6 py-3 border border-[#F0EDE4] text-[#A19E95] text-[11px] font-bold tracking-[0.15em] uppercase rounded-sm hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={() => setStep("confirm")}
                  disabled={!selectedMachine}
                  className="flex-1 py-3 bg-[#1A1A1A] text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-[#C5A059] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Lihat Ringkasan
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === "confirm" && (
            <div className="space-y-6">
              <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                Konfirmasi Order
              </h3>

              {/* Customer Info */}
              <div className="p-4 bg-[#FAF9F6] rounded-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] mb-2">
                  Pelanggan
                </p>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {selectedCustomer?.name || newCustomer.name}
                </p>
                <p className="text-[11px] text-[#A19E95]">
                  {selectedCustomer?.phone || newCustomer.phone}
                </p>
              </div>

              {/* Machine Info */}
              <div className="p-4 bg-[#FAF9F6] rounded-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] mb-2">
                  Mesin Cuci
                </p>
                <div className="flex items-center gap-2">
                  <WashingMachine size={18} className="text-[#C5A059]" />
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {selectedMachine?.name}
                  </p>
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
                  onChange={(e) => setNote(e.target.value)}
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
                      {serviceService.formatPrice(
                        item.service.price * item.quantity,
                      )}
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
                  onClick={() => setStep("machine")}
                  className="px-6 py-3 border border-[#F0EDE4] text-[#A19E95] text-[11px] font-bold tracking-[0.15em] uppercase rounded-sm hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={handleSubmit}
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
          )}
        </div>

        {/* Right Panel - Cart Summary */}
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
                        {serviceService.getUnitTypeShort(item.service.unitType)}{" "}
                        × {serviceService.formatPrice(item.service.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.service.id, item.quantity - 1)
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
                        updateQuantity(item.service.id, item.quantity + 1)
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
                onClick={handleReset}
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
      </div>
    </div>
  );
}
