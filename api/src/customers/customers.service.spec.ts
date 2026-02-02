import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma.service';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    customer: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockCustomer = {
    id: 'customer-1',
    name: 'John Doe',
    phone: '081234567890',
    address: 'Jl. Test No. 1',
    notes: 'Regular customer',
    totalSpend: 100000,
    totalVisits: 5,
    lastVisitAt: new Date('2024-01-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new customer', async () => {
      const createDto = { name: 'John Doe', phone: '081234567890' };
      mockPrismaService.customer.create.mockResolvedValue(mockCustomer);

      const result = await service.create(createDto);

      expect(mockPrismaService.customer.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('findAll', () => {
    it('should return all customers ordered by name', async () => {
      const customers = [mockCustomer];
      mockPrismaService.customer.findMany.mockResolvedValue(customers);

      const result = await service.findAll();

      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(customers);
    });
  });

  describe('findByPhone', () => {
    it('should return customers matching phone suffix', async () => {
      const customers = [mockCustomer];
      mockPrismaService.customer.findMany.mockResolvedValue(customers);

      const result = await service.findByPhone('7890');

      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith({
        where: { phone: { endsWith: '7890' } },
      });
      expect(result).toEqual(customers);
    });
  });

  describe('getLeaderboard', () => {
    it('should return top 10 customers sorted by totalSpend', async () => {
      const customers = [mockCustomer];
      mockPrismaService.customer.findMany.mockResolvedValue(customers);

      const result = await service.getLeaderboard('totalSpend');

      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith({
        take: 10,
        orderBy: { totalSpend: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          totalSpend: true,
          totalVisits: true,
          lastVisitAt: true,
        },
      });
      expect(result).toEqual(customers);
    });

    it('should return top 10 customers sorted by totalVisits', async () => {
      mockPrismaService.customer.findMany.mockResolvedValue([mockCustomer]);

      await service.getLeaderboard('totalVisits');

      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith({
        take: 10,
        orderBy: { totalVisits: 'desc' },
        select: expect.any(Object),
      });
    });
  });

  describe('getPassiveCustomers', () => {
    it('should return customers who have not visited in 30+ days', async () => {
      const passiveCustomers = [mockCustomer];
      mockPrismaService.customer.findMany.mockResolvedValue(passiveCustomers);

      const result = await service.getPassiveCustomers();

      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith({
        where: {
          lastVisitAt: { lt: expect.any(Date) },
        },
        orderBy: { lastVisitAt: 'desc' },
      });
      expect(result).toEqual(passiveCustomers);
    });
  });

  describe('findOne', () => {
    it('should return a customer with recent orders', async () => {
      const customerWithOrders = { ...mockCustomer, orders: [] };
      mockPrismaService.customer.findUnique.mockResolvedValue(
        customerWithOrders,
      );

      const result = await service.findOne('customer-1');

      expect(mockPrismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'customer-1' },
        include: {
          orders: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
      });
      expect(result).toEqual(customerWithOrders);
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const updateDto = { name: 'Jane Doe' };
      const updatedCustomer = { ...mockCustomer, name: 'Jane Doe' };
      mockPrismaService.customer.update.mockResolvedValue(updatedCustomer);

      const result = await service.update('customer-1', updateDto);

      expect(mockPrismaService.customer.update).toHaveBeenCalledWith({
        where: { id: 'customer-1' },
        data: updateDto,
      });
      expect(result).toEqual(updatedCustomer);
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      mockPrismaService.customer.delete.mockResolvedValue(mockCustomer);

      const result = await service.remove('customer-1');

      expect(mockPrismaService.customer.delete).toHaveBeenCalledWith({
        where: { id: 'customer-1' },
      });
      expect(result).toEqual(mockCustomer);
    });
  });
});
