import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PromosModule } from '../promos/promos.module';

@Module({
  imports: [PromosModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
