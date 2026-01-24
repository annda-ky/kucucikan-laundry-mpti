import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  create(createCustomerDto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: createCustomerDto,
    });
  }

  findAll() {
    return this.prisma.customer.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.customer.findMany({
      where: {
        phone: {
          endsWith: phone,
        },
      },
    });
  }

  async getLeaderboard(sortBy: 'totalSpend' | 'totalVisits') {
    return this.prisma.customer.findMany({
      take: 10,
      orderBy: {
        [sortBy]: 'desc',
      },
      select: {
        id: true,
        name: true,
        phone: true,
        totalSpend: true,
        totalVisits: true,
        lastVisitAt: true,
      },
    });
  }

  async getPassiveCustomers() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.prisma.customer.findMany({
      where: {
        lastVisitAt: {
          lt: thirtyDaysAgo,
        },
      },
      orderBy: {
        lastVisitAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  update(id: string, updateCustomerDto: UpdateCustomerDto) {
    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  remove(id: string) {
    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
