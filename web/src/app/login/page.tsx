import { PinForm } from "@/components/features/auth/pin-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#FAF9F6] p-6 antialiased">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E5E2D9_1px,transparent_1px),linear-gradient(to_bottom,#E5E2D9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      <PinForm />
    </main>
  );
}
