import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockUser = {
    id: 'user-1',
    username: 'admin',
    pin_hash: 'hashed_pin',
    role: 'ADMIN',
    tokenVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user with hashed pin', async () => {
      const createDto = {
        username: 'admin',
        pin: '1234',
        role: 'ADMIN' as const,
      };
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pin');
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('1234', 'salt');
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          username: 'admin',
          pin_hash: 'hashed_pin',
          role: 'ADMIN',
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should default to ADMIN role if not provided', async () => {
      const createDto = { username: 'admin', pin: '1234' } as any;
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pin');
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      await service.create(createDto);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ role: 'ADMIN' }),
      });
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('user-1');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update user without changing pin', async () => {
      const updateDto = { username: 'newadmin' };
      const updatedUser = { ...mockUser, username: 'newadmin' };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-1', updateDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { username: 'newadmin' },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should hash new pin when updating', async () => {
      const updateDto = { pin: '5678' };
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_pin');
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        pin_hash: 'new_hashed_pin',
      });

      await service.update('user-1', updateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('5678', 'salt');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { pin_hash: 'new_hashed_pin' },
      });
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove('user-1');

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException on foreign key constraint', async () => {
      mockPrismaService.user.delete.mockRejectedValue({ code: 'P2003' });

      await expect(service.remove('user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should rethrow other errors', async () => {
      const error = new Error('Unknown error');
      mockPrismaService.user.delete.mockRejectedValue(error);

      await expect(service.remove('user-1')).rejects.toThrow(error);
    });
  });
});
