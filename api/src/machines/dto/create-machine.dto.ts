import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMachineDto {
  @IsNotEmpty()
  @IsString()
  name: string; // Washer 1, Dryer A
}
