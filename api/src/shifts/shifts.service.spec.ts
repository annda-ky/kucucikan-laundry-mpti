import { Test, TestingModule } from '@nestjs/testing';
import { ShiftsService } from './shifts.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('ShiftsService', () => {
  let service: ShiftsService;
  let prisma: PrismaService;

  const mockTransaction = jest.fn((callback) => callback(mockPrismaService));

  const mockPrismaService = {
    shift: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    order: {
      aggregate: jest.fn(),
    },
    expense: {
      aggregate: jest.fn(),
    },
    $transaction: mockTransaction,
  };

  const mockShift = {
    id: 'shift-1',
    cashierId: 'cashier-1',
    startCash: new Prisma.Decimal(100000),
    startTime: new Date(),
    endTime: null,
    cashier: { id: 'cashier-1', username: 'kasir1', role: 'ADMIN' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ShiftsService>(ShiftsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startShift', () => {
    it('should throw BadRequestException if user already has active shift', async () => {
      mockPrismaService.shift.findFirst.mockResolvedValue(mockShift);

      await expect(
        service.startShift('cashier-1', { startCash: 100000 }),
      ).rejects.toThrow(
        new BadRequestException('You already have an active shift'),
      );
    });

    it('should create new shift successfully', async () => {
      mockPrismaService.shift.findFirst.mockResolvedValue(null);
      mockPrismaService.shift.create.mockResolvedValue(mockShift);

      const result = await service.startShift('cashier-1', {
        startCash: 100000,
      });

      expect(mockPrismaService.shift.create).toHaveBeenCalledWith({
        data: {
          cashierId: 'cashier-1',
          startCash: 100000,
          startTime: expect.any(Date),
        },
      });
      expect(result).toEqual(mockShift);
    });
  });

  describe('endShift', () => {
    it('should throw NotFoundException if no active shift', async () => {
      mockPrismaService.shift.findFirst.mockResolvedValue(null);

      await expect(
        service.endShift('cashier-1', { actualCashClosing: 150000 }),
      ).rejects.toThrow(
        new NotFoundException('No active shift found to close'),
      );
    });

    it('should end shift successfully for ADMIN', async () => {
      mockPrismaService.shift.findFirst.mockResolvedValue(mockShift);
      mockPrismaService.order.aggregate.mockResolvedValue({
        _sum: { totalAmount: new Prisma.Decimal(50000) },
      });
      mockPrismaService.expense.aggregate.mockResolvedValue({
        _sum: { amount: new Prisma.Decimal(10000) },
      });
      mockPrismaService.shift.update.mockResolvedValue({
        ...mockShift,
        endTime: new Date(),
      });

      const result = await service.endShift('cashier-1', {
        actualCashClosing: 140000,
      });

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('Shift closed successfully');
    });
  });

  describe('forceEndShift', () => {
    it('should throw NotFoundException if shift not found', async () => {
      mockPrismaService.shift.findUnique.mockResolvedValue(null);

      await expect(
        service.forceEndShift('shift-1', { actualCashClosing: 150000 }),
      ).rejects.toThrow(new NotFoundException('Shift not found'));
    });

    it('should throw BadRequestException if shift already closed', async () => {
      mockPrismaService.shift.findUnique.mockResolvedValue({
        ...mockShift,
        endTime: new Date(),
      });

      await expect(
        service.forceEndShift('shift-1', { actualCashClosing: 150000 }),
      ).rejects.toThrow(new BadRequestException('Shift already closed'));
    });
  });

  describe('findAll', () => {
    it('should return paginated shifts', async () => {
      const shifts = [mockShift];
      mockPrismaService.shift.findMany.mockResolvedValue(shifts);
      mockPrismaService.shift.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: shifts,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return shift by id with relations', async () => {
      mockPrismaService.shift.findUnique.mockResolvedValue(mockShift);

      const result = await service.findOne('shift-1');

      expect(mockPrismaService.shift.findUnique).toHaveBeenCalledWith({
        where: { id: 'shift-1' },
        include: { cashier: true, orders: true, expenses: true },
      });
      expect(result).toEqual(mockShift);
    });
  });
});
