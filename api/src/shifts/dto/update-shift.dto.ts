import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateShiftDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  actualCashClosing: number;
}
