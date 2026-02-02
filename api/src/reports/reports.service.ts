import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { StatusLaundry, PaymentStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardSummary() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // 1. Basic Counts
      const [
        totalRevenueAgg,
        todayRevenueAgg,
        totalOrders,
        activeOrders,
        todayCompleted,
        inventoryAlerts,
      ] = await Promise.all([
        // Total Revenue All Time
        this.prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { statusPayment: 'PAID' },
        }),
        // Today Revenue
        this.prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: {
            statusPayment: 'PAID',
            createdAt: { gte: today, lt: tomorrow },
          },
        }),
        // Total Transactions Today
        this.prisma.order.count({
          where: {
            createdAt: { gte: today, lt: tomorrow },
          },
        }),
        // Active Orders
        this.prisma.order.count({
          where: {
            statusLaundry: { in: ['PENDING', 'WASHING', 'DRYING', 'IRONING'] },
            statusPayment: { not: 'VOID' },
          },
        }),
        // Completed Today
        this.prisma.order.count({
          where: {
            statusLaundry: 'DONE',
            createdAt: { gte: today, lt: tomorrow },
          },
        }),
        // Inventory Alerts
        this.prisma.inventoryItem.count({
          where: {
            stockQuantity: {
              lte: this.prisma.inventoryItem.fields.minStockAlert,
            },
          },
        }),
      ]);

      return {
        date: new Date(),
        summary: {
          totalRevenue: Number(todayRevenueAgg._sum.totalAmount || 0),
          totalTransactions: totalOrders,
          activeMachines: 0, // Fetched from machine service separately
          totalMachines: 0,
          completedOrders: todayCompleted,
          pendingOrders: activeOrders,
        },
        lowStockItems: [], // Optimization: Don't send full list here, just count is enough for badges
        lowStockCount: inventoryAlerts,
      };
    } catch (error) {
      console.error('SERVER ERROR in getDashboardSummary:', error);
      throw error;
    }
  }

  async getChartData() {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // 1. Daily Revenue (Last 7 Days)
    const revenueRaw = await this.prisma.order.groupBy({
      by: ['createdAt'],
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: sevenDaysAgo },
        statusPayment: 'PAID',
      },
    });

    const dailyRevenueMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      // Use local YYYY-MM-DD to match user's timezone perspective (Asia/Jakarta)
      const dateKey = d.toLocaleDateString('en-CA', {
        timeZone: 'Asia/Jakarta',
      });
      dailyRevenueMap.set(dateKey, 0);
    }

    revenueRaw.forEach((item) => {
      // Use local YYYY-MM-DD
      const dateKey = item.createdAt.toLocaleDateString('en-CA', {
        timeZone: 'Asia/Jakarta',
      });

      // Update existing key or add new one (though map should cover the range)
      // Note: If data falls outside the 7-day range due to edge cases, it's safer to check first
      if (dailyRevenueMap.has(dateKey)) {
        const current = dailyRevenueMap.get(dateKey) || 0;
        dailyRevenueMap.set(
          dateKey,
          current + Number(item._sum.totalAmount || 0),
        );
      }
    });

    const revenueChart = Array.from(dailyRevenueMap.entries()).map(
      ([date, value]) => ({
        name: new Date(date).toLocaleDateString('id-ID', { weekday: 'short' }),
        value,
      }),
    );

    // 2. Top Services (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const topServicesRaw = await this.prisma.orderItem.groupBy({
      by: ['serviceNameSnapshot'],
      _count: { id: true },
      where: {
        order: {
          createdAt: { gte: thirtyDaysAgo },
          statusPayment: { not: 'VOID' },
        },
      },
      orderBy: {
        _count: { id: 'desc' },
      },
      take: 5,
    });

    const serviceChart = topServicesRaw.map((item) => ({
      name: item.serviceNameSnapshot,
      value: item._count.id,
    }));

    // 3. Payment Methods (Last 30 Days)
    const paymentMethodsRaw = await this.prisma.order.groupBy({
      by: ['paymentMethod'],
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: thirtyDaysAgo },
        statusPayment: 'PAID',
      },
    });

    const paymentMap = new Map<string, number>();

    paymentMethodsRaw.forEach((item) => {
      // Normalize name: Handle null/undefined and ensure uppercase
      const name = (item.paymentMethod || 'CASH').toUpperCase();
      const current = paymentMap.get(name) || 0;
      paymentMap.set(name, current + Number(item._sum.totalAmount || 0));
    });

    const paymentChart = Array.from(paymentMap.entries()).map(
      ([name, value]) => ({
        name,
        value,
      }),
    );

    return {
      revenueChart,
      serviceChart,
      paymentChart,
    };
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
