"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const serverless_1 = require("@neondatabase/serverless");
const sql = (0, serverless_1.neon)(process.env.DATABASE_URL);
async function main() {
    console.log('🧹 Cleaning database...');
    await sql `TRUNCATE TABLE "AuditLog", "Analytics", "Notification", "Payment", "OrderItem", "Order", "CartItem", "Cart", "WishlistItem", "Wishlist", "Review", "ProductImage", "ProductVariant", "Product", "Store", "Vendor", "Address", "Coupon", "Category" CASCADE`;
    console.log('✅ Done. Users preserved.');
    const count = await sql `SELECT COUNT(*) FROM "User"`;
    console.log('Users remaining:', count[0].count);
}
main().catch(console.error);
//# sourceMappingURL=clean.js.map