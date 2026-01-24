const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
import { PrismaClient } from '@prisma/client';

export class ReportsService {
  constructor(private prisma: PrismaClient) {}

  async getDashboardSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    console.log(
      `Checking stats for: ${today.toISOString()} to ${tomorrow.toISOString()}`,
    );

    try {
      // 1. Check if tables exist by simple counts
      console.log('1. Checking tables...');
      const orderCount = await this.prisma.order.count();
      console.log(`- Orders table has ${orderCount} rows`);
      const inventoryCount = await this.prisma.inventoryItem.count();
      console.log(`- Inventory table has ${inventoryCount} rows`);

      // 2. Run queries individually to isolate error
      console.log('2. Running query: Revenue...');
      const dailyRevenue = await this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: today, lt: tomorrow },
          statusPayment: 'PAID',
        },
      });
      console.log(`- Revenue: ${dailyRevenue._sum.totalAmount}`);

      console.log('3. Running query: Transactions Count...');
      const transactionsCount = await this.prisma.order.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      });
      console.log(`- Transactions: ${transactionsCount}`);

      console.log('4. Running query: Active Orders...');
      // Replicating EXACT query from service
      const activeOrdersCount = await this.prisma.order.count({
        where: {
          statusLaundry: {
            notIn: ['PICKED_UP', 'DONE', 'VOID'],
          },
          statusPayment: { not: 'VOID' },
        },
      });
      console.log(`- Active Orders: ${activeOrdersCount}`);

      console.log('5. Running query: Completed Orders...');
      const completedOrdersCount = await this.prisma.order.count({
        where: {
          createdAt: { gte: today, lt: tomorrow },
          statusLaundry: 'DONE',
        },
      });
      console.log(`- Completed Orders: ${completedOrdersCount}`);

      console.log('6. Running query: Inventory...');
      const allInventoryItems = await this.prisma.inventoryItem.findMany({
        select: {
          name: true,
          stockQuantity: true,
          minStockAlert: true,
          unit: true,
        },
      });
      console.log(`- Fetched ${allInventoryItems.length} inventory items`);

      console.log('✅ ALL QUERIES SUCCESSFUL');

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
      console.error('❌ ERROR CAUGHT:');
      console.error(error);
      throw error;
    }
  }
}

async function main() {
  const prisma = new PrismaClient();
  const service = new ReportsService(prisma);

  try {
    await prisma.$connect();
    console.log('Connected to DB');
    const result = await service.getDashboardSummary();
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Script failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
