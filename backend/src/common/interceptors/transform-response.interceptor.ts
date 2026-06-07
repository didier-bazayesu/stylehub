import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Standard success response envelope:
 * { success: true, data: <payload>, meta: <pagination | null> }
 */
export interface SuccessResponse<T> {
  success: boolean;
  data: T;
  meta: any | null;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the data already has the envelope structure, pass through
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // If the data contains meta (pagination), extract it
        if (data && typeof data === 'object' && 'meta' in data) {
          return {
            success: true,
            data: data.data,
            meta: data.meta,
          };
        }

        return {
          success: true,
          data,
          meta: null,
        };
      }),
    );
  }
}
