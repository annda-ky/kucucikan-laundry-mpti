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
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // Checking if stock will be negative
    if (item.stockQuantity + updateStockDto.changeAmount < 0) {
      throw new NotFoundException(
        `Stok tidak cukup. Stok saat ini: ${item.stockQuantity}`,
      );
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

  async remove(id: number) {
    try {
      console.log(`[DEBUG] Attempting SOFT DELETE for item ID: ${id}`);
      return await this.prisma.inventoryItem.update({
        where: { id },
        data: { isDeleted: true },
      });
    } catch (error) {
      console.error('DELETE ERROR:', error);
      throw new BadRequestException(
        `Gagal menghapus item: ${error.message || 'Terjadi kesalahan internal'}`,
      );
    }
  }
}
