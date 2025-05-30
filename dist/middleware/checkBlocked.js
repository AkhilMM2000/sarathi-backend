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
exports.CheckBlockedUserOrDriver = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
let CheckBlockedUserOrDriver = class CheckBlockedUserOrDriver {
    constructor(userRepository, driverRepository) {
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
    }
    async handle(req, res, next) {
        try {
            const userId = req.user?.id;
            const role = req.user?.role;
            if (!userId || !role) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            let userOrDriver;
            if (role === "user") {
                if (!(0, mongoose_1.isValidObjectId)(userId)) {
                    res.status(400).json({ message: "Invalid user ID format" });
                    return;
                }
                userOrDriver = await this.userRepository.getUserById(userId);
            }
            else if (role === "driver") {
                userOrDriver = await this.driverRepository.findDriverById(userId);
            }
            else {
                res.status(403).json({ message: "Invalid role" });
                return;
            }
            if (!userOrDriver) {
                res.status(401).json({ message: "Account not found" });
                return;
            }
            if (userOrDriver.isBlock) {
                res.status(403).json({ blocked: true, message: "Your account is blocked. Contact support." });
                return;
            }
            next();
        }
        catch (error) {
            console.error("Error checking blocked user/driver:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
};
exports.CheckBlockedUserOrDriver = CheckBlockedUserOrDriver;
exports.CheckBlockedUserOrDriver = CheckBlockedUserOrDriver = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IUserRepository")),
    __param(1, (0, tsyringe_1.inject)("IDriverRepository")),
    __metadata("design:paramtypes", [Object, Object])
], CheckBlockedUserOrDriver);
//# sourceMappingURL=checkBlocked.js.map