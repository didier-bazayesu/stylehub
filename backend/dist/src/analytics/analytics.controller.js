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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const analytics_service_1 = require("./analytics.service");
const dto_1 = require("./dto");
const decorators_1 = require("../common/decorators");
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    getVendorOverview(userId) {
        return this.analyticsService.getVendorOverview(userId);
    }
    getVendorRevenue(userId, query) {
        return this.analyticsService.getVendorRevenue(userId, query.period ?? dto_1.AnalyticsPeriod.THIRTY_DAYS);
    }
    getVendorTopProducts(userId) {
        return this.analyticsService.getVendorTopProducts(userId);
    }
    getAdminOverview() {
        return this.analyticsService.getAdminOverview();
    }
    getAdminVendors() {
        return this.analyticsService.getAdminVendors();
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('vendor/overview'),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiOperation)({ summary: 'Vendor dashboard overview stats' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getVendorOverview", null);
__decorate([
    (0, common_1.Get)('vendor/revenue'),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiOperation)({ summary: 'Vendor revenue chart data' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AnalyticsPeriodDto]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getVendorRevenue", null);
__decorate([
    (0, common_1.Get)('vendor/top-products'),
    (0, decorators_1.Roles)(client_1.Role.VENDOR),
    (0, swagger_1.ApiOperation)({ summary: 'Top products by revenue for vendor' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getVendorTopProducts", null);
__decorate([
    (0, common_1.Get)('admin/overview'),
    (0, decorators_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Platform-wide admin overview stats' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getAdminOverview", null);
__decorate([
    (0, common_1.Get)('admin/vendors'),
    (0, decorators_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Vendor performance leaderboard' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getAdminVendors", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Analytics'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map