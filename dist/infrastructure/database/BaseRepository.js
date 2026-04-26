"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const ConflictError_1 = require("../../domain/errors/ConflictError");
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        try {
            const createdItem = new this.model(data);
            const result = await createdItem.save();
            return result.toObject();
        }
        catch (error) {
            if (error.code === 11000) {
                throw new ConflictError_1.ConflictError("Resource with this data already exists");
            }
            throw error;
        }
    }
    async findById(id) {
        return this.model.findById(id).lean();
    }
    async findOne(filter) {
        return this.model.findOne(filter).lean();
    }
    async findAll(filter = {}) {
        return this.model.find(filter).lean();
    }
    async update(id, updates) {
        return this.model.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
    }
    async delete(id) {
        const result = await this.model.findByIdAndDelete(id);
        return result !== null;
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=BaseRepository.js.map