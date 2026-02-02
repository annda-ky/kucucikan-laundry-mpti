"use client";

import { useState, useEffect, useCallback } from "react";
import {
  WashingMachine,
  Clock,
  MapPin,
  Loader2,
  RefreshCw,
  Play,
  CheckCircle,
  Package,
  AlertTriangle,
  Timer,
  X,
} from "lucide-react";
import { orderService } from "@/services/order.service";
import { machineService } from "@/services/machine.service";
import type { Order, StatusLaundry, Machine } from "@/types";

// Timer presets (FR-OPS-02)
const TIMER_PRESETS = [15, 30, 45, 60, 90, 120];

export default function OperationsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"timer" | "finish" | "status">(
    "status",
  );
  const [customTimer, setCustomTimer] = useState(30);
  const [rackLocation, setRackLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  // Calculate remaining time (FR-OPS-03)
  const getRemainingTime = (
    order: Order,
  ): { minutes: number; isOverdue: boolean } => {
    if (!order.washingStartedAt || !order.actualDurationMinutes) {
      return { minutes: 0, isOverdue: false };
    }
    const startTime = new Date(order.washingStartedAt).getTime();
    const endTime = startTime + order.actualDurationMinutes * 60000;
    const now = Date.now();
    const remainingMs = endTime - now;
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return {
      minutes: Math.abs(remainingMinutes),
      isOverdue: remainingMinutes < 0,
    };
  };

  const handleOpenModal = (
    order: Order,
    type: "timer" | "finish" | "status",
  ) => {
    setSelectedOrder(order);
    setModalType(type);
    setCustomTimer(order.actualDurationMinutes || 30);
    setRackLocation(order.rackLocation || "");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  // FR-OPS-02: Adjust Timer
  const handleAdjustTimer = async (minutes: number) => {
    if (!selectedOrder) return;
    setSubmitting(true);
    try {
      await orderService.updateStatus(selectedOrder.id, {
        status: selectedOrder.statusLaundry as StatusLaundry,
        durationMinutes: minutes,
      });
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Error adjusting timer:", error);
      alert("Gagal mengatur timer");
    } finally {
      setSubmitting(false);
    }
  };

  // FR-OPS-04: Manual Finish with FR-OPS-05: Rack Location
  const handleFinishOrder = async () => {
    if (!selectedOrder) return;
    setSubmitting(true);
    try {
      await orderService.updateStatus(selectedOrder.id, {
        status: "DONE",
        rackLocation: rackLocation || undefined,
      });
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Error finishing order:", error);
      alert("Gagal menyelesaikan order");
    } finally {
      setSubmitting(false);
    }
  };

  // Update laundry status
  const handleUpdateStatus = async (status: StatusLaundry) => {
    if (!selectedOrder) return;
    setSubmitting(true);
    try {
      await orderService.updateStatus(selectedOrder.id, { status });
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Gagal mengubah status");
    } finally {
      setSubmitting(false);
    }
  };

  // Get status flow options
  const getNextStatusOptions = (
    currentStatus: StatusLaundry,
  ): StatusLaundry[] => {
    switch (currentStatus) {
      case "PENDING":
        return ["WASHING"];
      case "WASHING":
        return ["DRYING", "IRONING", "DONE"];
      case "DRYING":
        return ["IRONING", "DONE"];
      case "IRONING":
        return ["DONE"];
      case "DONE":
        return ["PICKED_UP"];
      default:
        return [];
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
            const { minutes, isOverdue } = getRemainingTime(order);
            const machine = machines.find((m) => m.id === order.machineId);
            const hasTimer =
              order.washingStartedAt && order.actualDurationMinutes;

            return (
              <div
                key={order.id}
                className={`bg-white border rounded-sm p-5 transition-all ${
                  isOverdue
                    ? "border-red-300 bg-red-50"
                    : "border-[#F0EDE4] hover:shadow-sm"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-[#A19E95] uppercase tracking-[0.1em]">
                      {order.invoiceNumber}
                    </p>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {order.customer?.name || "Pelanggan"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-[9px] font-bold uppercase rounded ${orderService.getLaundryStatusColor(
                      order.statusLaundry as StatusLaundry,
                    )} bg-opacity-10`}
                  >
                    {orderService.getLaundryStatusLabel(
                      order.statusLaundry as StatusLaundry,
                    )}
                  </span>
                </div>

                {/* Machine & Timer */}
                {machine && (
                  <div className="flex items-center gap-2 mb-3 text-[11px] text-[#A19E95]">
                    <WashingMachine size={14} />
                    <span>{machine.name}</span>
                  </div>
                )}

                {/* Timer Display (FR-OPS-03) */}
                {hasTimer && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-sm mb-4 ${
                      isOverdue ? "bg-red-100" : "bg-amber-50"
                    }`}
                  >
                    {isOverdue ? (
                      <AlertTriangle size={18} className="text-red-500" />
                    ) : (
                      <Timer size={18} className="text-amber-500" />
                    )}
                    <div className="flex-1">
                      <p
                        className={`text-lg font-bold ${
                          isOverdue ? "text-red-600" : "text-amber-600"
                        }`}
                      >
                        {isOverdue ? `+${minutes}` : minutes} menit
                      </p>
                      <p className="text-[10px] text-[#A19E95]">
                        {isOverdue ? "Melewati waktu!" : "Sisa waktu"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenModal(order, "timer")}
                      className="p-2 hover:bg-white rounded transition-colors"
                      title="Atur ulang timer"
                    >
                      <Clock size={16} className="text-[#A19E95]" />
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(order, "status")}
                    className="flex-1 py-2 text-[10px] font-bold uppercase tracking-[0.1em] border border-[#F0EDE4] rounded-sm hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                  >
                    Ubah Status
                  </button>
                  {order.statusLaundry !== "PENDING" && (
                    <button
                      onClick={() => handleOpenModal(order, "finish")}
                      className="flex-1 py-2 text-[10px] font-bold uppercase tracking-[0.1em] bg-emerald-500 text-white rounded-sm hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={12} />
                      Selesai
                    </button>
                  )}
                </div>
              </div>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["PENDING", "WASHING", "DRYING", "IRONING"] as StatusLaundry[]).map(
          (status) => {
            const count = orders.filter(
              (o) => o.statusLaundry === status,
            ).length;
            return (
              <div
                key={status}
                className="bg-white border border-[#F0EDE4] rounded-sm p-4 text-center"
              >
                <p className="text-2xl font-bold text-[#1A1A1A]">{count}</p>
                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.1em] ${orderService.getLaundryStatusColor(status)}`}
                >
                  {orderService.getLaundryStatusLabel(status)}
                </p>
              </div>
            );
          },
        )}
      </div>

      {/* Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-sm shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[#F0EDE4]">
              <div>
                <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                  {modalType === "timer"
                    ? "Atur Timer"
                    : modalType === "finish"
                      ? "Selesaikan Order"
                      : "Ubah Status"}
                </h3>
                <p className="text-[10px] text-[#A19E95]">
                  {selectedOrder.invoiceNumber}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-[#A19E95] hover:text-[#1A1A1A]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Timer Adjust (FR-OPS-02) */}
              {modalType === "timer" && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
                    Pilih Durasi (menit)
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {TIMER_PRESETS.map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleAdjustTimer(mins)}
                        disabled={submitting}
                        className="py-3 text-sm font-bold border border-[#F0EDE4] rounded-sm hover:border-[#C5A059] hover:text-[#C5A059] transition-colors disabled:opacity-50"
                      >
                        {mins}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <input
                      type="number"
                      min="1"
                      value={customTimer}
                      onChange={(e) => setCustomTimer(Number(e.target.value))}
                      className="flex-1 px-4 py-3 border border-[#F0EDE4] rounded-sm text-center text-sm outline-none focus:border-[#C5A059]"
                    />
                    <button
                      onClick={() => handleAdjustTimer(customTimer)}
                      disabled={submitting || customTimer < 1}
                      className="px-6 py-3 bg-[#C5A059] text-white text-[11px] font-bold uppercase rounded-sm hover:bg-[#B08D4A] disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "Set"
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* Finish Order (FR-OPS-04 & FR-OPS-05) */}
              {modalType === "finish" && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95] flex items-center gap-2">
                      <MapPin size={12} />
                      Lokasi Rak (FR-OPS-05)
                    </label>
                    <input
                      type="text"
                      value={rackLocation}
                      onChange={(e) => setRackLocation(e.target.value)}
                      placeholder="Contoh: Rak A-2, Gantungan 5..."
                      className="w-full px-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
                    />
                    <p className="text-[10px] text-[#A19E95]">
                      Masukkan lokasi penyimpanan cucian yang sudah selesai
                    </p>
                  </div>
                  <button
                    onClick={handleFinishOrder}
                    disabled={submitting}
                    className="w-full py-3.5 bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-[0.15em] rounded-sm hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <CheckCircle size={14} />
                        Tandai Selesai
                      </>
                    )}
                  </button>
                </>
              )}

              {/* Status Change */}
              {modalType === "status" && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
                    Status Saat Ini:{" "}
                    <span
                      className={orderService.getLaundryStatusColor(
                        selectedOrder.statusLaundry as StatusLaundry,
                      )}
                    >
                      {orderService.getLaundryStatusLabel(
                        selectedOrder.statusLaundry as StatusLaundry,
                      )}
                    </span>
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
                    Pilih Status Baru
                  </p>
                  <div className="space-y-2">
                    {getNextStatusOptions(
                      selectedOrder.statusLaundry as StatusLaundry,
                    ).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(status)}
                        disabled={submitting}
                        className={`w-full py-3 text-sm font-bold border border-[#F0EDE4] rounded-sm hover:border-[#C5A059] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${orderService.getLaundryStatusColor(status)}`}
                      >
                        <Play size={14} />
                        {orderService.getLaundryStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
