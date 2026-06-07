import { Role } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto';
export declare class AdminUsersQueryDto extends PaginationQueryDto {
    role?: Role;
    search?: string;
}
