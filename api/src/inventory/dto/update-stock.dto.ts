import { IsNotEmpty, IsInt, IsEnum } from 'class-validator';
import { InventoryLogType } from '@prisma/client';

export class UpdateStockDto {
  @IsNotEmpty()
  @IsInt()
  changeAmount: number;

  @IsNotEmpty()
  @IsEnum(InventoryLogType)
  type: InventoryLogType;
}
