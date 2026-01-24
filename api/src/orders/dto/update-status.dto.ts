import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { StatusLaundry } from '@prisma/client';

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsEnum(StatusLaundry)
  status: StatusLaundry;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  rackLocation?: string;
}
