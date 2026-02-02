import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { VoidOrderDto } from './dto/void-order.dto';
import { PayOrderDto } from './dto/pay-order.dto';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

import { PromosService } from '../promos/promos.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private promosService: PromosService,
  ) {}

  async create(createOrderDto: CreateOrderDto, cashierId: string) {
    // Check active shift
    const activeShift = await this.prisma.shift.findFirst({
      where: { cashierId, endTime: null },
    });

    if (!activeShift) {
      throw new BadRequestException(
        'Cashier must start a shift before creating orders',
      );
    }

    const { customerId, items, machineId, duration, note } = createOrderDto;
    const invoiceNumber = `INV-${Date.now()}`;
    let totalAmount = new Prisma.Decimal(0);
    const orderItemsData: any[] = [];

    for (const item of items) {
      const service = await this.prisma.service.findUnique({
        where: { id: item.serviceId },
        include: { recipes: true }, // Include recipes
      });

      if (!service) {
        throw new NotFoundException(`Service ID ${item.serviceId} not found`);
      }

      // Fix Floating Point: Use Decimal
      const subtotal = service.price.mul(item.quantity);
      totalAmount = totalAmount.add(subtotal);

      orderItemsData.push({
        serviceId: service.id,
        serviceNameSnapshot: service.name,
        priceSnapshot: service.price,
        quantity: item.quantity,
        subtotal: subtotal,
      });

      // Prepare inventory deduction logic (will be executed inside transaction)
      // We attach it to the item so we can use it later or just re-fetch inside TX?
      // Better: Re-fetch inside TX or pass data.
      // Since we are inside a loop before TX, we can't execute TX operations yet.
      // We will move this loop INSIDE the transaction or prepare data here.
      // BUT: 'items' iteration calculates totalAmount which is needed for order creation.
      // Let's modify the flow to do everything inside TX? No, price calculation is read-only usually.
      // Best approach: Collect recipe deductions needed.
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Order
      const order = await tx.order.create({
        data: {
          invoiceNumber,
          customerId,
          cashierId,
          shiftId: activeShift.id,
          machineId: machineId ?? null,
          totalAmount,
          note,
          statusPayment: 'UNPAID',
          statusLaundry: machineId ? 'WASHING' : 'PENDING',
          washingStartedAt: machineId ? new Date() : null,
          actualDurationMinutes: duration ?? null,
          orderItems: { create: orderItemsData },
        },
        include: { orderItems: true, customer: true },
      });

      // 2. Process Inventory Deduction
      // We need to iterate again or use the data we gathered.
      // Let's iterate through the input items again as it is cheap.
      for (const item of items) {
        const service = await tx.service.findUnique({
          where: { id: item.serviceId },
          include: { recipes: true },
        });

        if (service && service.recipes.length > 0) {
          for (const recipe of service.recipes) {
            const deductionAmount = recipe.quantity * item.quantity;

            // Check stock
            const inventoryItem = await tx.inventoryItem.findUnique({
              where: { id: recipe.inventoryItemId },
            });

            if (inventoryItem) {
              // Update Stock
              await tx.inventoryItem.update({
                where: { id: recipe.inventoryItemId },
                data: { stockQuantity: { decrement: deductionAmount } },
              });

              // Log Usage
              await tx.inventoryLog.create({
                data: {
                  inventoryItemId: recipe.inventoryItemId,
                  changeAmount: -deductionAmount,
                  type: 'USAGE',
                  actorId: cashierId, // Cashier is the actor
                },
              });
            }
          }
        }
      }

      if (machineId) {
        await tx.machine.update({
          where: { id: machineId },
          data: {
            status: 'WASHING',
            currentOrderId: order.id,
          },
        });
      }

      return order;
    });
  }

  async payOrder(id: string, payOrderDto: PayOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!order) {
      throw new NotFoundException('Order tidak ditemukan');
    }

    if (order.statusPayment === 'PAID') {
      throw new BadRequestException('Order sudah lunas');
    }

    // Use Decimal for precision
    const totalAmount = order.totalAmount;
    const discountAmount = order.discountAmount ?? new Prisma.Decimal(0);
    const finalAmount = totalAmount.sub(discountAmount);

    const paidAmount = new Prisma.Decimal(payOrderDto.paidAmount);

    if (paidAmount.lt(finalAmount)) {
      throw new BadRequestException(
        'Jumlah bayar kurang dari total tagihan (setelah diskon)',
      );
    }

    const changeAmount = paidAmount.sub(finalAmount);

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          statusPayment: 'PAID',
          paidAmount: paidAmount,
          changeAmount: changeAmount,
          paymentMethod: payOrderDto.paymentMethod || 'CASH', // Default to CASH
        },
      });

      await tx.customer.update({
        where: { id: order.customerId },
        data: {
          totalSpend: { increment: totalAmount },
          totalVisits: { increment: 1 },
          lastVisitAt: new Date(),
        },
      });

      return updatedOrder;
    });
  }

  async voidOrder(id: string, voidOrderDto: VoidOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order tidak ditemukan');
    }

    const owner = await this.prisma.user.findFirst({
      where: { role: 'OWNER' },
    });

    if (!owner) {
      throw new UnauthorizedException('Data Owner tidak ditemukan');
    }

    const isPinValid = await bcrypt.compare(
      voidOrderDto.ownerPin,
      owner.pin_hash,
    );
    if (!isPinValid) {
      throw new UnauthorizedException('PIN Owner Salah!');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          statusPayment: 'VOID' as any,
          statusLaundry: 'VOID' as any,
        },
      });

      if (order.machineId) {
        await tx.machine.update({
          where: { id: order.machineId },
          data: { status: 'IDLE', currentOrderId: null },
        });
      }

      if (order.statusPayment === 'PAID') {
        await tx.customer.update({
          where: { id: order.customerId },
          data: {
            totalSpend: { decrement: order.totalAmount },
            totalVisits: { decrement: 1 },
          },
        });
      }

      return updatedOrder;
    });
  }

  /**
   * FR-OPS-02: Flexible Timer Adjust
   * FR-OPS-03: Timer as Alarm (handled by frontend based on washingStartedAt + actualDurationMinutes)
   * FR-OPS-04: Manual Finish
   * FR-OPS-05: Rack Location
   */
  async updateStatus(id: string, updateStatusDto: any) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { machine: true },
    });

    if (!order) {
      throw new NotFoundException('Order tidak ditemukan');
    }

    const { status, durationMinutes, rackLocation } = updateStatusDto;
    const updateData: any = { statusLaundry: status };

    // FR-OPS-02: Timer Adjust - reset timer when changing to WASHING/DRYING
    if (durationMinutes && (status === 'WASHING' || status === 'DRYING')) {
      updateData.actualDurationMinutes = durationMinutes;
      updateData.washingStartedAt = new Date();
    }

    // FR-OPS-05: Rack Location - save when status is DONE or PICKED_UP
    if (rackLocation && (status === 'DONE' || status === 'PICKED_UP')) {
      updateData.rackLocation = rackLocation;
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: updateData,
        include: { customer: true, orderItems: true, machine: true },
      });

      // FR-OPS-04: Manual Finish - release machine when DONE
      if (order.machineId && (status === 'DONE' || status === 'PICKED_UP')) {
        await tx.machine.update({
          where: { id: order.machineId },
          data: { status: 'IDLE', currentOrderId: null },
        });
      }

      // Update machine status when changing laundry status
      if (order.machineId && status === 'WASHING') {
        await tx.machine.update({
          where: { id: order.machineId },
          data: { status: 'WASHING', currentOrderId: order.id },
        });
      }

      return updatedOrder;
    });
  }

  async applyPromo(id: string, code: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) throw new NotFoundException('Order tidak ditemukan');
    if (order.statusPayment === 'PAID')
      throw new BadRequestException('Order sudah lunas');

    const promo = await this.promosService.findByCode(code);
    const discountAmount = this.promosService.calculateDiscount(
      order.totalAmount,
      promo,
    );

    return this.prisma.order.update({
      where: { id },
      data: {
        promoId: promo.id,
        discountAmount: discountAmount,
      } as any,
      include: { orderItems: true, customer: true, promo: true, machine: true },
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          skip,
          take: limit,
          include: {
            customer: true,
            cashier: true,
            orderItems: true,
            machine: true,
            promo: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.order.count(),
      ]);

      return {
        data: orders,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('[DEBUG] Error fetching orders:', error);
      throw error;
    }
  }

  findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
        customer: true,
        cashier: true,
        machine: true,
        promo: true,
      },
    });
  }
}
