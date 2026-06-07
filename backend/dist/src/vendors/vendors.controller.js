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
exports.VendorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const vendors_service_1 = require("./vendors.service");
const dto_1 = require("./dto");
const decorators_1 = require("../common/decorators");
let VendorsController = class VendorsController {
    vendorsService;
    constructor(vendorsService) {
        this.vendorsService = vendorsService;
    }
    apply(userId, dto) {
        return this.vendorsService.apply(userId, dto);
    }
    getMe(userId) {
        return this.vendorsService.getMe(userId);
    }
    updateMe(userId, dto) {
        return this.vendorsService.updateMe(userId, dto);
    }
    getStats(userId) {
        return this.vendorsService.getStats(userId);
    }
};
exports.VendorsController = VendorsController;
__decorate([
    (0, common_1.Post)('apply'),
    (0, decorators_1.Roles)(client_1.Role.CUSTOMER),
    (0, swagger_1.ApiOperation)({ summary: 'Apply to become a vendor' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ApplyVendorDto]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "apply", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get current vendor profile' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update current vendor profile' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateVendorDto]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Get)('me/stats'),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get vendor overview statistics' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "getStats", null);
exports.VendorsController = VendorsController = __decorate([
    (0, swagger_1.ApiTags)('Vendors'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('vendors'),
    __metadata("design:paramtypes", [vendors_service_1.VendorsService])
], VendorsController);
//# sourceMappingURL=vendors.controller.js.map