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
exports.ResetPasswordUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../../domain/errors/Autherror");
const Tokens_1 = require("../../../constants/Tokens");
const HttpStatusCode_1 = require("../../../constants/HttpStatusCode");
const ErrorMessages_1 = require("../../../constants/ErrorMessages");
let ResetPasswordUseCase = class ResetPasswordUseCase {
    constructor(_store, _userRepository, _driverRepository) {
        this._store = _store;
        this._userRepository = _userRepository;
        this._driverRepository = _driverRepository;
    }
    async execute(token, newPassword, role) {
        const userId = await this._store.getTokenUser(role, token);
        if (!userId)
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.INVALID_TOKEN, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
        let user;
        if (role === 'user' || role === 'admin') {
            user = await this._userRepository.getUserById(userId);
            if (!user)
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
        }
        else if (role === 'driver') {
            user = await this._driverRepository.findDriverById(userId);
            if (!user)
                throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.DRIVER_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
        }
        if (user) {
            const updatedData = {
                password: newPassword,
            };
            if (role === 'user' || role === 'admin') {
                if (user._id) {
                    await this._userRepository.updateUser(user._id.toString(), updatedData);
                }
            }
            else if (role === 'driver') {
                if (user._id) {
                    await this._driverRepository.update(user._id.toString(), updatedData);
                }
            }
            // Remove token from Redis after successful password reset
            await this._store.removeTokenUser(role, token);
        }
        else {
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
        }
    }
};
exports.ResetPasswordUseCase = ResetPasswordUseCase;
exports.ResetPasswordUseCase = ResetPasswordUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.USER_REGISTERSTORE)),
    __param(1, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IUSER_REPO)),
    __param(2, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IDRIVER_REPO)),
    __metadata("design:paramtypes", [Object, Object, Object])
], ResetPasswordUseCase);
//# sourceMappingURL=ResetPasswordUseCase.js.map