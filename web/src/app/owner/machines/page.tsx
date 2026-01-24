"use client";

import { useState, useEffect } from "react";
import { WashingMachine, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { machineService } from "@/services/machine.service";
import type { Machine } from "@/types";

export default function OwnerMachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMachines = async () => {
    try {
      const data = await machineService.getAll();
      setMachines(data);
    } catch (error) {
      console.error("Error fetching machines:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[#C5A059]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight">
            Manajemen{" "}
            <span className="text-[#C5A059] font-medium italic">Mesin</span>
          </h1>
          <p className="text-[#808080] text-sm">
            Monitor status dan performa mesin
          </p>
        </div>
        <button
          onClick={fetchMachines}
          className="p-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm text-[#808080] hover:text-white hover:border-[#C5A059] transition-colors"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {machines.map((machine) => (
          <div
            key={machine.id}
            className={`p-6 bg-[#1A1A1A] border rounded-sm transition-all duration-300 ${
              machine.status === "WASHING"
                ? "border-amber-500/30 shadow-[0_0_20px_-10px_rgba(245,158,11,0.2)]"
                : machine.status === "BROKEN"
                  ? "border-red-500/30"
                  : "border-[#2A2A2A] hover:border-[#C5A059]/30"
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-[#0F0F0F] rounded-full border border-[#2A2A2A]">
                <WashingMachine
                  size={20}
                  className={
                    machine.status === "WASHING"
                      ? "text-amber-500 animate-pulse"
                      : machine.status === "BROKEN"
                        ? "text-red-500"
                        : "text-[#C5A059]"
                  }
                />
              </div>
              <span
                className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded ${
                  machine.status === "IDLE"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : machine.status === "WASHING"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-red-500/10 text-red-500"
                }`}
              >
                {machine.status}
              </span>
            </div>

            <h3 className="text-lg font-medium text-white mb-1">
              {machine.name}
            </h3>
            <p className="text-xs text-[#808080] mb-4">ID: #{machine.id}</p>

            <div className="flex items-center gap-2 pt-4 border-t border-[#2A2A2A]">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  machine.status === "IDLE"
                    ? "bg-emerald-500"
                    : machine.status === "WASHING"
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
              />
              <span className="text-[10px] uppercase tracking-wider text-[#808080]">
                {machine.status === "WASHING"
                  ? "Sedang Digunakan"
                  : machine.status === "IDLE"
                    ? "Tersedia"
                    : "Perlu Perbaikan"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
