"use client";

import { useState, useEffect } from "react";
import { Loader2, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { serviceService } from "@/services/service.service";
import { customerService } from "@/services/customer.service";
import { machineService } from "@/services/machine.service";
import { orderService } from "@/services/order.service";
import type { Service, Customer, Machine, CreateOrderItemDto } from "@/types";
import { CustomerStep } from "@/components/pos/CustomerStep";
import { ServiceStep } from "@/components/pos/ServiceStep";
import { MachineStep } from "@/components/pos/MachineStep";
import { ConfirmStep } from "@/components/pos/ConfirmStep";
import { CartSummary } from "@/components/pos/CartSummary";

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

  const updateQuantity = (serviceId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((c) => c.service.id !== serviceId));
    } else {
      setCart(
        cart.map((c) => (c.service.id === serviceId ? { ...c, quantity } : c)),
      );
    }
  };

  const handleUpdateCart = (service: Service, quantity: number) => {
    if (quantity > 0) {
      const existing = cart.find((c) => c.service.id === service.id);
      if (existing) {
        setCart(
          cart.map((c) =>
            c.service.id === service.id ? { ...c, quantity: quantity } : c,
          ),
        );
      } else {
        setCart([...cart, { service, quantity: quantity }]);
      }
    } else {
      setCart(cart.filter((c) => c.service.id !== service.id));
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + item.service.price * item.quantity,
    0,
  );

  const handleReset = () => {
    setSelectedCustomer(null);
    setNewCustomer({ name: "", phone: "" });
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
                        step as any,
                      )
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-[#F5F4F1] text-[#A19E95]"
              }`}
            >
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">
                {i <
                ["customer", "services", "machine", "confirm"].indexOf(
                  step as any,
                ) ? (
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
          {step === "customer" && (
            <CustomerStep
              selectedCustomer={selectedCustomer}
              onSelectCustomer={setSelectedCustomer}
              newCustomer={newCustomer}
              onUpdateNewCustomer={setNewCustomer}
              onNext={() => setStep("services")}
            />
          )}

          {step === "services" && (
            <ServiceStep
              services={services}
              cart={cart}
              onUpdateCart={handleUpdateCart}
              onBack={() => setStep("customer")}
              onNext={() => setStep("machine")}
            />
          )}

          {step === "machine" && (
            <MachineStep
              machines={machines}
              selectedMachine={selectedMachine}
              onSelectMachine={setSelectedMachine}
              onBack={() => setStep("services")}
              onNext={() => setStep("confirm")}
            />
          )}

          {step === "confirm" && (
            <ConfirmStep
              customerName={selectedCustomer?.name || newCustomer.name}
              customerPhone={selectedCustomer?.phone || newCustomer.phone}
              machine={selectedMachine}
              cart={cart}
              note={note}
              onUpdateNote={setNote}
              total={total}
              submitting={submitting}
              onBack={() => setStep("machine")}
              onSubmit={handleSubmit}
            />
          )}
        </div>

        {/* Right Panel - Cart Summary */}
        <CartSummary
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
