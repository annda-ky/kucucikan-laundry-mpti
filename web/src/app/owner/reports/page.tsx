"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { reportService } from "@/services/report.service";
import { shiftService } from "@/services/shift.service";
import { FinanceSummary, Shift } from "@/types";
import toast from "react-hot-toast";
import { FinancialOverview } from "@/components/reports/FinancialOverview";
import { ShiftAuditView } from "@/components/reports/ShiftAuditView";

export default function OwnerReportsPage() {
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "AUDIT">("OVERVIEW");
  const [isLoading, setIsLoading] = useState(true);
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftMeta, setShiftMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [shiftPage, setShiftPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split("T")[0].slice(0, 7) + "-01", // First day of current month
    endDate: new Date().toISOString().split("T")[0], // Today
  });

  // Fetch Finance Data when Date Range changes
  useEffect(() => {
    const fetchFinance = async () => {
      try {
        setIsLoading(true);
        const data = await reportService.getFinanceSummary(
          dateRange.startDate,
          dateRange.endDate,
        );
        setFinance(data);
      } catch (error) {
        console.error("Failed to fetch finance data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (activeTab === "OVERVIEW") {
      fetchFinance();
    }
  }, [dateRange, activeTab]);

  // Fetch Shifts when Shift Page changes
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await shiftService.getAll(shiftPage, 10);
        setShifts(response.data);
        setShiftMeta(response.meta);
      } catch (error) {
        console.error("Failed to fetch shifts:", error);
      }
    };
    if (activeTab === "AUDIT") {
      fetchShifts();
    }
  }, [shiftPage, activeTab]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await reportService.downloadExport(
        undefined,
        dateRange.startDate,
        dateRange.endDate,
      );
      toast.success("Laporan berhasil diexport!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Gagal export laporan.");
    } finally {
      setIsExporting(false);
    }
  };

  if (activeTab === "OVERVIEW" && isLoading && !finance) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight">
            Laporan{" "}
            <span className="text-[#C5A059] font-medium italic">Bisnis</span>
          </h1>
          <p className="text-[#808080] text-sm">
            {activeTab === "OVERVIEW"
              ? `Laporan Keuangan: ${finance?.period || "Loading..."}`
              : `Audit Shift (Page ${shiftMeta.page} of ${shiftMeta.totalPages})`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {activeTab === "OVERVIEW" && (
            <div className="flex items-center gap-2 bg-[#1A1A1A] p-1 rounded-sm border border-[#2A2A2A]">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="bg-transparent text-white text-xs px-2 py-1 outline-none [&::-webkit-calendar-picker-indicator]:invert"
              />
              <span className="text-[#808080] text-xs">-</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="bg-transparent text-white text-xs px-2 py-1 outline-none [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
          )}

          {/* Tab Switcher */}
          <div className="flex bg-[#1A1A1A] p-1 rounded-sm border border-[#2A2A2A]">
            <button
              onClick={() => setActiveTab("OVERVIEW")}
              className={`px-4 py-2 text-[10px] font-bold tracking-wider rounded-sm transition-all ${
                activeTab === "OVERVIEW"
                  ? "bg-[#C5A059] text-[#0F0F0F]"
                  : "text-[#808080] hover:text-white"
              }`}
            >
              OVERVIEW
            </button>
            <button
              onClick={() => setActiveTab("AUDIT")}
              className={`px-4 py-2 text-[10px] font-bold tracking-wider rounded-sm transition-all ${
                activeTab === "AUDIT"
                  ? "bg-[#C5A059] text-[#0F0F0F]"
                  : "text-[#808080] hover:text-white"
              }`}
            >
              AUDIT
            </button>
          </div>

          {activeTab === "OVERVIEW" && (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm text-xs font-bold text-white hover:border-[#C5A059] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {isExporting ? "EXPORTING..." : "CSV"}
            </button>
          )}
        </div>
      </div>

      {activeTab === "OVERVIEW" ? (
        <FinancialOverview finance={finance} />
      ) : (
        <ShiftAuditView
          shifts={shifts}
          meta={shiftMeta}
          onPageChange={setShiftPage}
        />
      )}
    </div>
  );
}
