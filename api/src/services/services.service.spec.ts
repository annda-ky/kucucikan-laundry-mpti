import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from './services.service';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

describe('ServicesService', () => {
  let service: ServicesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    service: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockService = {
    id: 1,
    name: 'Cuci Kering',
    price: new Prisma.Decimal(25000),
    isActive: true,
    recipes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new service with recipes', async () => {
      const createDto = {
        name: 'Cuci Kering',
        price: 25000,
        recipes: [{ inventoryItemId: 1, quantity: 0.5 }],
      };
      mockPrismaService.service.create.mockResolvedValue({
        ...mockService,
        recipes: [{ inventoryItemId: 1, quantity: 0.5, inventoryItem: {} }],
      });

      const result = await service.create(createDto);

      expect(mockPrismaService.service.create).toHaveBeenCalledWith({
        data: {
          name: 'Cuci Kering',
          price: 25000,
          recipes: {
            create: [{ inventoryItemId: 1, quantity: 0.5 }],
          },
        },
        include: { recipes: { include: { inventoryItem: true } } },
      });
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return only active services', async () => {
      const services = [mockService];
      mockPrismaService.service.findMany.mockResolvedValue(services);

      const result = await service.findAll();

      expect(mockPrismaService.service.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        include: { recipes: { include: { inventoryItem: true } } },
      });
      expect(result).toEqual(services);
    });
  });

  describe('findAllRaw', () => {
    it('should return all services including inactive', async () => {
      const services = [
        mockService,
        { ...mockService, id: 2, isActive: false },
      ];
      mockPrismaService.service.findMany.mockResolvedValue(services);

      const result = await service.findAllRaw();

      expect(mockPrismaService.service.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
        include: { recipes: { include: { inventoryItem: true } } },
      });
      expect(result).toEqual(services);
    });
  });

  describe('findOne', () => {
    it('should return service by id with recipes', async () => {
      mockPrismaService.service.findUnique.mockResolvedValue(mockService);

      const result = await service.findOne(1);

      expect(mockPrismaService.service.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { recipes: { include: { inventoryItem: true } } },
      });
      expect(result).toEqual(mockService);
    });
  });

  describe('update', () => {
    it('should update service without recipes', async () => {
      const updateDto = { name: 'Cuci Basah', price: 30000 };
      const updatedService = { ...mockService, name: 'Cuci Basah' };
      mockPrismaService.service.update.mockResolvedValue(updatedService);

      const result = await service.update(1, updateDto);

      expect(mockPrismaService.service.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
        include: { recipes: { include: { inventoryItem: true } } },
      });
      expect(result).toEqual(updatedService);
    });

    it('should update service with recipes replacement', async () => {
      const updateDto = {
        name: 'Cuci Basah',
        recipes: [{ inventoryItemId: 2, quantity: 1 }],
      };
      mockPrismaService.service.update.mockResolvedValue(mockService);

      await service.update(1, updateDto);

      expect(mockPrismaService.service.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Cuci Basah',
          recipes: {
            deleteMany: {},
            create: [{ inventoryItemId: 2, quantity: 1 }],
          },
        },
        include: { recipes: { include: { inventoryItem: true } } },
      });
    });
  });

  describe('remove', () => {
    it('should soft delete service by setting isActive to false', async () => {
      mockPrismaService.service.update.mockResolvedValue({
        ...mockService,
        isActive: false,
      });

      const result = await service.remove(1);

      expect(mockPrismaService.service.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
    });
  });
});
