import { PaginationQueryDto } from '../../common/dto';
export declare enum ProductSort {
    NEWEST = "newest",
    PRICE_ASC = "price_asc",
    PRICE_DESC = "price_desc",
    RATING = "rating"
}
export declare class ProductQueryDto extends PaginationQueryDto {
    category?: string;
    vendor?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: ProductSort;
}
