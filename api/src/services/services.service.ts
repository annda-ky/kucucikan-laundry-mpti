import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  create(createServiceDto: CreateServiceDto) {
    const { recipes, ...data } = createServiceDto;
    return this.prisma.service.create({
      data: {
        ...data,
        recipes: {
          create: recipes,
        },
      },
      include: { recipes: { include: { inventoryItem: true } } },
    });
  }

  findAll() {
    return this.prisma.service.findMany({
      where: { isActive: true }, // Hanya tampilkan yang aktif
      orderBy: { name: 'asc' },
      include: { recipes: { include: { inventoryItem: true } } },
    });
  }

  // Untuk Owner melihat semua termasuk yang non-aktif
  findAllRaw() {
    return this.prisma.service.findMany({
      orderBy: { name: 'asc' },
      include: { recipes: { include: { inventoryItem: true } } },
    });
  }

  findOne(id: number) {
    return this.prisma.service.findUnique({
      where: { id },
      include: { recipes: { include: { inventoryItem: true } } },
    });
  }

  update(id: number, updateServiceDto: UpdateServiceDto) {
    const { recipes, ...data } = updateServiceDto;

    // Handle recipes update if provided
    let recipeUpdate = {};
    if (recipes) {
      recipeUpdate = {
        recipes: {
          deleteMany: {}, // Clear existing
          create: recipes, // Create new
        },
      };
    }

    return this.prisma.service.update({
      where: { id },
      data: {
        ...data,
        ...recipeUpdate,
      },
      include: { recipes: { include: { inventoryItem: true } } },
    });
  }

  remove(id: number) {
    // Soft Delete (Hanya matikan status, jangan hapus data)
    return this.prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
