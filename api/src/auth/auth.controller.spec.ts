import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    signIn: jest.fn(),
    register: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    username: 'admin',
    role: 'ADMIN',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should return access token and user on successful login', async () => {
      const loginDto = { username: 'admin', pin: '1234' };
      const expectedResult = {
        access_token: 'jwt_token',
        user: mockUser,
      };
      mockAuthService.signIn.mockResolvedValue(expectedResult);

      const result = await controller.signIn(loginDto);

      expect(mockAuthService.signIn).toHaveBeenCalledWith('admin', '1234');
      expect(result).toEqual(expectedResult);
    });

    it('should call signIn with correct credentials', async () => {
      const loginDto = { username: 'owner', pin: '5678' };
      mockAuthService.signIn.mockResolvedValue({
        access_token: 'token',
        user: {},
      });

      await controller.signIn(loginDto);

      expect(mockAuthService.signIn).toHaveBeenCalledWith('owner', '5678');
    });
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const registerDto = {
        username: 'newuser',
        pin: '1234',
        role: 'ADMIN' as const,
      };
      const expectedResult = {
        message: 'User berhasil dibuat',
        user: { id: 'user-2', username: 'newuser', role: 'ADMIN' },
      };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(
        'newuser',
        '1234',
        'ADMIN',
      );
      expect(result).toEqual(expectedResult);
    });

    it('should create owner user', async () => {
      const registerDto = {
        username: 'owner1',
        pin: '9999',
        role: 'OWNER' as const,
      };
      mockAuthService.register.mockResolvedValue({
        message: 'User berhasil dibuat',
        user: { id: 'owner-1', username: 'owner1', role: 'OWNER' },
      });

      await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(
        'owner1',
        '9999',
        'OWNER',
      );
    });
  });
});
