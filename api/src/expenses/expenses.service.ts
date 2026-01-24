import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createExpenseDto: CreateExpenseDto) {
    const activeShift = await this.prisma.shift.findFirst({
      where: {
        cashierId: userId,
        endTime: null,
      },
    });

    if (!activeShift) {
      throw new BadRequestException(
        'You must have an active shift to record expenses',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          shiftId: activeShift.id,
          category: createExpenseDto.category,
          amount: createExpenseDto.amount,
          note: createExpenseDto.note,
          relatedInventoryItemId: createExpenseDto.inventoryItemId,
        },
      });

      if (
        createExpenseDto.inventoryItemId &&
        createExpenseDto.restockQuantity
      ) {
        await tx.inventoryItem.update({
          where: { id: createExpenseDto.inventoryItemId },
          data: {
            stockQuantity: {
              increment: createExpenseDto.restockQuantity,
            },
          },
        });

        await tx.inventoryLog.create({
          data: {
            inventoryItemId: createExpenseDto.inventoryItemId,
            changeAmount: createExpenseDto.restockQuantity,
            type: 'PURCHASE',
            actorId: userId,
          },
        });
      }

      return expense;
    });
  }

  findAll() {
    return this.prisma.expense.findMany({
      include: { shift: { include: { cashier: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.expense.findUnique({ where: { id } });
  }

  remove(id: string) {
    return this.prisma.expense.delete({ where: { id } });
  }
}
