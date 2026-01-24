import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
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
  findAll() {
    return this.shiftsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftsService.findOne(id);
  }
}
