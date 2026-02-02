import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

describe('ServicesController', () => {
  let controller: ServicesController;
  let service: ServicesService;

  const mockServicesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockService = {
    id: 1,
    name: 'Cuci Kering',
    price: 25000,
    isActive: true,
    recipes: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [{ provide: ServicesService, useValue: mockServicesService }],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
    service = module.get<ServicesService>(ServicesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new service', async () => {
      const createDto = { name: 'Cuci Kering', price: 25000, recipes: [] };
      mockServicesService.create.mockResolvedValue(mockService);

      const result = await controller.create(createDto);

      expect(mockServicesService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockService);
    });
  });

  describe('findAll', () => {
    it('should return all active services', async () => {
      const services = [mockService];
      mockServicesService.findAll.mockResolvedValue(services);

      const result = await controller.findAll();

      expect(mockServicesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(services);
    });
  });

  describe('findOne', () => {
    it('should return service by id', async () => {
      mockServicesService.findOne.mockResolvedValue(mockService);

      const result = await controller.findOne('1');

      expect(mockServicesService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockService);
    });
  });

  describe('update', () => {
    it('should update service', async () => {
      const updateDto = { name: 'Cuci Basah' };
      const updatedService = { ...mockService, name: 'Cuci Basah' };
      mockServicesService.update.mockResolvedValue(updatedService);

      const result = await controller.update('1', updateDto);

      expect(mockServicesService.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedService);
    });
  });

  describe('remove', () => {
    it('should soft delete service', async () => {
      mockServicesService.remove.mockResolvedValue({
        ...mockService,
        isActive: false,
      });

      const result = await controller.remove('1');

      expect(mockServicesService.remove).toHaveBeenCalledWith(1);
    });
  });
});
