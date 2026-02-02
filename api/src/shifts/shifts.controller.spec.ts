import { Test, TestingModule } from '@nestjs/testing';
import { ShiftsController } from './shifts.controller';
import { ShiftsService } from './shifts.service';

describe('ShiftsController', () => {
  let controller: ShiftsController;
  let service: ShiftsService;

  const mockShiftsService = {
    startShift: jest.fn(),
    endShift: jest.fn(),
    forceEndShift: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  const mockShift = {
    id: 'shift-1',
    cashierId: 'cashier-1',
    startCash: 100000,
    startTime: new Date(),
    endTime: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShiftsController],
      providers: [{ provide: ShiftsService, useValue: mockShiftsService }],
    }).compile();

    controller = module.get<ShiftsController>(ShiftsController);
    service = module.get<ShiftsService>(ShiftsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('startShift', () => {
    it('should start a new shift', async () => {
      const req = { user: { userId: 'cashier-1' } };
      const createDto = { startCash: 100000 };
      mockShiftsService.startShift.mockResolvedValue(mockShift);

      const result = await controller.startShift(req, createDto);

      expect(mockShiftsService.startShift).toHaveBeenCalledWith(
        'cashier-1',
        createDto,
      );
      expect(result).toEqual(mockShift);
    });
  });

  describe('endShift', () => {
    it('should end current shift', async () => {
      const req = { user: { userId: 'cashier-1' } };
      const updateDto = { actualCashClosing: 150000 };
      mockShiftsService.endShift.mockResolvedValue({
        ...mockShift,
        endTime: new Date(),
      });

      const result = await controller.endShift(req, updateDto);

      expect(mockShiftsService.endShift).toHaveBeenCalledWith(
        'cashier-1',
        updateDto,
      );
    });
  });

  describe('forceEndShift', () => {
    it('should force end a specific shift', async () => {
      const updateDto = { actualCashClosing: 150000 };
      mockShiftsService.forceEndShift.mockResolvedValue({
        ...mockShift,
        endTime: new Date(),
      });

      const result = await controller.forceEndShift('shift-1', updateDto);

      expect(mockShiftsService.forceEndShift).toHaveBeenCalledWith(
        'shift-1',
        updateDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated shifts', async () => {
      const response = {
        data: [mockShift],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      mockShiftsService.findAll.mockResolvedValue(response);

      const result = await controller.findAll(1, 10);

      expect(mockShiftsService.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(response);
    });
  });

  describe('findOne', () => {
    it('should return shift by id', async () => {
      mockShiftsService.findOne.mockResolvedValue(mockShift);

      const result = await controller.findOne('shift-1');

      expect(mockShiftsService.findOne).toHaveBeenCalledWith('shift-1');
      expect(result).toEqual(mockShift);
    });
  });
});
