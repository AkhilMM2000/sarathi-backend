"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        const createdItem = new this.model(data);
        const result = await createdItem.save();
        return result.toObject();
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