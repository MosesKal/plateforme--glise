import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

/**
 * Filtre catch-all : toute erreur (HttpException OU crash inattendu) sort avec
 * le même contrat { statusCode, message, timestamp, path } — le frontend
 * s'appuie sur cette forme unique (lib/api/errors.ts).
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let code: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object') {
        const body = exceptionResponse as {
          message?: string | string[];
          code?: string;
        };
        message = body.message ?? exception.message;
        code = body.code;
      } else {
        message = exception.message;
      }
      if (status === 413) code ??= 'FILE_TOO_LARGE';
    } else if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === 'P2002'
    ) {
      status = HttpStatus.CONFLICT;
      code = 'UNIQUE_CONSTRAINT';
      message = 'Une donnée identique existe déjà';
    } else if (
      exception instanceof Error &&
      (exception as NodeJS.ErrnoException).code === 'ENOSPC'
    ) {
      status = HttpStatus.INSUFFICIENT_STORAGE;
      code = 'STORAGE_FULL';
      message = 'Espace de stockage insuffisant';
    } else {
      // Erreur non prévue : loggée côté serveur, jamais exposée au client.
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(code && { code }),
      requestId: (request as Request & { requestId?: string }).requestId,
    });
  }
}
