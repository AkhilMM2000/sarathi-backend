"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralCodeService = void 0;
const tsyringe_1 = require("tsyringe");
let ReferralCodeService = class ReferralCodeService {
    generate(refId) {
        const objectIdPart = refId?.substring(0, 8) ?? this.generateObjectIdPrefix();
        const base36Id = parseInt(objectIdPart, 16).toString(36).toUpperCase();
        return `SRT-${base36Id}`;
    }
    generateObjectIdPrefix() {
        const random = Math.floor(Math.random() * 0xffffffff);
        return random.toString(16).padStart(8, "0");
    }
};
exports.ReferralCodeService = ReferralCodeService;
exports.ReferralCodeService = ReferralCodeService = __decorate([
    (0, tsyringe_1.injectable)()
], ReferralCodeService);
//# sourceMappingURL=ReferralCodeService.js.map