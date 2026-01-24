"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Waves, Delete, ArrowRight, Loader2, User } from "lucide-react";
import { toast } from "react-hot-toast";
import { authService } from "@/services/auth.service";

export function PinForm() {
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleNumber = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
      setError(null);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (pin.length !== 6) return;
    setLoading(true);
    setError(null);

    try {
      const data = await authService.login({ username, pin });
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      toast.success(`Selamat datang, ${data.user.username}`);
      if (data.user.role === "OWNER") {
        router.push("/owner");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError("PIN salah");
      toast.error("PIN salah atau akun tidak ditemukan");
      setPin("");
      setTimeout(() => setError(null), 1000);
    } finally {
      setLoading(false);
    }
  }, [pin, username, router]);

  useEffect(() => {
    if (pin.length === 6) {
      handleSubmit();
    }
  }, [pin, handleSubmit]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading) return;

      // Ignore if user is typing in an input field (Username)
      if (document.activeElement?.tagName === "INPUT") return;

      // Number keys
      if (/^[0-9]$/.test(e.key)) {
        handleNumber(e.key);
      }
      // Backspace
      if (e.key === "Backspace") {
        setPin((prev) => prev.slice(0, -1));
      }
      // Tab to switch user type
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading]);

  return (
    <div className="relative w-full max-w-sm flex flex-col items-center">
      {/* Header */}
      <div className="flex flex-col items-center space-y-8 mb-12">
        <div className="flex flex-col items-center space-y-4">
          <Waves size={32} strokeWidth={1} className="text-[#C5A059]" />
          <div className="h-[1px] w-8 bg-[#C5A059]/40" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-[10px] font-bold tracking-[0.5em] text-[#C5A059] uppercase">
            Security Access
          </h1>
          <h2 className="text-2xl font-light tracking-tight text-[#1A1A1A]">
            Otorisasi{" "}
            <span className="italic font-medium text-[#C5A059]">Atelier</span>
          </h2>
        </div>
      </div>

      {/* Username Input */}
      <div className="w-full mb-10 px-8">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A19E95] block mb-3 text-center">
          Masukkan Username
        </label>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            className="w-full bg-[#F5F4F1] border-none rounded-sm py-3 px-12 text-center text-[#1A1A1A] font-medium focus:ring-1 focus:ring-[#C5A059] placeholder:text-gray-300"
            placeholder="Username..."
          />
          <User
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A19E95]"
          />
        </div>
      </div>

      {/* PIN Dots */}
      <div className="flex justify-center gap-5 mb-12">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="relative flex items-center justify-center">
            <div
              className={`w-[8px] h-[8px] rounded-full transition-all duration-300 ${
                error
                  ? "bg-red-400"
                  : pin.length > i
                    ? "bg-[#C5A059] scale-125"
                    : "bg-[#E5E2D9]"
              }`}
            />
            {pin.length === i && !loading && (
              <div className="absolute -bottom-3 w-4 h-[1px] bg-[#C5A059]/50 animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-x-8 gap-y-4 w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumber(num.toString())}
            disabled={loading}
            className="group flex h-16 items-center justify-center text-xl font-light text-[#1A1A1A] transition-all hover:text-[#C5A059] disabled:opacity-20 active:scale-95"
          >
            <span className="relative">
              {num}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C5A059] transition-all group-hover:w-full" />
            </span>
          </button>
        ))}
        <button
          onClick={() => setPin(pin.slice(0, -1))}
          disabled={loading}
          className="flex h-16 items-center justify-center text-[#A19E95] hover:text-[#1A1A1A] transition-colors active:scale-95"
        >
          <Delete size={18} strokeWidth={1.2} />
        </button>
        <button
          onClick={() => handleNumber("0")}
          disabled={loading}
          className="group flex h-16 items-center justify-center text-xl font-light text-[#1A1A1A] transition-all hover:text-[#C5A059] active:scale-95"
        >
          <span className="relative">
            0
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C5A059] transition-all group-hover:w-full" />
          </span>
        </button>
        <button
          onClick={handleSubmit}
          disabled={pin.length !== 6 || loading}
          className="flex h-16 items-center justify-center text-[#C5A059] disabled:text-[#E5E2D9] transition-all hover:scale-110 active:scale-95"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <ArrowRight size={20} strokeWidth={1.2} />
          )}
        </button>
      </div>

      {/* Hint */}
    </div>
  );
}
