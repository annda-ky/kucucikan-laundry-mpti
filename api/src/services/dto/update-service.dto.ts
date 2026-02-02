import { PartialType } from '@nestjs/mapped-types';
import { ConnectRecipeDto, CreateServiceDto } from './create-service.dto';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean; // Untuk Soft Delete

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConnectRecipeDto)
  recipes?: ConnectRecipeDto[];
}
