import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;

  const mockReportsService = {
    getDashboardSummary: jest.fn(),
    getChartData: jest.fn(),
    getMonthlyFinanceSummary: jest.fn(),
    exportTransactions: jest.fn(),
  };

  const mockSummary = {
    date: new Date(),
    summary: {
      totalRevenue: 50000,
      totalTransactions: 10,
      activeMachines: 2,
      totalMachines: 5,
      completedOrders: 5,
      pendingOrders: 3,
    },
    lowStockItems: [],
    lowStockCount: 2,
  };

  const mockChartData = {
    revenueChart: [{ name: 'Mon', value: 10000 }],
    serviceChart: [{ name: 'Cuci Kering', value: 15 }],
    paymentChart: [{ name: 'CASH', value: 80000 }],
  };

  const mockFinanceSummary = {
    period: 'January 2024',
    income: 500000,
    expense: 100000,
    netProfit: 400000,
    breakdown: { cash: 300000, digital: 200000 },
    details: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [{ provide: ReportsService, useValue: mockReportsService }],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should return dashboard summary', async () => {
      mockReportsService.getDashboardSummary.mockResolvedValue(mockSummary);

      const result = await controller.getDashboard();

      expect(mockReportsService.getDashboardSummary).toHaveBeenCalled();
      expect(result).toEqual(mockSummary);
    });
  });

  describe('getCharts', () => {
    it('should return chart data', async () => {
      mockReportsService.getChartData.mockResolvedValue(mockChartData);

      const result = await controller.getCharts();

      expect(mockReportsService.getChartData).toHaveBeenCalled();
      expect(result).toEqual(mockChartData);
    });
  });

  describe('getFinance', () => {
    it('should return finance summary without date params', async () => {
      mockReportsService.getMonthlyFinanceSummary.mockResolvedValue(
        mockFinanceSummary,
      );

      const result = await controller.getFinance({});

      expect(mockReportsService.getMonthlyFinanceSummary).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
      expect(result).toEqual(mockFinanceSummary);
    });

    it('should return finance summary with date params', async () => {
      mockReportsService.getMonthlyFinanceSummary.mockResolvedValue(
        mockFinanceSummary,
      );

      const result = await controller.getFinance({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(mockReportsService.getMonthlyFinanceSummary).toHaveBeenCalledWith(
        '2024-01-01',
        '2024-01-31',
      );
    });
  });

  describe('export', () => {
    it('should return CSV data', async () => {
      const csvData = 'Tanggal,Invoice,Pelanggan\n2024-01-15,INV-001,John';
      mockReportsService.exportTransactions.mockResolvedValue(csvData);
      const mockResponse = { send: jest.fn() };

      await controller.export(mockResponse as any, {});

      expect(mockReportsService.exportTransactions).toHaveBeenCalled();
      expect(mockResponse.send).toHaveBeenCalledWith(csvData);
    });

    it('should pass date params for export', async () => {
      mockReportsService.exportTransactions.mockResolvedValue('csv data');
      const mockResponse = { send: jest.fn() };

      await controller.export(mockResponse as any, {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(mockReportsService.exportTransactions).toHaveBeenCalledWith(
        '2024-01-01',
        '2024-01-31',
      );
    });
  });
});
