import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';
import { ExpenseCategory } from '@prisma/client';

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsNumber()
  inventoryItemId?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  restockQuantity?: number;
}
