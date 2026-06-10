import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  first_name: z.string().min(2, 'First name is too short'),
  last_name: z.string().min(2, 'Last name is too short'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const addressSchema = z.object({
  full_name: z.string().min(3, 'Full name is required'),
  phone: z.string().min(8, 'Valid phone number is required'),
  line1: z.string().min(5, 'Address line 1 is too short'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/Province is required'),
  postal_code: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(4, 'Review is too short').optional(),
});

export const productVariantSchema = z.object({
  size: z.string().min(1, 'Size is required'),
  color: z.string().optional(),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  stock: z.number().min(0, 'Stock cannot be negative'),
});

export const productSchema = z.object({
  name: z.string().min(3, 'Product name is too short'),
  slug: z.string().min(3, 'Slug is too short'),
  description: z.string().min(10, 'Description is too short'),
  base_price: z.number().min(0.01, 'Price must be greater than 0'),
  category_id: z.string().min(1, 'Category is required'),
  variants: z.array(productVariantSchema).optional(),
});

export const couponSchema = z.object({
  code: z.string().min(3, 'Coupon code should be at least 3 letters'),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().min(1, 'Value must be positive'),
  min_order: z.number().optional(),
  max_uses: z.number().optional(),
  expires_at: z.string().optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
