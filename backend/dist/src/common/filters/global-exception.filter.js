"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        let status;
        let code;
        let message;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exResponse = exception.getResponse();
            if (typeof exResponse === 'object' && exResponse !== null) {
                const resp = exResponse;
                if (Array.isArray(resp.message)) {
                    message = resp.message.join(', ');
                }
                else {
                    message = resp.message || exception.message;
                }
                code = resp.code || this.getErrorCode(status);
            }
            else {
                message = String(exResponse);
                code = this.getErrorCode(status);
            }
        }
        else if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            exception.code === 'P2002') {
            status = common_1.HttpStatus.CONFLICT;
            const target = exception.meta?.target || [];
            code = 'DUPLICATE_ENTRY';
            message = `A record with this ${target.join(', ')} already exists.`;
        }
        else if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            exception.code === 'P2025') {
            status = common_1.HttpStatus.NOT_FOUND;
            code = 'RECORD_NOT_FOUND';
            message = 'The requested record was not found.';
        }
        else {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            code = 'INTERNAL_ERROR';
            message = 'An unexpected error occurred. Please try again later.';
            this.logger.error('Unhandled exception:', exception instanceof Error ? exception.stack : exception);
        }
        response.status(status).json({
            success: false,
            error: {
                code,
                message,
            },
        });
    }
    getErrorCode(status) {
        const codeMap = {
            400: 'VALIDATION_ERROR',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            422: 'UNPROCESSABLE_ENTITY',
            429: 'RATE_LIMIT_EXCEEDED',
            500: 'INTERNAL_ERROR',
        };
        return codeMap[status] || 'UNKNOWN_ERROR';
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map