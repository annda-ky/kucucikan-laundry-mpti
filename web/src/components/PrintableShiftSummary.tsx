"use client";

import { forwardRef } from "react";
import { Receipt, Calendar, User, Clock, DollarSign } from "lucide-react";
import { shiftService } from "@/services/shift.service";
import { expenseService } from "@/services/expense.service";
import type { Shift, Expense, User as UserType } from "@/types";

interface PrintableShiftSummaryProps {
  shift: Shift;
  expenses: Expense[];
  user: UserType | null;
}

export const PrintableShiftSummary = forwardRef<
  HTMLDivElement,
  PrintableShiftSummaryProps
>(({ shift, expenses, user }, ref) => {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const expectedCash = shift.systemExpectedCash || 0;
  const actualCash = shift.actualCashClosing || 0;
  const discrepancy = actualCash - expectedCash;

  return (
    <div ref={ref} className="p-8 bg-white text-black max-w-[210mm]">
      <div className="text-center mb-8 border-b-2 border-black pb-6">
        <h1 className="text-3xl font-bold mb-2">KUCUCIKAN LAUNDRY</h1>
        <p className="text-sm text-gray-600">
          Jl. Contoh No. 123, Kota, Provinsi
        </p>
        <p className="text-sm text-gray-600">Telp: 0812-3456-7890</p>
        <div className="mt-4 inline-block px-4 py-2 bg-black text-white text-xs font-bold tracking-wider">
          RINGKASAN SHIFT
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User size={16} />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Kasir
            </span>
          </div>
          <p className="text-lg font-medium">
            {shift.cashier?.username || user?.username || "N/A"}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={16} />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              ID Shift
            </span>
          </div>
          <p className="text-lg font-medium font-mono">
            {shift.id.slice(0, 8)}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Mulai Shift
            </span>
          </div>
          <p className="text-sm">
            {new Date(shift.startTime).toLocaleString("id-ID", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Selesai Shift
            </span>
          </div>
          <p className="text-sm">
            {shift.endTime
              ? new Date(shift.endTime).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Shift Aktif"}
          </p>
        </div>
      </div>

      <div className="border-t-2 border-b-2 border-gray-300 py-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <DollarSign size={20} />
          RINGKASAN KEUANGAN
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Modal Awal</span>
            <span className="text-lg font-medium">
              {shiftService.formatCurrency(shift.startCash)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Pengeluaran</span>
            <span className="text-lg font-medium text-red-600">
              -{shiftService.formatCurrency(totalExpenses)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="text-sm font-bold">Kas Sistem (Expected)</span>
            <span className="text-lg font-bold">
              {shiftService.formatCurrency(expectedCash)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-bold">Kas Aktual (Fisik)</span>
            <span className="text-lg font-bold">
              {shiftService.formatCurrency(actualCash)}
            </span>
          </div>

          <div
            className={`flex justify-between items-center pt-3 border-t-2 border-black ${
              discrepancy >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            <span className="text-sm font-bold">SELISIH</span>
            <span className="text-2xl font-bold">
              {discrepancy >= 0 ? "+" : ""}
              {shiftService.formatCurrency(Math.abs(discrepancy))}
            </span>
          </div>
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">DETAIL PENGELUARAN</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2 font-bold">Waktu</th>
                <th className="text-left py-2 font-bold">Kategori</th>
                <th className="text-left py-2 font-bold">Keterangan</th>
                <th className="text-right py-2 font-bold">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, idx) => {
                const categoryInfo = expenseService.getCategoryInfo(
                  expense.category,
                );
                return (
                  <tr key={expense.id} className="border-b border-gray-200">
                    <td className="py-2">
                      {new Date(expense.createdAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2">{categoryInfo.label}</td>
                    <td className="py-2">{expense.note || "-"}</td>
                    <td className="py-2 text-right font-medium">
                      {shiftService.formatCurrency(expense.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-black font-bold">
                <td colSpan={3} className="py-2">
                  TOTAL
                </td>
                <td className="py-2 text-right text-lg">
                  {shiftService.formatCurrency(totalExpenses)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="mt-12 pt-6 border-t border-gray-300">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-12">Kasir</p>
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">
                {shift.cashier?.username || user?.username || "_______________"}
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-12">
              Penerima (Owner/Admin)
            </p>
            <div className="border-t border-black pt-2">
              <p className="text-sm font-medium">_______________</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Dicetak pada: {new Date().toLocaleString("id-ID")}</p>
          <p className="mt-1">
            Dokumen ini sah sebagai bukti serah terima shift kasir
          </p>
        </div>
      </div>
    </div>
  );
});

PrintableShiftSummary.displayName = "PrintableShiftSummary";
