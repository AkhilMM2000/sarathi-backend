"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodHelper = void 0;
class ZodHelper {
    /**
     * Modern, type-safe wrapper for schema validation
     * @param schema The ZodType schema to validate against
     * @param data The unknown data to validate (usually req.body)
     * @returns Validated data of type T
     * @throws ZodError if validation fails
     */
    static validate(schema, data) {
        const result = schema.safeParse(data);
        if (!result.success) {
            // Throwing the Zod error directly; controller will handle the res.status(400)
            throw result.error;
        }
        return result.data;
    }
}
exports.ZodHelper = ZodHelper;
//# sourceMappingURL=ZodHelper.js.map