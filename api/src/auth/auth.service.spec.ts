import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findAll: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    username: 'admin',
    pin_hash: 'hashed_pin',
    role: 'ADMIN',
    tokenVersion: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should return access token and user on valid credentials', async () => {
      mockUsersService.findAll.mockResolvedValue([mockUser]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUsersService.update.mockResolvedValue({
        ...mockUser,
        tokenVersion: 2,
      });
      mockJwtService.signAsync.mockResolvedValue('jwt_token');

      const result = await service.signIn('admin', '1234');

      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith('1234', 'hashed_pin');
      expect(mockUsersService.update).toHaveBeenCalledWith('user-1', {
        tokenVersion: 2,
      });
      expect(result).toEqual({
        access_token: 'jwt_token',
        user: { id: 'user-1', username: 'admin', role: 'ADMIN' },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      await expect(service.signIn('unknown', '1234')).rejects.toThrow(
        new UnauthorizedException('Username tidak ditemukan'),
      );
    });

    it('should throw UnauthorizedException if PIN is wrong', async () => {
      mockUsersService.findAll.mockResolvedValue([mockUser]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn('admin', 'wrong')).rejects.toThrow(
        new UnauthorizedException('PIN Salah'),
      );
    });
  });

  describe('register', () => {
    it('should create a new user', async () => {
      mockUsersService.findAll.mockResolvedValue([]);
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register('newuser', '1234', 'ADMIN');

      expect(mockUsersService.create).toHaveBeenCalledWith({
        username: 'newuser',
        pin: '1234',
        role: 'ADMIN',
      });
      expect(result).toEqual({
        message: 'User berhasil dibuat',
        user: { id: 'user-1', username: 'admin', role: 'ADMIN' },
      });
    });

    it('should throw ConflictException if username exists', async () => {
      mockUsersService.findAll.mockResolvedValue([mockUser]);

      await expect(service.register('admin', '1234', 'ADMIN')).rejects.toThrow(
        new ConflictException('Username sudah digunakan'),
      );
    });
  });
});
