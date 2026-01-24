import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateStoreSettingDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsString()
  value: string;
}
