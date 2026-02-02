import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma.service';
import { PromosService } from '../promos/promos.service';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

jest.mock('bcrypt');

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;
  let promosService: PromosService;

  const mockTransaction = jest.fn((callback) => callback(mockPrismaService));

  const mockPrismaService = {
    shift: {
      findFirst: jest.fn(),
    },
    service: {
      findUnique: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    machine: {
      update: jest.fn(),
    },
    customer: {
      update: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
    inventoryItem: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    inventoryLog: {
      create: jest.fn(),
    },
    $transaction: mockTransaction,
  };

  const mockPromosService = {
    findByCode: jest.fn(),
    calculateDiscount: jest.fn(),
  };

  const mockShift = {
    id: 'shift-1',
    cashierId: 'cashier-1',
    startCash: new Prisma.Decimal(100000),
    endTime: null,
  };

  const mockOrder = {
    id: 'order-1',
    invoiceNumber: 'INV-123',
    customerId: 'customer-1',
    cashierId: 'cashier-1',
    shiftId: 'shift-1',
    machineId: null,
    totalAmount: new Prisma.Decimal(50000),
    discountAmount: null,
    paidAmount: null,
    changeAmount: null,
    paymentMethod: null,
    statusPayment: 'UNPAID',
    statusLaundry: 'PENDING',
    orderItems: [],
    customer: { id: 'customer-1', name: 'John' },
  };

  const mockServiceItem = {
    id: 1,
    name: 'Cuci Kering',
    price: new Prisma.Decimal(25000),
    recipes: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PromosService, useValue: mockPromosService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
    promosService = module.get<PromosService>(PromosService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if no active shift', async () => {
      mockPrismaService.shift.findFirst.mockResolvedValue(null);

      const createDto = {
        customerId: 'customer-1',
        items: [{ serviceId: 1, quantity: 2 }],
      };

      await expect(service.create(createDto, 'cashier-1')).rejects.toThrow(
        new BadRequestException(
          'Cashier must start a shift before creating orders',
        ),
      );
    });

    it('should throw NotFoundException if service not found', async () => {
      mockPrismaService.shift.findFirst.mockResolvedValue(mockShift);
      mockPrismaService.service.findUnique.mockResolvedValue(null);

      const createDto = {
        customerId: 'customer-1',
        items: [{ serviceId: 999, quantity: 2 }],
      };

      await expect(service.create(createDto, 'cashier-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create order successfully', async () => {
      mockPrismaService.shift.findFirst.mockResolvedValue(mockShift);
      mockPrismaService.service.findUnique.mockResolvedValue(mockServiceItem);
      mockTransaction.mockImplementation(async (callback) => {
        const tx = {
          order: { create: jest.fn().mockResolvedValue(mockOrder) },
          service: { findUnique: jest.fn().mockResolvedValue(mockServiceItem) },
          machine: { update: jest.fn() },
        };
        return callback(tx);
      });

      const createDto = {
        customerId: 'customer-1',
        items: [{ serviceId: 1, quantity: 2 }],
      };

      const result = await service.create(createDto, 'cashier-1');

      expect(mockPrismaService.shift.findFirst).toHaveBeenCalledWith({
        where: { cashierId: 'cashier-1', endTime: null },
      });
      expect(result).toBeDefined();
    });
  });

  describe('payOrder', () => {
    it('should throw NotFoundException if order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.payOrder('order-1', { paidAmount: 50000 }),
      ).rejects.toThrow(new NotFoundException('Order tidak ditemukan'));
    });

    it('should throw BadRequestException if order already paid', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        statusPayment: 'PAID',
      });

      await expect(
        service.payOrder('order-1', { paidAmount: 50000 }),
      ).rejects.toThrow(new BadRequestException('Order sudah lunas'));
    });

    it('should throw BadRequestException if paid amount is insufficient', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.payOrder('order-1', { paidAmount: 10000 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should pay order successfully', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockTransaction.mockImplementation(async (callback) => {
        const tx = {
          order: {
            update: jest
              .fn()
              .mockResolvedValue({ ...mockOrder, statusPayment: 'PAID' }),
          },
          customer: { update: jest.fn() },
        };
        return callback(tx);
      });

      const result = await service.payOrder('order-1', { paidAmount: 50000 });

      expect(result).toBeDefined();
    });
  });

  describe('voidOrder', () => {
    it('should throw NotFoundException if order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.voidOrder('order-1', { ownerPin: '1234' }),
      ).rejects.toThrow(new NotFoundException('Order tidak ditemukan'));
    });

    it('should throw UnauthorizedException if owner not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.voidOrder('order-1', { ownerPin: '1234' }),
      ).rejects.toThrow(
        new UnauthorizedException('Data Owner tidak ditemukan'),
      );
    });

    it('should throw UnauthorizedException if PIN is wrong', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'owner-1',
        pin_hash: 'hashed_pin',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.voidOrder('order-1', { ownerPin: 'wrong' }),
      ).rejects.toThrow(new UnauthorizedException('PIN Owner Salah!'));
    });
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const orders = [mockOrder];
      mockPrismaService.order.findMany.mockResolvedValue(orders);
      mockPrismaService.order.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: orders,
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
    it('should return order by id', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findOne('order-1');

      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockOrder);
    });
  });

  describe('applyPromo', () => {
    it('should throw NotFoundException if order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.applyPromo('order-1', 'PROMO10')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if order already paid', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        statusPayment: 'PAID',
      });

      await expect(service.applyPromo('order-1', 'PROMO10')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
