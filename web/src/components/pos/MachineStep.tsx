"use client";

import { ArrowRight, WashingMachine } from "lucide-react";
import type { Machine } from "@/types";

interface MachineStepProps {
  machines: Machine[];
  selectedMachine: Machine | null;
  onSelectMachine: (machine: Machine) => void;
  onBack: () => void;
  onNext: () => void;
}

export function MachineStep({
  machines,
  selectedMachine,
  onSelectMachine,
  onBack,
  onNext,
}: MachineStepProps) {
  // Filter for idle machines
  const idleMachines = machines.filter((m) => m.status === "IDLE");

  return (
    <div className="space-y-6">
      <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
        Pilih Mesin Cuci
      </h3>

      {idleMachines.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {idleMachines.map((machine) => (
            <button
              key={machine.id}
              onClick={() => onSelectMachine(machine)}
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
          <WashingMachine size={40} className="mx-auto mb-3 text-amber-500" />
          <p className="text-amber-700 font-medium">Tidak ada mesin tersedia</p>
          <p className="text-[12px] text-amber-600">
            Semua mesin sedang digunakan
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-[#F0EDE4] text-[#A19E95] text-[11px] font-bold tracking-[0.15em] uppercase rounded-sm hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
        >
          Kembali
        </button>
        <button
          onClick={onNext}
          disabled={!selectedMachine}
          className="flex-1 py-3 bg-[#1A1A1A] text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-[#C5A059] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          Lihat Ringkasan
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
