"use client";

import { useState, useEffect } from "react";
import {
  WashingMachine,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Check,
  RefreshCw,
} from "lucide-react";
import { machineService } from "@/services/machine.service";
import type { Machine } from "@/types";

type MachineStatus = "IDLE" | "WASHING" | "OVERDUE" | "BROKEN";

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    status: "IDLE" as MachineStatus,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

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

  const handleOpenModal = (machine?: Machine) => {
    if (machine) {
      setEditingMachine(machine);
      setFormData({ name: machine.name, status: machine.status });
    } else {
      setEditingMachine(null);
      setFormData({ name: "", status: "IDLE" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMachine(null);
    setFormData({ name: "", status: "IDLE" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      if (editingMachine) {
        await machineService.update(editingMachine.id, formData);
      } else {
        await machineService.create({ name: formData.name });
      }
      handleCloseModal();
      fetchMachines();
    } catch (error) {
      console.error("Error saving machine:", error);
      alert("Gagal menyimpan data mesin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await machineService.delete(id);
      setDeleteConfirm(null);
      fetchMachines();
    } catch (error) {
      console.error("Error deleting machine:", error);
      alert("Gagal menghapus mesin. Mungkin masih ada order yang terkait.");
    }
  };

  const handleStatusChange = async (
    machine: Machine,
    newStatus: MachineStatus,
  ) => {
    try {
      await machineService.update(machine.id, { status: newStatus } as any);
      fetchMachines();
    } catch (error) {
      console.error("Error updating status:", error);
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
              Management
            </span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-[#1A1A1A]">
            Kelola{" "}
            <span className="font-medium italic text-[#C5A059]">
              Mesin Cuci
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchMachines()}
            className="p-2.5 border border-[#F0EDE4] rounded-sm hover:bg-[#FAF9F6] transition-colors"
          >
            <RefreshCw size={16} className="text-[#A19E95]" />
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1A] text-white text-[11px] font-bold tracking-[0.15em] uppercase rounded-sm hover:bg-[#C5A059] transition-colors"
          >
            <Plus size={16} />
            Tambah Mesin
          </button>
        </div>
      </header>

      {/* Machine Grid */}
      {machines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {machines.map((machine) => (
            <div
              key={machine.id}
              className="bg-white border border-[#F0EDE4] rounded-sm p-5 hover:shadow-sm transition-shadow"
            >
              {/* Machine Icon & Name */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${machineService.getStatusBgColor(machine.status)}/10`}
                  >
                    <WashingMachine
                      size={24}
                      className={machineService.getStatusColor(machine.status)}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1A1A1A]">
                      {machine.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-[0.1em] ${machineService.getStatusColor(machine.status)}`}
                    >
                      {machineService.getStatusLabel(machine.status)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(machine)}
                    className="p-1.5 text-[#A19E95] hover:text-[#C5A059] hover:bg-[#FAF9F6] rounded transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(machine.id)}
                    className="p-1.5 text-[#A19E95] hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Status Quick Change */}
              <div className="space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
                  Ubah Status
                </p>
                <div className="flex gap-1">
                  {(["IDLE", "WASHING", "BROKEN"] as MachineStatus[]).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(machine, status)}
                        disabled={machine.status === status}
                        className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-[0.05em] rounded-sm transition-colors ${
                          machine.status === status
                            ? `${machineService.getStatusBgColor(status)} text-white`
                            : "bg-[#F5F4F1] text-[#A19E95] hover:bg-[#E5E2D9]"
                        }`}
                      >
                        {status === "IDLE"
                          ? "Siap"
                          : status === "WASHING"
                            ? "Cuci"
                            : "Rusak"}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm === machine.id && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-sm">
                  <p className="text-[11px] text-red-700 mb-2">
                    Hapus mesin ini?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 py-1.5 text-[10px] font-bold text-[#A19E95] bg-white border border-[#E5E2D9] rounded-sm hover:bg-[#FAF9F6]"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleDelete(machine.id)}
                      className="flex-1 py-1.5 text-[10px] font-bold text-white bg-red-500 rounded-sm hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-[#F0EDE4] rounded-sm">
          <WashingMachine
            size={48}
            strokeWidth={1}
            className="mx-auto mb-4 text-[#E5E2D9]"
          />
          <p className="text-[#A19E95] mb-4">Belum ada mesin cuci</p>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-[#C5A059] text-white text-[11px] font-bold uppercase tracking-[0.15em] rounded-sm hover:bg-[#B08D4A] transition-colors"
          >
            Tambah Mesin Pertama
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { status: "IDLE" as MachineStatus, label: "Tersedia" },
          { status: "WASHING" as MachineStatus, label: "Sedang Cuci" },
          { status: "OVERDUE" as MachineStatus, label: "Melewati Waktu" },
          { status: "BROKEN" as MachineStatus, label: "Rusak" },
        ].map(({ status, label }) => {
          const count = machines.filter((m) => m.status === status).length;
          return (
            <div
              key={status}
              className="bg-white border border-[#F0EDE4] rounded-sm p-4 text-center"
            >
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${machineService.getStatusBgColor(status)}/10`}
              >
                <WashingMachine
                  size={16}
                  className={machineService.getStatusColor(status)}
                />
              </div>
              <p className="text-2xl font-bold text-[#1A1A1A]">{count}</p>
              <p className="text-[10px] text-[#A19E95] uppercase tracking-[0.1em]">
                {label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-sm shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[#F0EDE4]">
              <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                {editingMachine ? "Edit Mesin" : "Tambah Mesin Baru"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-[#A19E95] hover:text-[#1A1A1A]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
                  Nama Mesin
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Contoh: Mesin 1, Washer A..."
                  className="w-full px-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
                  autoFocus
                />
              </div>

              {/* Status (only for edit) */}
              {editingMachine && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
                    Status
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(
                      [
                        "IDLE",
                        "WASHING",
                        "OVERDUE",
                        "BROKEN",
                      ] as MachineStatus[]
                    ).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFormData({ ...formData, status })}
                        className={`py-2 text-[10px] font-bold uppercase rounded-sm transition-colors ${
                          formData.status === status
                            ? `${machineService.getStatusBgColor(status)} text-white`
                            : "bg-[#F5F4F1] text-[#A19E95] hover:bg-[#E5E2D9]"
                        }`}
                      >
                        {machineService.getStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 border border-[#F0EDE4] text-[#A19E95] text-[11px] font-bold tracking-[0.15em] uppercase rounded-sm hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!formData.name.trim() || submitting}
                  className="flex-1 py-3 bg-[#1A1A1A] text-white text-[11px] font-bold tracking-[0.15em] uppercase rounded-sm hover:bg-[#C5A059] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Check size={14} />
                      Simpan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
