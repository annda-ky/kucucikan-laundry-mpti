import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class CreateInventoryItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  unit: string;

  @IsInt()
  @Min(0)
  stockQuantity: number;

  @IsInt()
  @Min(1)
  minStockAlert: number;
}
