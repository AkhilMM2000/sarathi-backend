import { Model, Document, FilterQuery, UpdateQuery } from "mongoose";
import { IBaseRepository } from "../../domain/repositories/IBaseRepository";

export abstract class BaseRepository<T, U extends Document> implements IBaseRepository<T> {
  constructor(protected readonly model: Model<U>) {}

  async create(data: Partial<T>): Promise<T> {
    const createdItem = new this.model(data);
    const result = await createdItem.save();
    return result.toObject() as unknown as T;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).lean() as Promise<T | null>;
  }

  async findOne(filter: FilterQuery<U>): Promise<T | null> {
    return this.model.findOne(filter).lean() as Promise<T | null>;
  }

  async findAll(filter: FilterQuery<U> = {}): Promise<T[]> {
    return this.model.find(filter).lean() as Promise<T[]>;
  }

  async update(id: string, updates: UpdateQuery<U>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean() as Promise<T | null>;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return result !== null;
  }
}
