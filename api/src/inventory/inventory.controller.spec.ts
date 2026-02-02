import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

  const mockInventoryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStock: jest.fn(),
    remove: jest.fn(),
    getLogs: jest.fn(),
  };

  const mockInventoryItem = {
    id: 1,
    name: 'Detergen',
    unit: 'kg',
    stockQuantity: 100,
    minStock: 10,
    isDeleted: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        { provide: InventoryService, useValue: mockInventoryService },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    service = module.get<InventoryService>(InventoryService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new inventory item', async () => {
      const createDto = { name: 'Detergen', unit: 'kg', stockQuantity: 100 };
      mockInventoryService.create.mockResolvedValue(mockInventoryItem);

      const result = await controller.create(createDto);

      expect(mockInventoryService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockInventoryItem);
    });
  });

  describe('findAll', () => {
    it('should return all inventory items', async () => {
      const items = [mockInventoryItem];
      mockInventoryService.findAll.mockResolvedValue(items);

      const result = await controller.findAll();

      expect(mockInventoryService.findAll).toHaveBeenCalled();
      expect(result).toEqual(items);
    });
  });

  describe('findOne', () => {
    it('should return inventory item by id', async () => {
      mockInventoryService.findOne.mockResolvedValue(mockInventoryItem);

      const result = await controller.findOne('1');

      expect(mockInventoryService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockInventoryItem);
    });
  });

  describe('updateStock', () => {
    it('should update stock quantity', async () => {
      const req = { user: { userId: 'user-1' } };
      const updateDto = { changeAmount: 50, type: 'PURCHASE' as const };
      mockInventoryService.updateStock.mockResolvedValue({
        ...mockInventoryItem,
        stockQuantity: 150,
      });

      const result = await controller.updateStock('1', req, updateDto);

      expect(mockInventoryService.updateStock).toHaveBeenCalledWith(
        1,
        updateDto,
        'user-1',
      );
    });
  });

  describe('remove', () => {
    it('should soft delete inventory item', async () => {
      mockInventoryService.remove.mockResolvedValue({
        ...mockInventoryItem,
        isDeleted: true,
      });

      const result = await controller.remove('1');

      expect(mockInventoryService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('getLogs', () => {
    it('should return inventory logs', async () => {
      const logs = [{ id: 1, changeAmount: 50, type: 'PURCHASE' }];
      mockInventoryService.getLogs.mockResolvedValue(logs);

      const result = await controller.getLogs('1');

      expect(mockInventoryService.getLogs).toHaveBeenCalledWith(1);
      expect(result).toEqual(logs);
    });
  });
});
