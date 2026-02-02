import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesService } from './expenses.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let prisma: PrismaService;

  const mockTransaction = jest.fn();

  const mockPrismaService = {
    shift: {
      findFirst: jest.fn(),
    },
    expense: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    inventoryItem: {
      update: jest.fn(),
    },
    inventoryLog: {
      create: jest.fn(),
    },
    $transaction: mockTransaction,
  };

  const mockShift = {
    id: 'shift-1',
    cashierId: 'cashier-1',
    endTime: null,
  };

  const mockExpense = {
    id: 'expense-1',
    shiftId: 'shift-1',
    category: 'SUPPLIES',
    amount: 50000,
    note: 'Beli detergen',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if no active shift', async () => {
      mockPrismaService.shift.findFirst.mockResolvedValue(null);

      const createDto = { category: 'SUPPLIES', amount: 50000, note: 'Test' };

      await expect(service.create('user-1', createDto)).rejects.toThrow(
        new BadRequestException(
          'You must have an active shift to record expenses',
        ),
      );
    });

    it('should create expense without inventory update', async () => {
      mockPrismaService.shift.findFirst.mockResolvedValue(mockShift);
      mockTransaction.mockImplementation(async (callback) => {
        const tx = {
          expense: {
            create: jest.fn().mockResolvedValue(mockExpense),
          },
          inventoryItem: { update: jest.fn() },
          inventoryLog: { create: jest.fn() },
        };
        return callback(tx);
      });

      const createDto = { category: 'SUPPLIES', amount: 50000, note: 'Test' };

      const result = await service.create('cashier-1', createDto);

      expect(mockPrismaService.shift.findFirst).toHaveBeenCalledWith({
        where: { cashierId: 'cashier-1', endTime: null },
      });
      expect(result).toBeDefined();
    });

    it('should create expense with inventory restock', async () => {
      mockPrismaService.shift.findFirst.mockResolvedValue(mockShift);
      mockTransaction.mockImplementation(async (callback) => {
        const tx = {
          expense: {
            create: jest.fn().mockResolvedValue(mockExpense),
          },
          inventoryItem: { update: jest.fn() },
          inventoryLog: { create: jest.fn() },
        };
        return callback(tx);
      });

      const createDto = {
        category: 'SUPPLIES',
        amount: 50000,
        note: 'Beli detergen',
        inventoryItemId: 1,
        restockQuantity: 10,
      };

      const result = await service.create('cashier-1', createDto);

      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all expenses with shift info', async () => {
      const expenses = [mockExpense];
      mockPrismaService.expense.findMany.mockResolvedValue(expenses);

      const result = await service.findAll();

      expect(mockPrismaService.expense.findMany).toHaveBeenCalledWith({
        include: { shift: { include: { cashier: true } } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(expenses);
    });
  });

  describe('findOne', () => {
    it('should return expense by id', async () => {
      mockPrismaService.expense.findUnique.mockResolvedValue(mockExpense);

      const result = await service.findOne('expense-1');

      expect(mockPrismaService.expense.findUnique).toHaveBeenCalledWith({
        where: { id: 'expense-1' },
      });
      expect(result).toEqual(mockExpense);
    });
  });

  describe('remove', () => {
    it('should delete expense by id', async () => {
      mockPrismaService.expense.delete.mockResolvedValue(mockExpense);

      const result = await service.remove('expense-1');

      expect(mockPrismaService.expense.delete).toHaveBeenCalledWith({
        where: { id: 'expense-1' },
      });
      expect(result).toEqual(mockExpense);
    });
  });
});
