import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VoidOrderDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  ownerPin: string;

  @IsNotEmpty()
  @IsString()
  reason: string;
}
