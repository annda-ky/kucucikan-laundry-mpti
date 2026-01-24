// =============================================
// AUTH TYPES
// =============================================

export type Role = "OWNER" | "ADMIN";

export interface User {
  id: string;
  username: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  pin: string;
}

// =============================================
// CUSTOMER TYPES
// =============================================

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  dob?: string;
  notes?: string;
  totalSpend: number;
  totalVisits: number;
  lastVisitAt?: string;
  createdAt: string;
}

export interface CreateCustomerDto {
  name: string;
  phone: string;
  address?: string;
  dob?: string;
  notes?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

// =============================================
// SERVICE TYPES
// =============================================

export type UnitType = "KG" | "PCS" | "LOAD";

export interface Service {
  id: number;
  name: string;
  price: number;
  unitType: UnitType;
  defaultDuration: number;
  iconUrl?: string;
  isActive: boolean;
}

export interface CreateServiceDto {
  name: string;
  price: number;
  unitType: UnitType;
  defaultDuration?: number;
  iconUrl?: string;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {
  isActive?: boolean;
}

// =============================================
// MACHINE TYPES
// =============================================

export type MachineStatus = "IDLE" | "WASHING" | "OVERDUE" | "BROKEN";

export interface Machine {
  id: number;
  name: string;
  status: MachineStatus;
  currentOrderId?: string;
  remainingTime?: number; // calculated field
}

export interface CreateMachineDto {
  name: string;
}

export interface UpdateMachineDto extends Partial<CreateMachineDto> {
  status?: MachineStatus;
}

// =============================================
// ORDER TYPES
// =============================================

export type StatusLaundry =
  | "PENDING"
  | "WASHING"
  | "DRYING"
  | "IRONING"
  | "DONE"
  | "PICKED_UP"
  | "VOID";

export type PaymentStatus = "UNPAID" | "DP" | "PAID" | "VOID";

export type PaymentMethod = "CASH" | "QRIS" | "DEBIT" | "TRANSFER";

export interface OrderItem {
  id: string;
  serviceId?: number;
  serviceNameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  customerId: string;
  cashierId: string;
  shiftId?: string;
  machineId?: number;
  promoId?: number; // Added
  statusLaundry: StatusLaundry;
  statusPayment: PaymentStatus;
  paymentMethod?: PaymentMethod;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  discountAmount?: number; // Added
  rackLocation?: string;
  washingStartedAt?: string;
  actualDurationMinutes?: number;
  note?: string; // FR-OPS-06
  createdAt: string;
  // Relations
  cameraSnapshot?: string; // Future FR
  // Relations
  customer?: Customer;
  cashier?: User;
  machine?: Machine;
  promo?: Promo; // Added
  orderItems?: OrderItem[];
}

export interface CreateOrderItemDto {
  serviceId: number;
  quantity: number;
}

export interface CreateOrderDto {
  customerId: string;
  machineId?: number;
  duration?: number;
  note?: string;
  items: CreateOrderItemDto[];
}

export interface PayOrderDto {
  paidAmount: number;
  paymentMethod?: PaymentMethod;
}

export interface VoidOrderDto {
  ownerPin: string;
}

// =============================================
// SHIFT TYPES
// =============================================

export interface Shift {
  id: string;
  cashierId: string;
  startTime: string;
  endTime?: string;
  startCash: number;
  systemExpectedCash?: number;
  actualCashClosing?: number;
  difference?: number;
  cashier?: User;
}

export interface CreateShiftDto {
  startCash: number;
}

export interface UpdateShiftDto {
  actualCashClosing: number;
}

// =============================================
// EXPENSE TYPES
// =============================================

export type ExpenseCategory = "FOOD" | "SOAP" | "FUEL" | "OTHER";

export interface Expense {
  id: string;
  shiftId: string;
  relatedInventoryItemId?: number;
  category: ExpenseCategory;
  amount: number;
  note?: string;
  createdAt: string;
}

export interface CreateExpenseDto {
  category: ExpenseCategory;
  amount: number;
  relatedInventoryItemId?: number;
  note?: string;
}

// =============================================
// INVENTORY TYPES
// =============================================

export type InventoryLogType = "PURCHASE" | "USAGE" | "ADJUSTMENT";

export interface InventoryItem {
  id: number;
  name: string;
  unit: string;
  stockQuantity: number;
  minStockAlert: number;
}

export interface CreateInventoryItemDto {
  name: string;
  unit: string;
  stockQuantity?: number;
  minStockAlert?: number;
}

export interface UpdateStockDto {
  changeAmount: number;
  type: InventoryLogType;
}

// =============================================
// REPORT TYPES
// =============================================

export interface DashboardSummary {
  totalRevenue: number;
  totalTransactions: number;
  activeMachines: number;
  totalMachines: number;
  completedOrders: number;
  pendingOrders: number;
}

export interface FinanceSummary {
  period: string;
  income: number;
  expense: number;
  netProfit: number;
  breakdown?: {
    cash: number;
    digital: number;
  };
  details?: {
    id: string;
    date: string;
    type: string;
    amount: number;
    description: string;
    category: string;
  }[];
}

// =============================================
// COMMON TYPES
// =============================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type PromoType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface Promo {
  id: number;
  code: string;
  description?: string;
  type: PromoType;
  value: number;
  validUntil?: string;
  isActive: boolean;
}

export interface CreatePromoDto {
  code: string;
  type: PromoType;
  value: number;
  description?: string;
  validUntil?: string;
}
