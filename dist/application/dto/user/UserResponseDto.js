"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUserResponse = void 0;
/**
 * Mapper: Domain Entity -> Response DTO
 * Filters out sensitive fields like password and googleId
 */
const toUserResponse = (user) => {
    const { password, googleId, ...safeUser } = user;
    return {
        ...safeUser,
        _id: user._id?.toString() || "",
    };
};
exports.toUserResponse = toUserResponse;
//# sourceMappingURL=UserResponseDto.js.map