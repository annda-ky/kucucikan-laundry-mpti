import { Module } from '@nestjs/common';
import { PromosService } from './promos.service';
import { PromosController } from './promos.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PromosController],
  providers: [PromosService, PrismaService],
  exports: [PromosService], // Export so OrdersModule can use it
})
export class PromosModule {}
