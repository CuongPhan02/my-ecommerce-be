import {
  CreateShippingInput,
  UpdateShippingInput,
} from './shipping.validate';
import { ShippingRepository } from './shipping.repository';
import { NotFoundError } from '@/utils/errors';

export class ShippingService {
  private repo: ShippingRepository;
  constructor(repo: ShippingRepository) {
    this.repo = repo;
  }

  async getAllMethods() {
    return this.repo.getAllMethods();
  }

  async getActiveMethods() {
    return this.repo.getActiveMethods();
  }

  async getMethodById(id: string) {
    const method = await this.repo.getMethodById(id);
    if (!method) throw new NotFoundError('Shipping method not found');
    return method;
  }

  async createMethod(data: CreateShippingInput) {
    return this.repo.createMethod(data);
  }

  async updateMethod(id: string, data: UpdateShippingInput) {
    await this.getMethodById(id);
    return this.repo.updateMethod(id, data);
  }

  async deleteMethod(id: string) {
    await this.getMethodById(id);
    return this.repo.deleteMethod(id);
  }
}
