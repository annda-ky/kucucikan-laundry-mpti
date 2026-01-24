import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  pin: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
