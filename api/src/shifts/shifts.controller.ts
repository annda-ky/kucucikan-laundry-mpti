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
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post('start')
  startShift(@Request() req, @Body() createShiftDto: CreateShiftDto) {
    return this.shiftsService.startShift(req.user.userId, createShiftDto);
  }

  @Patch('end')
  endShift(@Request() req, @Body() updateShiftDto: UpdateShiftDto) {
    return this.shiftsService.endShift(req.user.userId, updateShiftDto);
  }

  @Patch(':id/end')
  forceEndShift(
    @Param('id') id: string,
    @Body() updateShiftDto: UpdateShiftDto,
  ) {
    return this.shiftsService.forceEndShift(id, updateShiftDto);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.shiftsService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftsService.findOne(id);
  }
}
