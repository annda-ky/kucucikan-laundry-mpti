import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConnectRecipeDto)
  recipes?: ConnectRecipeDto[];
}

export class ConnectRecipeDto {
  @IsNotEmpty()
  @IsNumber()
  inventoryItemId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}
