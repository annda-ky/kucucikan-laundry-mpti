import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

describe('CustomersController', () => {
  let controller: CustomersController;
  let service: CustomersService;

  const mockCustomersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPhone: jest.fn(),
    getLeaderboard: jest.fn(),
    getPassiveCustomers: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCustomer = {
    id: 'customer-1',
    name: 'John Doe',
    phone: '081234567890',
    address: 'Jl. Test No. 1',
    notes: 'Regular customer',
    totalSpend: 100000,
    totalVisits: 5,
    lastVisitAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        { provide: CustomersService, useValue: mockCustomersService },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    service = module.get<CustomersService>(CustomersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new customer', async () => {
      const createDto = { name: 'John Doe', phone: '081234567890' };
      mockCustomersService.create.mockResolvedValue(mockCustomer);

      const result = await controller.create(createDto);

      expect(mockCustomersService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('findAll', () => {
    it('should return all customers', async () => {
      const customers = [mockCustomer];
      mockCustomersService.findAll.mockResolvedValue(customers);

      const result = await controller.findAll();

      expect(mockCustomersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(customers);
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard sorted by totalSpend by default', async () => {
      const leaderboard = [mockCustomer];
      mockCustomersService.getLeaderboard.mockResolvedValue(leaderboard);

      const result = await controller.getLeaderboard('totalSpend');

      expect(mockCustomersService.getLeaderboard).toHaveBeenCalledWith(
        'totalSpend',
      );
      expect(result).toEqual(leaderboard);
    });

    it('should return leaderboard sorted by totalVisits', async () => {
      mockCustomersService.getLeaderboard.mockResolvedValue([mockCustomer]);

      await controller.getLeaderboard('totalVisits');

      expect(mockCustomersService.getLeaderboard).toHaveBeenCalledWith(
        'totalVisits',
      );
    });
  });

  describe('getPassive', () => {
    it('should return passive customers', async () => {
      const passiveCustomers = [mockCustomer];
      mockCustomersService.getPassiveCustomers.mockResolvedValue(
        passiveCustomers,
      );

      const result = await controller.getPassive();

      expect(mockCustomersService.getPassiveCustomers).toHaveBeenCalled();
      expect(result).toEqual(passiveCustomers);
    });
  });

  describe('findByPhone', () => {
    it('should return empty array if phone is less than 4 characters', async () => {
      const result = await controller.findByPhone('123');
      expect(result).toEqual([]);
    });

    it('should return empty array if phone is undefined', async () => {
      const result = await controller.findByPhone(undefined as any);
      expect(result).toEqual([]);
    });

    it('should return customers matching phone', async () => {
      const customers = [mockCustomer];
      mockCustomersService.findByPhone.mockResolvedValue(customers);

      const result = await controller.findByPhone('1234567890');

      expect(mockCustomersService.findByPhone).toHaveBeenCalledWith(
        '1234567890',
      );
      expect(result).toEqual(customers);
    });

    it('should return empty array if service returns null', async () => {
      mockCustomersService.findByPhone.mockResolvedValue(null);

      const result = await controller.findByPhone('1234567890');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a customer by id', async () => {
      mockCustomersService.findOne.mockResolvedValue(mockCustomer);

      const result = await controller.findOne('customer-1');

      expect(mockCustomersService.findOne).toHaveBeenCalledWith('customer-1');
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const updateDto = { name: 'Jane Doe' };
      const updatedCustomer = { ...mockCustomer, name: 'Jane Doe' };
      mockCustomersService.update.mockResolvedValue(updatedCustomer);

      const result = await controller.update('customer-1', updateDto);

      expect(mockCustomersService.update).toHaveBeenCalledWith(
        'customer-1',
        updateDto,
      );
      expect(result).toEqual(updatedCustomer);
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      mockCustomersService.remove.mockResolvedValue(mockCustomer);

      const result = await controller.remove('customer-1');

      expect(mockCustomersService.remove).toHaveBeenCalledWith('customer-1');
      expect(result).toEqual(mockCustomer);
    });
  });
});
