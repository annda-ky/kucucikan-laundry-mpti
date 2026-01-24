export interface Package {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export interface Order {
  id: string;
  invoice: string;
  customerName: string;
  customerPhone: string;
  packageName: string;
  totalPrice: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  machineName: string;
}

export interface CreateOrderDto {
  machineId: string;
  customerName: string;
  customerPhone: string;
  packageId: string;
}
