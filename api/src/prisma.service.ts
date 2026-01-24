// apps/api/src/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. Inisialisasi koneksi pool ke PostgreSQL
    const connectionString = `${process.env.DATABASE_URL}`;
    const pool = new Pool({ connectionString });

    // 2. Pasang Adapter Prisma (Wajib di V7)
    const adapter = new PrismaPg(pool);

    // 3. Panggil constructor induk dengan opsi adapter
    super({ adapter });
  }

  async onModuleInit() {
    // Membuka koneksi saat aplikasi mulai
    await this.$connect();
  }
}
