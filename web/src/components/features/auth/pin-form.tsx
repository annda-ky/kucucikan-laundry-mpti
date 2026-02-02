"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Waves, Loader2, User } from "lucide-react";
import { toast } from "react-hot-toast";
import { authService } from "@/services/auth.service";
import { PinInput } from "@ark-ui/react/pin-input";

export function PinForm() {
  const [username, setUsername] = useState("");
  const [pinValue, setPinValue] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleValueComplete = async (details: { valueAsString: string }) => {
    const pin = details.valueAsString;

    // 1. Validate PIN Length
    if (pin.length !== 6) return;

    // 2. Validate Username
    if (!username.trim()) {
      toast.error("Mohon isi Username terlebih dahulu");
      setPinValue(Array(6).fill("")); // Reset PIN
      return;
    }

    setLoading(true);

    try {
      const data = await authService.login({ username, pin });
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success(`Selamat datang, ${data.user.username}`);
      if (data.user.role === "OWNER") {
        router.push("/owner");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error("PIN salah atau akun tidak ditemukan");
      setPinValue(Array(6).fill("")); // Reset PIN on error
    } finally {
      // Small delay to prevent jitter if user types fast
      setTimeout(() => setLoading(false), 500);
    }
  };

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
            autoFocus
            className="w-full bg-[#F5F4F1] border-none rounded-sm py-3 px-12 text-center text-[#1A1A1A] font-medium focus:ring-1 focus:ring-[#C5A059] placeholder:text-gray-300"
            placeholder="Username..."
          />
          <User
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A19E95]"
          />
        </div>
      </div>

      {/* Ark UI Pin Input */}
      <PinInput.Root
        value={pinValue}
        onValueChange={(details) => setPinValue(details.value)}
        onValueComplete={handleValueComplete}
        className="flex flex-col items-center gap-6 w-full"
        disabled={loading}
        otp
        mask
        blurOnComplete
      >
        <PinInput.Label className="sr-only">Enter PIN</PinInput.Label>
        <PinInput.Control className="flex gap-3">
          {[0, 1, 2, 3, 4, 5].map((id, index) => (
            <PinInput.Input
              key={id}
              index={index}
              className="w-12 h-12 text-center text-lg font-medium border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 focus:border-[#C5A059] transition-all disabled:opacity-50"
            />
          ))}
        </PinInput.Control>
        <PinInput.HiddenInput />
      </PinInput.Root>

      {/* Loading Indicator */}
      {loading && (
        <div className="mt-8 text-[#C5A059] flex items-center gap-2 animate-pulse">
          <Loader2 size={20} className="animate-spin" /> Verifying...
        </div>
      )}
    </div>
  );
}
