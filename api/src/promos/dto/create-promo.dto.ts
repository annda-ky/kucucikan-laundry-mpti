import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';
import { PromoType } from '@prisma/client';

export class CreatePromoDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(PromoType)
  type: PromoType;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  value: number;

  @IsOptional()
  validUntil?: string; // ISO Date string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
