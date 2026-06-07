import { ProductStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto';
export declare class AdminProductsQueryDto extends PaginationQueryDto {
    vendor?: string;
    category?: string;
    status?: ProductStatus;
    search?: string;
}
