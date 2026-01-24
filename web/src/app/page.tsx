"use client";

import Link from "next/link";
import { WashingMachine, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-white p-6 antialiased selection:bg-blue-100">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative w-full max-w-lg">
        <div className="flex flex-col items-center text-center space-y-16">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                System Ready
              </span>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-slate-900 rounded-[2rem] text-white shadow-2xl shadow-slate-200">
                <WashingMachine size={40} strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h1 className="text-5xl font-extralight tracking-tight text-slate-900">
                  Kucucikan<span className="font-semibold">.</span>
                </h1>
                <p className="text-slate-400 text-sm tracking-wide font-medium">
                  Premium Laundry Management
                </p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm space-y-4">
            <Link
              href="/login"
              className="group flex items-center justify-between w-full p-2 pl-6 bg-slate-900 text-white rounded-full transition-all hover:bg-slate-800 active:scale-[0.98] shadow-xl shadow-slate-200"
            >
              <span className="text-xs font-bold uppercase tracking-widest">
                Buka Dashboard
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:translate-x-1">
                <ArrowRight size={20} />
              </div>
            </Link>

            <div className="flex items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Cloud Sync
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  End-to-end Secure
                </span>
              </div>
            </div>
          </div>

          <footer className="pt-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">
              EST. 2026 &mdash; Kucucikan Laundry
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
