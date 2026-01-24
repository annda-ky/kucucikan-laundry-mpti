import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';
import { UnitType } from '@prisma/client';

export class CreateServiceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsEnum(UnitType)
  unitType: UnitType; // KG, PCS, LOAD

  @IsOptional()
  @IsNumber()
  defaultDuration?: number; // Menit
}
