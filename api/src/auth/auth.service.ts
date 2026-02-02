import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pin: string) {
    const allUsers = await this.usersService.findAll();
    const user = allUsers.find((u) => u.username === username);

    if (!user) {
      throw new UnauthorizedException('Username tidak ditemukan');
    }

    console.log(`[DEBUG] Login attempt for ${username}`);
    console.log(`[DEBUG] Input PIN type: ${typeof pin}, Value: ${pin}`);
    console.log(
      `[DEBUG] Stored Hash: ${user.pin_hash.substring(0, 10)}... (Length: ${user.pin_hash.length})`,
    );

    const isMatch = await bcrypt.compare(pin, user.pin_hash);
    console.log(`[DEBUG] Is Match: ${isMatch}`);

    if (!isMatch) {
      throw new UnauthorizedException('PIN Salah');
    }

    // Increment token version to invalidate old sessions
    const updatedUser = await this.usersService.update(user.id, {
      tokenVersion: (user.tokenVersion || 0) + 1,
    });

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      tokenVersion: updatedUser.tokenVersion,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async register(username: string, pin: string, role: 'ADMIN' | 'OWNER') {
    const allUsers = await this.usersService.findAll();
    const existing = allUsers.find((u) => u.username === username);

    if (existing) {
      throw new ConflictException('Username sudah digunakan');
    }

    // UsersService.create handles password hashing
    const user = await this.usersService.create({
      username,
      pin,
      role,
    });

    return {
      message: 'User berhasil dibuat',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }
}
