"use client";

import { orderService } from "@/services/order.service";
import type { Order, StatusLaundry } from "@/types";

interface OperationSummaryProps {
  orders: Order[];
}

export function OperationSummary({ orders }: OperationSummaryProps) {
  const statuses: StatusLaundry[] = ["PENDING", "WASHING", "DRYING", "IRONING"];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statuses.map((status) => {
        const count = orders.filter((o) => o.statusLaundry === status).length;
        return (
          <div
            key={status}
            className="bg-white border border-[#F0EDE4] rounded-sm p-4 text-center"
          >
            <p className="text-2xl font-bold text-[#1A1A1A]">{count}</p>
            <p
              className={`text-[10px] font-bold uppercase tracking-[0.1em] ${orderService.getLaundryStatusColor(status)}`}
            >
              {orderService.getLaundryStatusLabel(status)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
