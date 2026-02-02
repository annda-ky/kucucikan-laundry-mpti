"use client";

import { useState, useEffect } from "react";
import { User, Phone, Search, ArrowRight, X } from "lucide-react";
import { customerService } from "@/services/customer.service";
import type { Customer } from "@/types";

interface CustomerStepProps {
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  newCustomer: { name: string; phone: string };
  onUpdateNewCustomer: (data: { name: string; phone: string }) => void;
  onNext: () => void;
}

export function CustomerStep({
  selectedCustomer,
  onSelectCustomer,
  newCustomer,
  onUpdateNewCustomer,
  onNext,
}: CustomerStepProps) {
  const [phoneSearch, setPhoneSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);

  // Search customer by phone (FR-POS-03: 4 digit search)
  useEffect(() => {
    const search = async () => {
      if (phoneSearch.length >= 4) {
        try {
          const results = await customerService.searchByPhone(phoneSearch);
          setSearchResults(results);
        } catch {
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    };
    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [phoneSearch]);

  return (
    <div className="space-y-6">
      <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
        Data Pelanggan
      </h3>

      {selectedCustomer ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
              <User size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]">
                {selectedCustomer.name}
              </p>
              <p className="text-[11px] text-[#A19E95]">
                {customerService.formatPhone(selectedCustomer.phone)}
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectCustomer(null)}
            className="text-[#A19E95] hover:text-red-500"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <>
          {/* Search Existing Customer */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
              Cari Pelanggan (4 digit terakhir HP)
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E5E2D9]"
              />
              <input
                type="text"
                placeholder="Ketik 4 digit terakhir..."
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="border border-[#F0EDE4] rounded-sm divide-y divide-[#F0EDE4]">
                {searchResults.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCustomer(c);
                      setPhoneSearch("");
                      setSearchResults([]);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-[#FAF9F6] text-left transition-colors"
                  >
                    <User size={14} className="text-[#C5A059]" />
                    <div>
                      <p className="text-sm text-[#1A1A1A]">{c.name}</p>
                      <p className="text-[10px] text-[#A19E95]">{c.phone}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-[#F0EDE4]" />
            <span className="text-[10px] font-bold text-[#A19E95]">ATAU</span>
            <div className="flex-1 h-[1px] bg-[#F0EDE4]" />
          </div>

          {/* New Customer */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A19E95]">
              Pelanggan Baru
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <User
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E5E2D9]"
                />
                <input
                  type="text"
                  placeholder="Nama..."
                  value={newCustomer.name}
                  onChange={(e) =>
                    onUpdateNewCustomer({
                      ...newCustomer,
                      name: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
                />
              </div>
              <div className="relative">
                <Phone
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E5E2D9]"
                />
                <input
                  type="tel"
                  placeholder="0812..."
                  value={newCustomer.phone}
                  onChange={(e) =>
                    onUpdateNewCustomer({
                      ...newCustomer,
                      phone: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-[#F0EDE4] rounded-sm text-sm outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>
          </div>
        </>
      )}

      <button
        onClick={onNext}
        disabled={
          !selectedCustomer && (!newCustomer.name || !newCustomer.phone)
        }
        className="w-full py-3.5 bg-[#1A1A1A] text-white text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-[#C5A059] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        Lanjut Pilih Layanan
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
