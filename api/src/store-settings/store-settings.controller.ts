import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { StoreSettingsService } from './store-settings.service';
import { UpdateStoreSettingDto } from './dto/update-store-setting.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('store-settings')
export class StoreSettingsController {
  constructor(private readonly storeSettingsService: StoreSettingsService) {}

  @Roles(Role.OWNER)
  @Post()
  update(@Body() UpdateStoreSettingDto: UpdateStoreSettingDto) {
    return this.storeSettingsService.upsert(UpdateStoreSettingDto);
  }

  @Roles(Role.OWNER)
  @Post('bulk')
  updateBulk(@Body() settings: Record<string, string>) {
    return this.storeSettingsService.bulkUpsert(settings);
  }

  @Get()
  findAll() {
    return this.storeSettingsService.findAll();
  }

  @Get('receipt')
  getReceiptConfig() {
    return this.storeSettingsService.getReceiptConfig();
  }
}
