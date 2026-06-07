export declare class PaginationQueryDto {
    page?: number;
    limit?: number;
}
export declare class PaginatedResponseDto<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    constructor(data: T[], total: number, page: number, limit: number);
}
