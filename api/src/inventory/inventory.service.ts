import { Injectable, NotFoundException } from '@nestjs/common';
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
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update Stok Barang
      const updatedItem = await tx.inventoryItem.update({
        where: { id },
        data: {
          stockQuantity: {
            increment: updateStockDto.changeAmount,
          },
        },
      });

      // 2. Buat Log Riwayat
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

  remove(id: number) {
    return this.prisma.inventoryItem.delete({
      where: { id },
    });
  }
}
