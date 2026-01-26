"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Shield,
  Trash2,
  Edit,
  Check,
  X,
  Loader2,
  RotateCcw,
  Ban,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  userService,
  type CreateUserDto,
  type UpdateUserDto,
} from "@/services/user.service";
import type { User, Role } from "@/types";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // --- Modal State ---
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: "danger" | "warning" | "info";
    isLoading: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "info",
    isLoading: false,
  });

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDelete = (id: string, username: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus User Permanen",
      message: `Apakah Anda yakin ingin menghapus user "${username}" selamanya? Tindakan ini tidak dapat dibatalkan.`,
      variant: "danger",
      isLoading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        try {
          await userService.delete(id);
          toast.success(`User "${username}" berhasil dihapus permanen`);
          closeConfirmModal();
          fetchUsers();
        } catch (error: any) {
          console.error("Error deleting user:", error);
          const msg = error.response?.data?.message || "Gagal menghapus user";

          setConfirmModal({
            isOpen: true,
            title: "Gagal Menghapus",
            message: msg,
            variant: "danger",
            isLoading: false,
            onConfirm: closeConfirmModal,
            confirmLabel: "Tutup",
            cancelLabel: "",
          } as any);
        }
      },
    });
  };

  const handleDeactivate = (id: string, username: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Nonaktifkan User",
      message: `Apakah Anda yakin ingin menonaktifkan user "${username}"? User tidak akan bisa login.`,
      variant: "warning",
      isLoading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        try {
          await userService.update(id, { isActive: false });
          toast.success(`User "${username}" berhasil dinonaktifkan`);
          closeConfirmModal();
          fetchUsers();
        } catch (error) {
          console.error("Error deactivating user:", error);
          toast.error("Gagal menonaktifkan user");
          closeConfirmModal();
        }
      },
    });
  };

  const handleReactivate = async (id: string) => {
    try {
      await userService.update(id, { isActive: true });
      toast.success("User berhasil diaktifkan kembali");
      fetchUsers();
    } catch (error) {
      console.error("Error reactivating user:", error);
      toast.error("Gagal mengaktifkan user");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F0F0F]">
        <Loader2 size={32} className="animate-spin text-[#C5A059]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">
            User{" "}
            <span className="font-medium italic text-[#C5A059]">
              Management
            </span>
          </h1>
          <p className="text-[#808080] text-sm mt-2 max-w-lg">
            Kelola akses dan role pengguna sistem (Admin & Owner).
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#C5A059] text-white text-[11px] font-bold tracking-[0.15em] rounded-sm hover:bg-[#b08d4b] transition-colors uppercase"
        >
          <Plus size={16} />
          Tambah User
        </button>
      </header>

      {/* Search & Stats */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#808080]"
            size={16}
          />
          <input
            type="text"
            placeholder="Cari username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm text-sm text-white outline-none focus:border-[#C5A059] transition-all placeholder:text-[#4A4A4A]"
          />
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm flex items-center gap-3">
            <Shield size={16} className="text-[#C5A059]" />
            <span className="text-sm font-medium text-white">
              {users.filter((u) => u.isActive && u.role === "OWNER").length}{" "}
              Owner
            </span>
          </div>
          <div className="px-6 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm flex items-center gap-3">
            <Users size={16} className="text-[#A19E95]" />
            <span className="text-sm font-medium text-white">
              {users.filter((u) => u.isActive && u.role === "ADMIN").length}{" "}
              Admin
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {/* Users List - Desktop Table */}
      <div className="hidden md:block bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#2A2A2A] bg-[#0F0F0F]">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080]">
                Username
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080]">
                Role
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080]">
                Status
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080]">
                Created At
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#808080] text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2A]">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-[#C5A059]/5 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        user.role === "OWNER"
                          ? "bg-[#C5A059] text-white"
                          : "bg-[#2A2A2A] text-[#808080]"
                      }`}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-white">
                      {user.username}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${
                      user.role === "OWNER"
                        ? "bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20"
                        : "bg-[#2A2A2A] text-[#A19E95] border border-[#3A3A3A]"
                    }`}
                  >
                    {user.role === "OWNER" && <Shield size={10} />}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      user.isActive ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-[#808080]">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-2 text-[#808080] hover:text-white hover:bg-[#2A2A2A] rounded-sm transition-colors"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    {user.isActive ? (
                      <button
                        onClick={() => handleDeactivate(user.id, user.username)}
                        className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-sm transition-colors"
                        title="Nonaktifkan (Deactivate)"
                      >
                        <Ban size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivate(user.id)}
                        className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-sm transition-colors"
                        title="Aktifkan Kembali"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(user.id, user.username)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-sm transition-colors"
                      title="Hapus Permanen"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Users List - Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    user.role === "OWNER"
                      ? "bg-[#C5A059] text-white"
                      : "bg-[#2A2A2A] text-[#808080]"
                  }`}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-white">{user.username}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
                        user.role === "OWNER"
                          ? "bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20"
                          : "bg-[#2A2A2A] text-[#A19E95] border border-[#3A3A3A]"
                      }`}
                    >
                      {user.role === "OWNER" && <Shield size={8} />}
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  user.isActive ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="pt-3 border-t border-[#2A2A2A] flex items-center justify-between">
              <span className="text-[10px] text-[#808080]">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingUser(user)}
                  className="p-2 text-[#808080] hover:text-white bg-[#2A2A2A] rounded-sm transition-colors"
                >
                  <Edit size={14} />
                </button>
                {user.isActive ? (
                  <button
                    onClick={() => handleDeactivate(user.id, user.username)}
                    className="p-2 text-amber-500 bg-[#2A2A2A] rounded-sm transition-colors"
                  >
                    <Ban size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleReactivate(user.id)}
                    className="p-2 text-emerald-500 bg-[#2A2A2A] rounded-sm transition-colors"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(user.id, user.username)}
                  className="p-2 text-red-500 bg-[#2A2A2A] rounded-sm transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <UserFormModal
          mode="CREATE"
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchUsers();
          }}
        />
      )}

      {/* Edit Modal */}
      {editingUser && (
        <UserFormModal
          mode="EDIT"
          initialData={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            fetchUsers();
          }}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        isLoading={confirmModal.isLoading}
        confirmLabel={(confirmModal as any).confirmLabel}
        cancelLabel={(confirmModal as any).cancelLabel}
      />
    </div>
  );
}

