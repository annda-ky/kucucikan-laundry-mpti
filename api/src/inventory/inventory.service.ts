import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto.';
import { UpdateStockDto } from './dto/update-stock.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  create(createInventoryItemDto: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({
      data: createInventoryItemDto,
    });
  }

  findAll() {
    return this.prisma.inventoryItem.findMany({
      where: { isDeleted: false },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.inventoryItem.findUnique({
      where: { id },
      include: { inventoryLogs: true },
    });
  }

  async updateStock(
    id: number,
    updateStockDto: UpdateStockDto,
    actorId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Atomic Update (Prevent Race Condition)
      if (updateStockDto.changeAmount < 0) {
        const result = await tx.inventoryItem.updateMany({
          where: {
            id,
            stockQuantity: {
              gte: Math.abs(updateStockDto.changeAmount), // Check stock atomically
            },
          },
          data: {
            stockQuantity: {
              increment: updateStockDto.changeAmount,
            },
          },
        });

        if (result.count === 0) {
          // Determine if it was "Not Found" or "Insufficient Stock"
          const item = await tx.inventoryItem.findUnique({ where: { id } });
          if (!item) throw new NotFoundException('Item not found');
          throw new BadRequestException(
            `Stok tidak cukup. Transaksi dibatalkan.`,
          );
        }
      } else {
        // For additions, simple update is safe (no negative check needed)
        // Check existence first
        const item = await tx.inventoryItem.findUnique({ where: { id } });
        if (!item) throw new NotFoundException('Item not found');

        await tx.inventoryItem.update({
          where: { id },
          data: {
            stockQuantity: { increment: updateStockDto.changeAmount },
          },
        });
      }

      // 2. Fetch Updated Item
      const updatedItem = await tx.inventoryItem.findUnique({ where: { id } });

      // 3. Create Log
      await tx.inventoryLog.create({
        data: {
          inventoryItemId: id,
          changeAmount: updateStockDto.changeAmount,
          type: updateStockDto.type,
          actorId: actorId,
        },
      });

      return updatedItem;
    });
  }

  async remove(id: number) {
    try {
      return await this.prisma.inventoryItem.update({
        where: { id },
        data: { isDeleted: true },
      });
    } catch (error) {
      throw new BadRequestException(
        `Gagal menghapus item: ${error.message || 'Terjadi kesalahan internal'}`,
      );
    }
  }
}
