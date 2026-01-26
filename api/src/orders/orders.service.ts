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

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private promosService: PromosService,
  ) {}

  async create(createOrderDto: CreateOrderDto, cashierId: string) {
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
    let totalAmount = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const service = await this.prisma.service.findUnique({
        where: { id: item.serviceId },
      });

      if (!service) {
        throw new NotFoundException(`Service ID ${item.serviceId} not found`);
      }

      const subtotal = Number(service.price) * item.quantity;
      totalAmount += subtotal;

      orderItemsData.push({
        serviceId: service.id,
        serviceNameSnapshot: service.name,
        priceSnapshot: service.price,
        quantity: item.quantity,
        subtotal: subtotal,
      });
    }

    return this.prisma.$transaction(async (tx) => {
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

    const totalAmount = Number(order.totalAmount);
    // Cast to any because Prisma Client might not be regenerated yet
    const discountAmount = Number((order as any).discountAmount || 0);
    const finalAmount = totalAmount - discountAmount;

    const paidAmount = payOrderDto.paidAmount;

    if (paidAmount < finalAmount) {
      throw new BadRequestException(
        'Jumlah bayar kurang dari total tagihan (setelah diskon)',
      );
    }

    const changeAmount = paidAmount - finalAmount;

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
      Number(order.totalAmount),
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

  async findAll() {
    try {
      console.log('[DEBUG] Fetching all orders...');
      const orders = await this.prisma.order.findMany({
        include: {
          customer: true,
          cashier: true,
          orderItems: true,
          machine: true,
          promo: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      console.log(`[DEBUG] Found ${orders.length} orders`);
      return orders;
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
