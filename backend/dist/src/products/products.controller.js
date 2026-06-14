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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const multer_1 = require("multer");
const products_service_1 = require("./products.service");
const dto_1 = require("./dto");
const decorators_1 = require("../common/decorators");
const imageUploadOptions = {
    storage: (0, multer_1.memoryStorage)(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png|webp)$/)) {
            callback(new common_1.BadRequestException({
                code: 'INVALID_FILE_TYPE',
                message: 'Only JPEG, PNG, and WebP images are allowed.',
            }), false);
            return;
        }
        callback(null, true);
    },
};
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    findFeatured() {
        return this.productsService.findFeatured();
    }
    findAll(query) {
        return this.productsService.findAll(query);
    }
    findOwnProductBySlug(userId, slug) {
        return this.productsService.findOwnProductBySlug(userId, slug);
    }
    findOwn(userId, query) {
        return this.productsService.findOwn(userId, query);
    }
    findBySlug(slug) {
        return this.productsService.findBySlug(slug);
    }
    create(userId, dto) {
        return this.productsService.create(userId, dto);
    }
    update(userId, productId, dto) {
        return this.productsService.update(userId, productId, dto);
    }
    updateStatus(userId, productId, dto) {
        return this.productsService.updateStatus(userId, productId, dto);
    }
    remove(userId, productId) {
        return this.productsService.remove(userId, productId);
    }
    addImages(userId, productId, files) {
        if (!files?.length) {
            throw new common_1.BadRequestException({
                code: 'FILE_REQUIRED',
                message: 'At least one image file is required.',
            });
        }
        return this.productsService.addImages(userId, productId, files);
    }
    removeImage(userId, productId, imageId) {
        return this.productsService.removeImage(userId, productId, imageId);
    }
    addVariant(userId, productId, dto) {
        return this.productsService.addVariant(userId, productId, dto);
    }
    updateVariant(userId, productId, variantId, dto) {
        return this.productsService.updateVariant(userId, productId, variantId, dto);
    }
    removeVariant(userId, productId, variantId) {
        return this.productsService.removeVariant(userId, productId, variantId);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('featured'),
    (0, swagger_1.ApiOperation)({ summary: 'List featured products' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findFeatured", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List products with filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ProductQueryDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('manage/:slug'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get own product by slug for editing' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOwnProductBySlug", null);
__decorate([
    (0, common_1.Get)('manage'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiOperation)({ summary: 'List own products — all statuses (vendor dashboard)' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ProductQueryDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOwn", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single product by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create a product (defaults to DRAFT)' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update own product' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiOperation)({ summary: 'Publish or archive a product' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateProductStatusDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete own product' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/images'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload product images (up to 5 total)' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 5, imageUploadOptions)),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "addImages", null);
__decorate([
    (0, common_1.Delete)(':id/images/:imageId'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a product image' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('imageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "removeImage", null);
__decorate([
    (0, common_1.Post)(':id/variants'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiOperation)({ summary: 'Add a variant to a product' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.CreateVariantDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "addVariant", null);
__decorate([
    (0, common_1.Patch)(':id/variants/:variantId'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update a product variant' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('variantId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, dto_1.UpdateVariantDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "updateVariant", null);
__decorate([
    (0, common_1.Delete)(':id/variants/:variantId'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a product variant' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('variantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "removeVariant", null);
exports.ProductsController = ProductsController = __decorate([
    (0, swagger_1.ApiTags)('Products'),
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map