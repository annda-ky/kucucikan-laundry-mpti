import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { StatusLaundry, PaymentStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardSummary() {
    const today = new Date();
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // 1. Revenue & Payment Status (Simpler Query)
      const dailyRevenue = await this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: today, lt: tomorrow },
          statusPayment: 'PAID',
        },
      });

      // 2. Fetch Raw Data for Counting (In-Memory Filtering) to avoid Enum 500 Errors
      const allOrders = await this.prisma.order.findMany({
        select: {
          statusLaundry: true,
          statusPayment: true,
          createdAt: true,
        },
      });

      const allInventoryItems = await this.prisma.inventoryItem.findMany({
        select: {
          name: true,
          stockQuantity: true,
          minStockAlert: true,
          unit: true,
        },
      });

      // Calculate Stats in In-Memory (Robust)
      const transactionsCount = allOrders.filter(
        (o) => o.createdAt >= today && o.createdAt < tomorrow,
      ).length;

      const activeOrdersCount = allOrders.filter((o) => {
        const isActive = ['PENDING', 'WASHING', 'DRYING', 'IRONING'].includes(
          o.statusLaundry,
        );
        const isNotVoid = o.statusPayment !== 'VOID';
        return isActive && isNotVoid;
      }).length;

      const completedOrdersCount = allOrders.filter(
        (o) =>
          o.statusLaundry === 'DONE' &&
          o.createdAt >= today &&
          o.createdAt < tomorrow,
      ).length;

      const lowStockItems = allInventoryItems.filter(
        (item) => item.stockQuantity <= item.minStockAlert,
      );

      return {
        date: new Date(),
        summary: {
          totalRevenue: Number(dailyRevenue._sum.totalAmount || 0),
          totalTransactions: transactionsCount,
          activeMachines: 0,
          totalMachines: 0,
          completedOrders: completedOrdersCount,
          pendingOrders: activeOrdersCount,
        },
        lowStockItems: lowStockItems,
      };
    } catch (error) {
      console.error('SERVER ERROR in getDashboardSummary:', error);
      throw error;
    }
  }

  async getMonthlyFinanceSummary(startDate?: string, endDate?: string) {
    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      const today = new Date();
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    }

    try {
      const [
        incomeAggregation,
        cashIncomeAggregation,
        expenseAggregation,
        orders,
        expenses,
      ] = await Promise.all([
        // Revenue Aggregation (Total)
        this.prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: {
            createdAt: { gte: start, lte: end },
            statusPayment: 'PAID',
          },
        }),

        // Cash Revenue Aggregation
        this.prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: {
            createdAt: { gte: start, lte: end },
            statusPayment: 'PAID',
            paymentMethod: 'CASH',
          },
        }),

        // Expense Aggregation
        this.prisma.expense.aggregate({
          _sum: { amount: true },
          where: {
            createdAt: { gte: start, lte: end },
          },
        }),

        // Orders List (Incoming)
        this.prisma.order.findMany({
          where: {
            createdAt: { gte: start, lte: end },
            statusPayment: 'PAID',
          },
          select: {
            id: true,
            createdAt: true,
            totalAmount: true,
            invoiceNumber: true,
          },
          orderBy: { createdAt: 'desc' },
        }),

        // Expenses List (Outgoing)
        this.prisma.expense.findMany({
          where: {
            createdAt: { gte: start, lte: end },
          },
          select: {
            id: true,
            createdAt: true,
            amount: true,
            category: true,
            note: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const income = Number(incomeAggregation._sum.totalAmount || 0);
      const incomeCash = Number(cashIncomeAggregation._sum.totalAmount || 0);
      const incomeDigital = income - incomeCash;
      const expense = Number(expenseAggregation._sum.amount || 0);
      const netProfit = income - expense;

      // Normalize Cash Flow Data
      const cashFlow = [
        ...orders.map((o) => ({
          id: o.id,
          date: o.createdAt,
          type: 'INCOMING',
          amount: Number(o.totalAmount),
          description: `Order ${o.invoiceNumber}`,
          category: 'SALES',
        })),
        ...expenses.map((e) => ({
          id: e.id,
          date: e.createdAt,
          type: 'OUTGOING',
          amount: Number(e.amount),
          description: e.note || `Expense (${e.category})`,
          category: e.category,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        period:
          startDate && endDate
            ? `${startDate} - ${endDate}`
            : start.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              }),
        income,
        expense,
        netProfit,
        breakdown: {
          cash: incomeCash,
          digital: incomeDigital,
        },
        details: cashFlow,
      };
    } catch (error) {
      console.error('Error getting finance summary:', error);
      throw error;
    }
  }

  async exportTransactions(startDate?: string, endDate?: string) {
    let whereClause = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      whereClause = {
        createdAt: { gte: start, lte: end },
      };
    }

    const transactions = await this.prisma.order.findMany({
      where: whereClause,
      include: {
        customer: true,
        cashier: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let csv =
      'Tanggal,Invoice,Pelanggan,Kasir,Total,Status Bayar,Status Laundry\n';

    transactions.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      const customer = order.customer.name;
      const cashier = order.cashier.username;
      const total = Number(order.totalAmount);

      csv += `${date},${order.invoiceNumber},${customer},${cashier},${total},${order.statusPayment},${order.statusLaundry}\n`;
    });

    return csv;
  }
}
