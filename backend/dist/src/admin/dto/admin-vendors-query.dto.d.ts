import { VendorStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto';
export declare class AdminVendorsQueryDto extends PaginationQueryDto {
    status?: VendorStatus;
}
