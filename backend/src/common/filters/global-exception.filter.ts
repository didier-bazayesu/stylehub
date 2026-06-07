import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

/**
 * Global exception filter that catches all unhandled exceptions
 * and formats them into the standard error envelope:
 * { success: false, error: { code, message } }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number;
    let code: string;
    let message: string;

    // ── NestJS HttpException ─────────────────────────────────────
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'object' && exResponse !== null) {
        const resp = exResponse as Record<string, any>;
        // class-validator sends array of messages
        if (Array.isArray(resp.message)) {
          message = resp.message.join(', ');
        } else {
          message = resp.message || exception.message;
        }
        code = resp.code || this.getErrorCode(status);
      } else {
        message = String(exResponse);
        code = this.getErrorCode(status);
      }
    }
    // ── Prisma: unique constraint violation ──────────────────────
    else if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === 'P2002'
    ) {
      status = HttpStatus.CONFLICT;
      const target = (exception.meta?.target as string[]) || [];
      code = 'DUPLICATE_ENTRY';
      message = `A record with this ${target.join(', ')} already exists.`;
    }
    // ── Prisma: record not found ─────────────────────────────────
    else if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === 'P2025'
    ) {
      status = HttpStatus.NOT_FOUND;
      code = 'RECORD_NOT_FOUND';
      message = 'The requested record was not found.';
    }
    // ── Unexpected errors ────────────────────────────────────────
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_ERROR';
      message = 'An unexpected error occurred. Please try again later.';

      // Log full error details server-side only
      this.logger.error(
        'Unhandled exception:',
        exception instanceof Error ? exception.stack : exception,
      );
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
      },
    });
  }

  private getErrorCode(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'RATE_LIMIT_EXCEEDED',
      500: 'INTERNAL_ERROR',
    };
    return codeMap[status] || 'UNKNOWN_ERROR';
  }
}
