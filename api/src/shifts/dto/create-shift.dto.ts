import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateShiftDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  startCash: number;
}
