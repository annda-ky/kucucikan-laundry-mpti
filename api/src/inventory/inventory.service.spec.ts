import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('InventoryService', () => {
  let service: InventoryService;
  let prisma: PrismaService;

  const mockTransaction = jest.fn();

  const mockPrismaService = {
    inventoryItem: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    inventoryLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: mockTransaction,
  };

  const mockInventoryItem = {
    id: 1,
    name: 'Detergen',
    unit: 'kg',
    stockQuantity: 100,
    minStock: 10,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new inventory item', async () => {
      const createDto = { name: 'Detergen', unit: 'kg', stockQuantity: 100 };
      mockPrismaService.inventoryItem.create.mockResolvedValue(
        mockInventoryItem,
      );

      const result = await service.create(createDto);

      expect(mockPrismaService.inventoryItem.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toEqual(mockInventoryItem);
    });
  });

  describe('findAll', () => {
    it('should return all non-deleted inventory items', async () => {
      const items = [mockInventoryItem];
      mockPrismaService.inventoryItem.findMany.mockResolvedValue(items);

      const result = await service.findAll();

      expect(mockPrismaService.inventoryItem.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(items);
    });
  });

  describe('findOne', () => {
    it('should return inventory item with logs', async () => {
      mockPrismaService.inventoryItem.findUnique.mockResolvedValue({
        ...mockInventoryItem,
        inventoryLogs: [],
      });

      const result = await service.findOne(1);

      expect(mockPrismaService.inventoryItem.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { inventoryLogs: true },
      });
    });
  });

  describe('updateStock', () => {
    it('should increment stock for positive change', async () => {
      const updateDto = { changeAmount: 50, type: 'PURCHASE' as const };
      mockTransaction.mockImplementation(async (callback) => {
        const tx = {
          inventoryItem: {
            findUnique: jest.fn().mockResolvedValue(mockInventoryItem),
            update: jest.fn().mockResolvedValue({
              ...mockInventoryItem,
              stockQuantity: 150,
            }),
            updateMany: jest.fn(),
          },
          inventoryLog: {
            create: jest.fn(),
          },
        };
        return callback(tx);
      });

      const result = await service.updateStock(1, updateDto, 'user-1');

      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if item not found during addition', async () => {
      const updateDto = { changeAmount: 50, type: 'PURCHASE' as const };
      mockTransaction.mockImplementation(async (callback) => {
        const tx = {
          inventoryItem: {
            findUnique: jest.fn().mockResolvedValue(null),
            update: jest.fn(),
            updateMany: jest.fn(),
          },
          inventoryLog: { create: jest.fn() },
        };
        return callback(tx);
      });

      await expect(
        service.updateStock(999, updateDto, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      const updateDto = { changeAmount: -200, type: 'USAGE' as const };
      mockTransaction.mockImplementation(async (callback) => {
        const tx = {
          inventoryItem: {
            findUnique: jest.fn().mockResolvedValue(mockInventoryItem),
            update: jest.fn(),
            updateMany: jest.fn().mockResolvedValue({ count: 0 }),
          },
          inventoryLog: { create: jest.fn() },
        };
        return callback(tx);
      });

      await expect(service.updateStock(1, updateDto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete inventory item', async () => {
      mockPrismaService.inventoryItem.update.mockResolvedValue({
        ...mockInventoryItem,
        isDeleted: true,
      });

      const result = await service.remove(1);

      expect(mockPrismaService.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isDeleted: true },
      });
    });

    it('should throw BadRequestException on error', async () => {
      mockPrismaService.inventoryItem.update.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getLogs', () => {
    it('should return inventory logs', async () => {
      const logs = [
        {
          id: 1,
          inventoryItemId: 1,
          changeAmount: 50,
          type: 'PURCHASE',
          actor: { username: 'admin', role: 'ADMIN' },
        },
      ];
      mockPrismaService.inventoryLog.findMany.mockResolvedValue(logs);

      const result = await service.getLogs(1);

      expect(mockPrismaService.inventoryLog.findMany).toHaveBeenCalledWith({
        where: { inventoryItemId: 1 },
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { username: true, role: true } },
        },
        take: 20,
      });
      expect(result).toEqual(logs);
    });
  });
});
