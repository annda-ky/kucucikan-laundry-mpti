import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

describe('ExpensesController', () => {
  let controller: ExpensesController;
  let service: ExpensesService;

  const mockExpensesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockExpense = {
    id: 'expense-1',
    shiftId: 'shift-1',
    category: 'SUPPLIES',
    amount: 50000,
    note: 'Beli detergen',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [{ provide: ExpensesService, useValue: mockExpensesService }],
    }).compile();

    controller = module.get<ExpensesController>(ExpensesController);
    service = module.get<ExpensesService>(ExpensesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new expense', async () => {
      const req = { user: { userId: 'cashier-1' } };
      const createDto = { category: 'SUPPLIES', amount: 50000, note: 'Test' };
      mockExpensesService.create.mockResolvedValue(mockExpense);

      const result = await controller.create(req, createDto);

      expect(mockExpensesService.create).toHaveBeenCalledWith(
        'cashier-1',
        createDto,
      );
      expect(result).toEqual(mockExpense);
    });
  });

  describe('findAll', () => {
    it('should return all expenses', async () => {
      const expenses = [mockExpense];
      mockExpensesService.findAll.mockResolvedValue(expenses);

      const result = await controller.findAll();

      expect(mockExpensesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expenses);
    });
  });

  describe('findOne', () => {
    it('should return expense by id', async () => {
      mockExpensesService.findOne.mockResolvedValue(mockExpense);

      const result = await controller.findOne('expense-1');

      expect(mockExpensesService.findOne).toHaveBeenCalledWith('expense-1');
      expect(result).toEqual(mockExpense);
    });
  });

  describe('remove', () => {
    it('should delete expense by id', async () => {
      mockExpensesService.remove.mockResolvedValue(mockExpense);

      const result = await controller.remove('expense-1');

      expect(mockExpensesService.remove).toHaveBeenCalledWith('expense-1');
      expect(result).toEqual(mockExpense);
    });
  });
});
