import { BadRequestException, HttpException, Logger } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { HttpErrorFilter } from './http-error.filter';

describe('HttpErrorFilter', () => {
  const createHost = () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const request = { url: '/api/notes' };
    const host = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({ status }),
      }),
    } as unknown as ArgumentsHost;

    return { host, status, json };
  };

  it('returns the status and message from an HttpException', () => {
    const filter = new HttpErrorFilter();
    const { host, status, json } = createHost();

    filter.catch(new HttpException('Not found', 404), host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Not found',
        path: '/api/notes',
      }),
    );
  });

  it('preserves validation message arrays', () => {
    const filter = new HttpErrorFilter();
    const { host, status, json } = createHost();

    filter.catch(new BadRequestException(['title should not be empty']), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: ['title should not be empty'],
      }),
    );
  });

  it('returns a generic 500 response and logs unknown errors', () => {
    const filter = new HttpErrorFilter();
    const error = new Error('Database unavailable');
    const logger = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const { host, status, json } = createHost();

    filter.catch(error, host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
      }),
    );
    expect(logger).toHaveBeenCalledWith(error);
    logger.mockRestore();
  });
});
