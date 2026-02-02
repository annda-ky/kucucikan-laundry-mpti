import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async startShift(userId: string, createShiftDto: CreateShiftDto) {
    const activeShift = await this.prisma.shift.findFirst({
      where: {
        cashierId: userId,
        endTime: null,
      },
    });

    if (activeShift) {
      throw new BadRequestException('You already have an active shift');
    }

    return this.prisma.shift.create({
      data: {
        cashierId: userId,
        startCash: createShiftDto.startCash,
        startTime: new Date(),
      },
    });
  }

  async endShift(userId: string, updateShiftDto: UpdateShiftDto) {
    const activeShift = await this.prisma.shift.findFirst({
      where: {
        cashierId: userId,
        endTime: null,
      },
      include: { cashier: true },
    });

    if (!activeShift) {
      throw new NotFoundException('No active shift found to close');
    }

    const salesAggregation = await this.prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        shiftId: activeShift.id,
        statusPayment: 'PAID',
        paymentMethod: 'CASH',
      },
    });
    const totalSales = Number(salesAggregation._sum.totalAmount || 0);

    const expenseAggregation = await this.prisma.expense.aggregate({
      _sum: { amount: true },
      where: {
        shiftId: activeShift.id,
      },
    });
    const totalExpenses = Number(expenseAggregation._sum.amount || 0);

    const startCash = Number(activeShift.startCash);
    const systemExpectedCash = startCash + totalSales - totalExpenses;
    const actualCashClosing = updateShiftDto.actualCashClosing;
    const difference = actualCashClosing - systemExpectedCash;

    const updatedShift = await this.prisma.shift.update({
      where: { id: activeShift.id },
      data: {
        endTime: new Date(),
        systemExpectedCash,
        actualCashClosing,
        difference,
      },
    });

    if (activeShift.cashier.role === 'ADMIN') {
      return {
        message:
          'Shift closed successfully. Data has been sent to owner for audit.',
        endTime: updatedShift.endTime,
        cashierName: activeShift.cashier.username,
      };
    }

    return updatedShift;
  }

  async forceEndShift(shiftId: string, updateShiftDto: UpdateShiftDto) {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
      include: { cashier: true },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (shift.endTime) {
      throw new BadRequestException('Shift already closed');
    }

    const salesAggregation = await this.prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        shiftId: shift.id,
        statusPayment: 'PAID',
        paymentMethod: 'CASH',
      },
    });
    const totalSales = Number(salesAggregation._sum.totalAmount || 0);

    const expenseAggregation = await this.prisma.expense.aggregate({
      _sum: { amount: true },
      where: {
        shiftId: shift.id,
      },
    });
    const totalExpenses = Number(expenseAggregation._sum.amount || 0);

    const startCash = Number(shift.startCash);
    const systemExpectedCash = startCash + totalSales - totalExpenses;
    const actualCashClosing = updateShiftDto.actualCashClosing;
    const difference = actualCashClosing - systemExpectedCash;

    return this.prisma.shift.update({
      where: { id: shiftId },
      data: {
        endTime: new Date(),
        systemExpectedCash,
        actualCashClosing,
        difference,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [shifts, total] = await Promise.all([
      this.prisma.shift.findMany({
        skip,
        take: limit,
        include: { cashier: true },
        orderBy: { startTime: 'desc' },
      }),
      this.prisma.shift.count(),
    ]);

    return {
      data: shifts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  findOne(id: string) {
    return this.prisma.shift.findUnique({
      where: { id },
      include: { cashier: true, orders: true, expenses: true },
    });
  }
}
