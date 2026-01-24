import { IsNotEmpty, IsNumber, Min, IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class PayOrderDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  paidAmount: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
