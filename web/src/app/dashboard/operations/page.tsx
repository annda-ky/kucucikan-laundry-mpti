"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, RefreshCw, Package } from "lucide-react";
import { orderService } from "@/services/order.service";
import { machineService } from "@/services/machine.service";
import type { Order, Machine } from "@/types";

import { OperationCard } from "@/components/operations/OperationCard";
import { OperationModal } from "@/components/operations/OperationModal";
import { OperationSummary } from "@/components/operations/OperationSummary";

export default function OperationsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"timer" | "finish" | "status">(
    "status",
  );

  // Active orders (not DONE, PICKED_UP, or VOID)
  const activeOrders = orders.filter(
    (o) => !["DONE", "PICKED_UP", "VOID"].includes(o.statusLaundry),
  );

  const fetchData = useCallback(async () => {
    try {
      const [ordersData, machinesData] = await Promise.all([
        orderService.getAll(1, 50), // Fetch 50 active orders for operations view
        machineService.getAll(),
      ]);
      setOrders(ordersData.data);
      setMachines(machinesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds for timer updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleOpenModal = (
    order: Order,
    type: "timer" | "finish" | "status",
  ) => {
    setSelectedOrder(order);
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
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
              Operations
            </span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-[#1A1A1A]">
            Monitor{" "}
            <span className="font-medium italic text-[#C5A059]">
              Operasional
            </span>
          </h2>
        </div>

        <button
          onClick={() => fetchData()}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#F0EDE4] rounded-sm hover:bg-[#FAF9F6] transition-colors"
        >
          <RefreshCw size={16} className="text-[#A19E95]" />
          <span className="text-[11px] font-bold text-[#A19E95]">Refresh</span>
        </button>
      </header>

      {/* Active Orders Grid */}
      {activeOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeOrders.map((order) => {
            const machine = machines.find((m) => m.id === order.machineId);

            return (
              <OperationCard
                key={order.id}
                order={order}
                machine={machine}
                onOpenModal={(type) => handleOpenModal(order, type)}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-[#F0EDE4] rounded-sm">
          <Package
            size={48}
            strokeWidth={1}
            className="mx-auto mb-4 text-[#E5E2D9]"
          />
          <p className="text-[#A19E95]">Tidak ada order aktif</p>
        </div>
      )}

      {/* Summary Stats */}
      <OperationSummary orders={orders} />

      {/* Modal */}
      {showModal && selectedOrder && (
        <OperationModal
          order={selectedOrder}
          type={modalType}
          onClose={handleCloseModal}
          onSuccess={() => {
            handleCloseModal();
            fetchData();
          }}
        />
      )}
    </div>
  );
}
