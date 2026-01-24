import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MachinesService {
  constructor(private prisma: PrismaService) {}

  create(createMachineDto: CreateMachineDto) {
    return this.prisma.machine.create({
      data: createMachineDto,
    });
  }

  async getMachineGrid() {
    const machines = await this.prisma.machine.findMany({
      include: {
        orders: {
          where: {
            statusLaundry: { in: ['WASHING', 'DRYING'] },
          },
          select: {
            id: true,
            invoiceNumber: true,
            washingStartedAt: true,
            actualDurationMinutes: true,
          },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });

    return machines.map((m) => {
      const currentOrder = m.orders[0];
      let indicator = 'GREEN';
      let remainingTime = 0;

      if (currentOrder) {
        indicator = 'RED';

        if (
          currentOrder.washingStartedAt &&
          currentOrder.actualDurationMinutes
        ) {
          const endTime = new Date(
            currentOrder.washingStartedAt.getTime() +
              currentOrder.actualDurationMinutes * 60000,
          );
          const now = new Date();

          if (now > endTime) {
            indicator = 'YELLOW';
          }
          remainingTime = Math.max(
            0,
            Math.ceil((endTime.getTime() - now.getTime()) / 60000),
          );
        }
      }

      return {
        id: m.id,
        name: m.name,
        status: m.status,
        indicator,
        remainingTime,
        currentInvoice: currentOrder?.invoiceNumber || null,
      };
    });
  }

  findAll() {
    return this.prisma.machine.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const machine = await this.prisma.machine.findUnique({
      where: { id },
    });
    if (!machine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }
    return machine;
  }

  async update(id: number, updateMachineDto: UpdateMachineDto) {
    await this.findOne(id); // Check if exists
    return this.prisma.machine.update({
      where: { id },
      data: updateMachineDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Check if exists
    return this.prisma.machine.delete({
      where: { id },
    });
  }
}
