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
exports.StoresController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const multer_1 = require("multer");
const stores_service_1 = require("./stores.service");
const dto_1 = require("./dto");
const decorators_1 = require("../common/decorators");
const dto_2 = require("../common/dto");
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
let StoresController = class StoresController {
    storesService;
    constructor(storesService) {
        this.storesService = storesService;
    }
    create(userId, dto) {
        return this.storesService.create(userId, dto);
    }
    update(userId, dto) {
        return this.storesService.update(userId, dto);
    }
    uploadLogo(userId, file) {
        if (!file) {
            throw new common_1.BadRequestException({
                code: 'FILE_REQUIRED',
                message: 'Image file is required. Send the file under the field name "logo".',
            });
        }
        return this.storesService.uploadLogo(userId, file);
    }
    uploadBanner(userId, file) {
        if (!file) {
            throw new common_1.BadRequestException({
                code: 'FILE_REQUIRED',
                message: 'Image file is required. Send the file under the field name "banner".',
            });
        }
        return this.storesService.uploadBanner(userId, file);
    }
    getStoreProducts(slug, query) {
        return this.storesService.getStoreProducts(slug, query);
    }
    getBySlug(slug) {
        return this.storesService.getBySlug(slug);
    }
};
exports.StoresController = StoresController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create a store (one per vendor)' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateStoreDto]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update current vendor store' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateStoreDto]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('logo'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload store logo' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('logo', imageUploadOptions)),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "uploadLogo", null);
__decorate([
    (0, common_1.Post)('banner'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload store banner' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('banner', imageUploadOptions)),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "uploadBanner", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)(':slug/products'),
    (0, swagger_1.ApiOperation)({ summary: 'List products for a store' }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_2.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "getStoreProducts", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get public store page by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "getBySlug", null);
exports.StoresController = StoresController = __decorate([
    (0, swagger_1.ApiTags)('Stores'),
    (0, common_1.Controller)('stores'),
    __metadata("design:paramtypes", [stores_service_1.StoresService])
], StoresController);
//# sourceMappingURL=stores.controller.js.map