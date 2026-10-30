import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('@nestjs/jwt', () => ({ JwtService: class JwtService {} }));

jest.mock('../users/users.service', () => ({
  UsersService: class UsersService {},
}));

describe('AuthService', () => {
  const profile = { id: 'user-id', name: 'Demo', email: 'demo@nook.app' };
  let service: AuthService;
  let users: { findByEmail: jest.Mock; findById: jest.Mock; create: jest.Mock };
  let jwt: { signAsync: jest.Mock };
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await hash('nook-demo-2026', 10);
  });

  beforeEach(() => {
    users = { findByEmail: jest.fn(), findById: jest.fn(), create: jest.fn() };
    jwt = { signAsync: jest.fn().mockResolvedValue('token') };
    service = new AuthService(
      users as unknown as UsersService,
      jwt as unknown as JwtService,
    );
  });

  it('normalizes registration and hashes the password', async () => {
    users.findByEmail.mockResolvedValue(null);
    users.create.mockResolvedValue(profile);

    await expect(
      service.register({
        name: ' Demo ',
        email: ' DEMO@NOOK.APP ',
        password: 'nook-demo-2026',
      }),
    ).resolves.toEqual({ token: 'token', user: profile });
    expect(users.findByEmail).toHaveBeenCalledWith(profile.email);
    expect(users.create).toHaveBeenCalledWith({
      name: 'Demo',
      email: profile.email,
      passwordHash: expect.any(String) as unknown,
    });
    const created = (
      users.create.mock.calls as [{ passwordHash: string }][]
    )[0][0];
    expect(created.passwordHash).not.toBe('nook-demo-2026');
    expect(created.passwordHash).toMatch(/^\$2[aby]\$10\$/);
    await expect(compare('nook-demo-2026', created.passwordHash)).resolves.toBe(
      true,
    );
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: profile.id });
  });

  it('rejects duplicate email addresses', async () => {
    users.findByEmail.mockResolvedValue(profile);

    await expect(
      service.register({ ...profile, password: 'nook-demo-2026' }),
    ).rejects.toThrow(
      new ConflictException('An account with this email already exists'),
    );
    expect(users.create).not.toHaveBeenCalled();
  });

  it('logs in and returns only public user fields', async () => {
    users.findByEmail.mockResolvedValue({ ...profile, passwordHash });

    await expect(
      service.login({ email: ' DEMO@NOOK.APP ', password: 'nook-demo-2026' }),
    ).resolves.toEqual({ token: 'token', user: profile });
    expect(users.findByEmail).toHaveBeenCalledWith(profile.email);
  });

  it('rejects a wrong password', async () => {
    users.findByEmail.mockResolvedValue({ ...profile, passwordHash });

    await expect(
      service.login({ email: profile.email, password: 'wrong-password' }),
    ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('rejects an unknown email after comparing a dummy hash', async () => {
    users.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@nook.app', password: 'nook-demo-2026' }),
    ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });
});
