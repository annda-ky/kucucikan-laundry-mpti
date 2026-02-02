import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { CreatePromoDto } from './dto/create-promo.dto';
import { UpdatePromoDto } from './dto/update-promo.dto';

@Injectable()
export class PromosService {
  constructor(private prisma: PrismaService) {}

  async create(createPromoDto: CreatePromoDto) {
    // Check duplicate code
    const existing = await this.prisma.promo.findUnique({
      where: { code: createPromoDto.code },
    });
    if (existing) {
      throw new BadRequestException('Kode promo sudah digunakan');
    }

    return this.prisma.promo.create({
      data: {
        code: createPromoDto.code,
        description: createPromoDto.description,
        type: createPromoDto.type,
        value: createPromoDto.value,
        validUntil: createPromoDto.validUntil
          ? new Date(createPromoDto.validUntil)
          : null,
        isActive: createPromoDto.isActive ?? true,
      },
    });
  }

  findAll() {
    return this.prisma.promo.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  getActive() {
    const now = new Date();
    return this.prisma.promo.findMany({
      where: {
        isActive: true,
        OR: [{ validUntil: null }, { validUntil: { gte: now } }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const promo = await this.prisma.promo.findUnique({ where: { id } });
    if (!promo) throw new NotFoundException('Promo tidak ditemukan');
    return promo;
  }

  async findByCode(code: string) {
    const promo = await this.prisma.promo.findUnique({ where: { code } });
    if (!promo) throw new NotFoundException('Promo tidak ditemukan');
    return promo;
  }

  async update(id: number, updatePromoDto: UpdatePromoDto) {
    await this.findOne(id); // Validate exist
    return this.prisma.promo.update({
      where: { id },
      data: {
        ...updatePromoDto,
        validUntil: updatePromoDto.validUntil
          ? new Date(updatePromoDto.validUntil)
          : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.promo.delete({ where: { id } });
  }

  // Helper to calculate final Amount
  // Helper to calculate final Amount
  calculateDiscount(
    originalAmount: Prisma.Decimal,
    promo: any,
  ): Prisma.Decimal {
    if (!promo) return new Prisma.Decimal(0);

    // Check validity
    if (!promo.isActive) return new Prisma.Decimal(0);
    if (promo.validUntil && new Date(promo.validUntil) < new Date())
      return new Prisma.Decimal(0);

    let discount = new Prisma.Decimal(0);
    if (promo.type === 'PERCENTAGE') {
      discount = originalAmount.mul(promo.value).div(100);
    } else {
      discount = promo.value;
    }

    // Max discount = originalAmount (Not negative)
    if (discount.gt(originalAmount)) return originalAmount;

    return discount.floor();
  }
}
