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
exports.ChangePassword = void 0;
const tsyringe_1 = require("tsyringe");
const Autherror_1 = require("../../../domain/errors/Autherror");
const Tokens_1 = require("../../../constants/Tokens");
let ChangePassword = class ChangePassword {
    constructor(userRepository, driverRepository, hashService) {
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.hashService = hashService;
    }
    async execute(userId, oldPassword, newPassword, role) {
        let account;
        // Fetch account based on role
        if (role === "user") {
            account = await this.userRepository.getUserById(userId);
        }
        else {
            account = await this.driverRepository.findDriverById(userId);
        }
        if (!account) {
            throw new Autherror_1.AuthError("Account not found.", 404); // 404 Not Found
        }
        const isPasswordValid = await this.hashService.compare(oldPassword, account.password);
        if (!isPasswordValid) {
            throw new Autherror_1.AuthError("Incorrect current password.", 400); // 400 Bad Request
        }
        if (role === "user") {
            await this.userRepository.updateUser(userId, { password: newPassword });
        }
        else {
            await this.driverRepository.update(userId, { password: newPassword });
        }
    }
};
exports.ChangePassword = ChangePassword;
exports.ChangePassword = ChangePassword = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IUSER_REPO)),
    __param(1, (0, tsyringe_1.inject)(Tokens_1.TOKENS.IDRIVER_REPO)),
    __param(2, (0, tsyringe_1.inject)(Tokens_1.TOKENS.HASH_SERVICE)),
    __metadata("design:paramtypes", [Object, Object, Object])
], ChangePassword);
//# sourceMappingURL=ChangePassword.js.map