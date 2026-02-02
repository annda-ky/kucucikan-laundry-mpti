import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    order: {
      aggregate: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    orderItem: {
      groupBy: jest.fn(),
    },
    expense: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
    inventoryItem: {
      count: jest.fn(),
      fields: {
        minStockAlert: 'minStockAlert',
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardSummary', () => {
    it('should return dashboard summary with correct structure', async () => {
      mockPrismaService.order.aggregate
        .mockResolvedValueOnce({
          _sum: { totalAmount: new Prisma.Decimal(1000000) },
        })
        .mockResolvedValueOnce({
          _sum: { totalAmount: new Prisma.Decimal(50000) },
        });
      mockPrismaService.order.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(5);
      mockPrismaService.inventoryItem.count.mockResolvedValue(2);

      const result = await service.getDashboardSummary();

      expect(result).toHaveProperty('date');
      expect(result).toHaveProperty('summary');
      expect(result.summary).toHaveProperty('totalRevenue');
      expect(result.summary).toHaveProperty('totalTransactions');
      expect(result.summary).toHaveProperty('completedOrders');
      expect(result.summary).toHaveProperty('pendingOrders');
      expect(result).toHaveProperty('lowStockCount');
    });

    it('should handle zero revenue properly', async () => {
      mockPrismaService.order.aggregate.mockResolvedValue({
        _sum: { totalAmount: null },
      });
      mockPrismaService.order.count.mockResolvedValue(0);
      mockPrismaService.inventoryItem.count.mockResolvedValue(0);

      const result = await service.getDashboardSummary();

      expect(result.summary.totalRevenue).toBe(0);
    });
  });

  describe('getChartData', () => {
    it('should return chart data with correct structure', async () => {
      mockPrismaService.order.groupBy
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockPrismaService.orderItem.groupBy.mockResolvedValue([]);

      const result = await service.getChartData();

      expect(result).toHaveProperty('revenueChart');
      expect(result).toHaveProperty('serviceChart');
      expect(result).toHaveProperty('paymentChart');
      expect(result.revenueChart).toHaveLength(7);
    });

    it('should aggregate revenue data correctly', async () => {
      const today = new Date();
      mockPrismaService.order.groupBy
        .mockResolvedValueOnce([
          {
            createdAt: today,
            _sum: { totalAmount: new Prisma.Decimal(100000) },
          },
        ])
        .mockResolvedValueOnce([
          {
            paymentMethod: 'CASH',
            _sum: { totalAmount: new Prisma.Decimal(80000) },
          },
          {
            paymentMethod: 'DIGITAL',
            _sum: { totalAmount: new Prisma.Decimal(20000) },
          },
        ]);
      mockPrismaService.orderItem.groupBy.mockResolvedValue([
        { serviceNameSnapshot: 'Cuci Kering', _count: { id: 15 } },
      ]);

      const result = await service.getChartData();

      expect(result.serviceChart).toHaveLength(1);
      expect(result.serviceChart[0].name).toBe('Cuci Kering');
      expect(result.paymentChart.length).toBeGreaterThan(0);
    });
  });

  describe('getMonthlyFinanceSummary', () => {
    it('should return finance summary for current month', async () => {
      mockPrismaService.order.aggregate
        .mockResolvedValueOnce({
          _sum: { totalAmount: new Prisma.Decimal(500000) },
        })
        .mockResolvedValueOnce({
          _sum: { totalAmount: new Prisma.Decimal(300000) },
        });
      mockPrismaService.expense.aggregate.mockResolvedValue({
        _sum: { amount: new Prisma.Decimal(100000) },
      });
      mockPrismaService.order.findMany.mockResolvedValue([]);
      mockPrismaService.expense.findMany.mockResolvedValue([]);

      const result = await service.getMonthlyFinanceSummary();

      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('income');
      expect(result).toHaveProperty('expense');
      expect(result).toHaveProperty('netProfit');
      expect(result).toHaveProperty('breakdown');
      expect(result.netProfit).toBe(result.income - result.expense);
    });

    it('should return finance summary for custom date range', async () => {
      mockPrismaService.order.aggregate
        .mockResolvedValueOnce({
          _sum: { totalAmount: new Prisma.Decimal(200000) },
        })
        .mockResolvedValueOnce({
          _sum: { totalAmount: new Prisma.Decimal(150000) },
        });
      mockPrismaService.expense.aggregate.mockResolvedValue({
        _sum: { amount: new Prisma.Decimal(50000) },
      });
      mockPrismaService.order.findMany.mockResolvedValue([]);
      mockPrismaService.expense.findMany.mockResolvedValue([]);

      const result = await service.getMonthlyFinanceSummary(
        '2024-01-01',
        '2024-01-31',
      );

      expect(result.period).toBe('2024-01-01 - 2024-01-31');
      expect(result.income).toBe(200000);
      expect(result.expense).toBe(50000);
    });

    it('should correctly calculate cash and digital breakdown', async () => {
      mockPrismaService.order.aggregate
        .mockResolvedValueOnce({
          _sum: { totalAmount: new Prisma.Decimal(100000) },
        })
        .mockResolvedValueOnce({
          _sum: { totalAmount: new Prisma.Decimal(60000) },
        });
      mockPrismaService.expense.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });
      mockPrismaService.order.findMany.mockResolvedValue([]);
      mockPrismaService.expense.findMany.mockResolvedValue([]);

      const result = await service.getMonthlyFinanceSummary();

      expect(result.breakdown.cash).toBe(60000);
      expect(result.breakdown.digital).toBe(40000);
    });
  });

  describe('exportTransactions', () => {
    it('should export transactions as CSV', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([
        {
          createdAt: new Date('2024-01-15'),
          invoiceNumber: 'INV-001',
          customer: { name: 'John Doe' },
          cashier: { username: 'admin' },
          totalAmount: new Prisma.Decimal(50000),
          statusPayment: 'PAID',
          statusLaundry: 'DONE',
        },
      ]);

      const result = await service.exportTransactions();

      expect(result).toContain('Tanggal,Invoice,Pelanggan');
      expect(result).toContain('INV-001');
      expect(result).toContain('John Doe');
    });

    it('should filter transactions by date range', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([]);

      await service.exportTransactions('2024-01-01', '2024-01-31');

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.any(Object),
          }),
        }),
      );
    });
  });
});
