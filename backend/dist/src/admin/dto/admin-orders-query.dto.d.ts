import { OrderStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto';
export declare class AdminOrdersQueryDto extends PaginationQueryDto {
    status?: OrderStatus;
}
