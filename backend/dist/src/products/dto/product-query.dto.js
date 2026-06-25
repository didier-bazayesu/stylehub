"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductQueryDto = exports.ProductSort = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const dto_1 = require("../../common/dto");
var ProductSort;
(function (ProductSort) {
    ProductSort["NEWEST"] = "newest";
    ProductSort["PRICE_ASC"] = "price_asc";
    ProductSort["PRICE_DESC"] = "price_desc";
    ProductSort["RATING"] = "rating";
})(ProductSort || (exports.ProductSort = ProductSort = {}));
class ProductQueryDto extends dto_1.PaginationQueryDto {
    category;
    vendor;
    search;
    minPrice;
    maxPrice;
    sort = ProductSort.NEWEST;
    status;
}
exports.ProductQueryDto = ProductQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'men' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductQueryDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'urban-threads' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductQueryDto.prototype, "vendor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'denim jacket' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], ProductQueryDto.prototype, "minPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 200 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], ProductQueryDto.prototype, "maxPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ProductSort, default: ProductSort.NEWEST }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ProductSort),
    __metadata("design:type", String)
], ProductQueryDto.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.ProductStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ProductStatus),
    __metadata("design:type", String)
], ProductQueryDto.prototype, "status", void 0);
//# sourceMappingURL=product-query.dto.js.map