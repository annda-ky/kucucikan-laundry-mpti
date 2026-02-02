import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VoidOrderDto } from './dto/void-order.dto';
import { PayOrderDto } from './dto/pay-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {
  // Rebuild trigger for DTO updates
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto, req.user.userId);
  }

  @Post(':id/promo')
  applyPromo(@Param('id') id: string, @Body('code') code: string) {
    return this.ordersService.applyPromo(id, code);
  }

  @Patch(':id/pay')
  payOrder(@Param('id') id: string, @Body() payOrderDto: PayOrderDto) {
    return this.ordersService.payOrder(id, payOrderDto);
  }

  @Patch(':id/void')
  voidOrder(@Param('id') id: string, @Body() voidOrderDto: VoidOrderDto) {
    return this.ordersService.voidOrder(id, voidOrderDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.ordersService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
}
