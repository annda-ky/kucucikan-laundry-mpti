import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateStoreSettingDto } from './dto/update-store-setting.dto';

@Injectable()
export class StoreSettingsService {
  constructor(private prisma: PrismaService) {}

  async upsert(UpdateStoreSettingDto: UpdateStoreSettingDto) {
    return this.prisma.storeSetting.upsert({
      where: { key: UpdateStoreSettingDto.key },
      update: { value: UpdateStoreSettingDto.value },
      create: {
        key: UpdateStoreSettingDto.key,
        value: UpdateStoreSettingDto.value,
      },
    });
  }

  async findAll() {
    const settings = await this.prisma.storeSetting.findMany();
    return settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  }

  async getReceiptConfig() {
    const keys = ['store_name', 'store_address', 'receipt_footer'];
    const settings = await this.prisma.storeSetting.findMany({
      where: { key: { in: keys } },
    });

    return settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  }

  async bulkUpsert(settings: Record<string, string>) {
    const promises = Object.entries(settings).map(([key, value]) =>
      this.prisma.storeSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    );
    return Promise.all(promises);
  }
}
