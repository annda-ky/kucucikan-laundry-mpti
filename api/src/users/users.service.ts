import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    console.log('[DEBUG] UserService.create called');
    console.log(
      `[DEBUG] Received PIN type: ${typeof createUserDto.pin}, Value: ${createUserDto.pin}`,
    );

    const salt: string = await bcrypt.genSalt();
    const hash: string = await bcrypt.hash(createUserDto.pin, salt);
    console.log(`[DEBUG] Generated Hash: ${hash}`);

    return this.prisma.user.create({
      data: {
        username: createUserDto.username,
        pin_hash: hash,
        role: createUserDto.role || 'ADMIN',
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const data: any = { ...updateUserDto };

    if (updateUserDto.pin) {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(updateUserDto.pin, salt);
      data.pin_hash = hash;
      delete data.pin;
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    // Soft Delete
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
