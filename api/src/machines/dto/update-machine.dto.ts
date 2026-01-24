import { PartialType } from '@nestjs/mapped-types';
import { CreateMachineDto } from './create-machine.dto';
import { IsOptional, IsEnum } from 'class-validator';

enum MachineStatus {
  IDLE = 'IDLE',
  WASHING = 'WASHING',
  OVERDUE = 'OVERDUE',
  BROKEN = 'BROKEN',
}

export class UpdateMachineDto extends PartialType(CreateMachineDto) {
  @IsOptional()
  @IsEnum(MachineStatus)
  status?: MachineStatus;
}
