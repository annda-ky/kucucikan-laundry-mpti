import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrdersService = {
    create: jest.fn(),
    applyPromo: jest.fn(),
    payOrder: jest.fn(),
    voidOrder: jest.fn(),
    updateStatus: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  const mockOrder = {
    id: 'order-1',
    invoiceNumber: 'INV-123',
    customerId: 'customer-1',
    totalAmount: 50000,
    statusPayment: 'UNPAID',
    statusLaundry: 'PENDING',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockOrdersService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an order', async () => {
      const req = { user: { userId: 'cashier-1' } };
      const createDto = {
        customerId: 'customer-1',
        items: [{ serviceId: 1, quantity: 2 }],
      };
      mockOrdersService.create.mockResolvedValue(mockOrder);

      const result = await controller.create(req, createDto);

      expect(mockOrdersService.create).toHaveBeenCalledWith(
        createDto,
        'cashier-1',
      );
      expect(result).toEqual(mockOrder);
    });
  });

  describe('applyPromo', () => {
    it('should apply promo to order', async () => {
      mockOrdersService.applyPromo.mockResolvedValue({
        ...mockOrder,
        discountAmount: 5000,
      });

      const result = await controller.applyPromo('order-1', 'PROMO10');

      expect(mockOrdersService.applyPromo).toHaveBeenCalledWith(
        'order-1',
        'PROMO10',
      );
    });
  });

  describe('payOrder', () => {
    it('should pay an order', async () => {
      const payDto = { paidAmount: 50000, paymentMethod: 'CASH' };
      mockOrdersService.payOrder.mockResolvedValue({
        ...mockOrder,
        statusPayment: 'PAID',
      });

      const result = await controller.payOrder('order-1', payDto);

      expect(mockOrdersService.payOrder).toHaveBeenCalledWith(
        'order-1',
        payDto,
      );
    });
  });

  describe('voidOrder', () => {
    it('should void an order', async () => {
      const voidDto = { ownerPin: '1234' };
      mockOrdersService.voidOrder.mockResolvedValue({
        ...mockOrder,
        statusPayment: 'VOID',
      });

      const result = await controller.voidOrder('order-1', voidDto);

      expect(mockOrdersService.voidOrder).toHaveBeenCalledWith(
        'order-1',
        voidDto,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const updateDto = { status: 'WASHING' };
      mockOrdersService.updateStatus.mockResolvedValue({
        ...mockOrder,
        statusLaundry: 'WASHING',
      });

      const result = await controller.updateStatus('order-1', updateDto);

      expect(mockOrdersService.updateStatus).toHaveBeenCalledWith(
        'order-1',
        updateDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const response = {
        data: [mockOrder],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      mockOrdersService.findAll.mockResolvedValue(response);

      const result = await controller.findAll(1, 10);

      expect(mockOrdersService.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(response);
    });
  });

  describe('findOne', () => {
    it('should return order by id', async () => {
      mockOrdersService.findOne.mockResolvedValue(mockOrder);

      const result = await controller.findOne('order-1');

      expect(mockOrdersService.findOne).toHaveBeenCalledWith('order-1');
      expect(result).toEqual(mockOrder);
    });
  });
});
