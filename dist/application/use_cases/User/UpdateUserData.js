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
exports.UpdateUserData = void 0;
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../../domain/errors/Autherror");
const Tokens_1 = require("../../../constants/Tokens");
const ErrorMessages_1 = require("../../../constants/ErrorMessages");
const HttpStatusCode_1 = require("../../../constants/HttpStatusCode");
const UserResponseDto_1 = require("../../dto/user/UserResponseDto");
let UpdateUserData = class UpdateUserData {
    constructor(_userRepository) {
        this._userRepository = _userRepository;
    }
    async execute(userId, updateData) {
        if (!userId) {
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_ID_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.BAD_REQUEST);
        }
        const user = await this._userRepository.getUserById(userId);
        if (!user) {
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
        }
        const updatedUser = await this._userRepository.updateUser(userId, updateData);
        if (!updatedUser) {
            throw new Autherror_1.AuthError(ErrorMessages_1.ERROR_MESSAGES.USER_NOT_FOUND, HttpStatusCode_1.HTTP_STATUS_CODES.NOT_FOUND);
        }
        return (0, UserResponseDto_1.toUserResponse)(updatedUser);
    }
};
exports.UpdateUserData = UpdateUserData;
exports.UpdateUserData = UpdateUserData = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IUSER_REPO)),
    __metadata("design:paramtypes", [Object])
], UpdateUserData);
//# sourceMappingURL=UpdateUserData.js.map