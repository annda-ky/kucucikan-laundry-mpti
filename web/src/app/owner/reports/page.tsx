"use client";

import { BarChart3, Download } from "lucide-react";

export default function OwnerReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight">
            Laporan{" "}
            <span className="text-[#C5A059] font-medium italic">Bisnis</span>
          </h1>
          <p className="text-[#808080] text-sm">
            Analisis performa dan statistik laundry
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm text-xs font-bold text-white hover:border-[#C5A059] transition-colors">
          <Download size={14} />
          EXPORT DATA
        </button>
      </div>

      <div className="p-12 text-center border border-dashed border-[#2A2A2A] rounded-sm bg-[#1A1A1A]/50">
        <BarChart3 size={48} className="mx-auto text-[#2A2A2A] mb-4" />
        <h3 className="text-lg font-medium text-white">Laporan Detail</h3>
        <p className="text-[#808080] text-sm mt-1">
          Fitur pelaporan lengkap akan segera tersedia.
        </p>
      </div>
    </div>
  );
}
