export declare class CreateCouponDto {
    code: string;
    discount_type: string;
    discount_value: number;
    min_order?: number;
    max_uses?: number;
    expires_at?: string;
    is_active?: boolean;
}
