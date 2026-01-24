"use client";

import { useState, useEffect } from "react";
import { Package, Clock, DollarSign } from "lucide-react";
import { serviceService } from "@/services/service.service";
import type { Service } from "@/types";

export default function OwnerServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await serviceService.getAll();
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light text-white tracking-tight">
          Katalog{" "}
          <span className="text-[#C5A059] font-medium italic">Layanan</span>
        </h1>
        <p className="text-[#808080] text-sm">
          Daftar layanan dan harga yang aktif
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className={`p-6 bg-[#1A1A1A] border rounded-sm transition-all ${
              service.isActive
                ? "border-[#2A2A2A] hover:border-[#C5A059]/30"
                : "border-[#2A2A2A] opacity-50"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0F0F0F] rounded-sm flex items-center justify-center text-xl border border-[#2A2A2A]">
                  {serviceService.getIcon(service.name)}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">
                    {service.name}
                  </h3>
                  <p className="text-[10px] text-[#808080]">
                    {serviceService.getUnitTypeLabel(service.unitType)}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-[9px] font-bold rounded ${
                  service.isActive
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                {service.isActive ? "AKTIF" : "NONAKTIF"}
              </span>
            </div>

            <div className="space-y-2 pt-4 border-t border-[#2A2A2A]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#808080] flex items-center gap-1">
                  <DollarSign size={12} /> Harga
                </span>
                <span className="font-medium text-[#C5A059]">
                  {serviceService.formatPrice(service.price)}
                  <span className="text-[10px] text-[#808080] ml-1">
                    /{serviceService.getUnitTypeShort(service.unitType)}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#808080] flex items-center gap-1">
                  <Clock size={12} /> Durasi
                </span>
                <span className="text-white">
                  {service.defaultDuration} menit
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
