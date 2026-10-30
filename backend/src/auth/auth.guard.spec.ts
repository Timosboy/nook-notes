import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthGuard } from './auth.guard';

jest.mock('@nestjs/jwt', () => ({ JwtService: class JwtService {} }));
jest.mock('../users/users.service', () => ({
  UsersService: class UsersService {},
}));

describe('AuthGuard', () => {
  const userId = 'a8a65423-1d1e-4bd6-94b3-bc5ef08c50b1';
  let guard: AuthGuard;
  let reflector: { getAllAndOverride: jest.Mock };
  let jwt: { verifyAsync: jest.Mock };
  let users: { findById: jest.Mock };
  let request: { headers: { authorization?: string }; userId?: string };
  let context: ExecutionContext;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) };
    jwt = { verifyAsync: jest.fn().mockResolvedValue({ sub: userId }) };
    users = { findById: jest.fn().mockResolvedValue({ id: userId }) };
    request = { headers: { authorization: 'Bearer token' } };
    context = {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    guard = new AuthGuard(
      reflector as unknown as Reflector,
      jwt as unknown as JwtService,
      users as unknown as UsersService,
    );
  });

  it('allows public routes without a token', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    request.headers = {};
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwt.verifyAsync).not.toHaveBeenCalled();
  });

  it('attaches the verified user id', async () => {
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.userId).toBe(userId);
    expect(users.findById).toHaveBeenCalledWith(userId);
  });

  it.each([undefined, 'Basic token', 'Bearer', 'Bearer token extra'])(
    'rejects malformed authorization %s',
    async (authorization) => {
      request.headers.authorization = authorization;
      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Sign in to continue'),
      );
    },
  );

  it.each(['invalid', 'expired'])('rejects an %s token', async () => {
    jwt.verifyAsync.mockRejectedValue(new Error('Invalid token'));
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Sign in to continue'),
    );
  });

  it('rejects a deleted user', async () => {
    users.findById.mockResolvedValue(null);
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Sign in to continue'),
    );
  });

  it('rejects invalid subjects before querying the database', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 'invalid' });
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Sign in to continue'),
    );
    expect(users.findById).not.toHaveBeenCalled();
  });
});
