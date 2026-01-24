import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  // Leaderboard - accessible by all authenticated users
  @Get('leaderboard')
  getLeaderboard(
    @Query('sort') sort: 'totalSpend' | 'totalVisits' = 'totalSpend',
  ) {
    return this.customersService.getLeaderboard(sort);
  }

  // Passive customers - accessible by all authenticated users
  @Get('passive')
  getPassive() {
    return this.customersService.getPassiveCustomers();
  }

  @Get('lookup')
  async findByPhone(@Query('phone') phone: string) {
    if (!phone || phone.length < 4) {
      return [];
    }
    const customers = await this.customersService.findByPhone(phone);
    return customers || [];
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Roles(Role.OWNER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