// User Form Modal Component
function UserFormModal({
  mode,
  initialData,
  onClose,
  onSuccess,
}: {
  mode: "CREATE" | "EDIT";
  initialData?: User;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<CreateUserDto & { id?: string }>({
    username: initialData?.username || "",
    pin: "",
    role: initialData?.role || "ADMIN",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!formData.username) {
      setError("Username harus diisi");
      return;
    }
    if (mode === "CREATE" && (!formData.pin || formData.pin.length < 6)) {
      setError("PIN minimal 6 digit");
      return;
    }
    if (mode === "EDIT" && formData.pin && formData.pin.length < 6) {
      setError("PIN baru minimal 6 digit");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (mode === "CREATE") {
        await userService.create(formData);
      } else if (initialData?.id) {
        const updatePayload: UpdateUserDto = {
          username: formData.username,
          role: formData.role,
        };
        if (formData.pin) updatePayload.pin = formData.pin;
        await userService.update(initialData.id, updatePayload);
      }
      toast.success(
        mode === "CREATE"
          ? "User berhasil dibuat"
          : "Data user berhasil disimpan",
      );
      onSuccess();
    } catch (err: any) {
      console.error("Error saving user:", err);
      const msg = err.response?.data?.message || "Gagal menyimpan data user";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A]">
          <h3 className="text-lg font-light text-white">
            {mode === "CREATE" ? "Tambah User Baru" : "Edit User"}
          </h3>
          <button onClick={onClose} className="text-[#808080] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Username */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#808080] block mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-sm text-sm text-white outline-none focus:border-[#C5A059]"
              placeholder="e.g. kasir_pagi"
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#808080] block mb-2">
              Role Access
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["ADMIN", "OWNER"] as Role[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setFormData({ ...formData, role })}
                  className={`py-3 px-4 rounded-sm text-sm font-medium border transition-all ${
                    formData.role === role
                      ? "bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059]"
                      : "bg-[#0F0F0F] border-[#2A2A2A] text-[#808080] hover:border-[#4A4A4A]"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* PIN */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#808080] block mb-2">
              {mode === "CREATE"
                ? "PIN (6 Digit Angka)"
                : "Reset PIN (Optional)"}
            </label>
            <input
              type="password"
              value={formData.pin}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pin: e.target.value.replace(/[^0-9]/g, ""),
                })
              }
              className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-sm text-sm text-white outline-none focus:border-[#C5A059] tracking-widest text-center"
              placeholder={
                mode === "CREATE"
                  ? "******"
                  : "Biarkan kosong jika tidak diubah"
              }
              maxLength={6}
            />
          </div>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 bg-[#C5A059] text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-[#b08d4b] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "SIMPAN USER"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
