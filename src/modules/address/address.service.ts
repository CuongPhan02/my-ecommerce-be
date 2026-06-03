import { AddressRepository } from './address.repository';
import { CreateAddressType, UpdateAddressType } from './address.validation';
import { NotFoundError } from '@/utils/errors';

export class AddressService {
  private repo: AddressRepository;

  constructor(repo: AddressRepository) {
    this.repo = repo;
  }

  async getMyAddresses(userId: string) {
    return this.repo.getAddressesByUserId(userId);
  }

  async createAddress(userId: string, data: CreateAddressType) {
    return this.repo.createAddress(userId, data);
  }

  async updateAddress(id: string, userId: string, data: UpdateAddressType) {
    const address = await this.repo.getAddressById(id, userId);
    if (!address) {
      throw new NotFoundError('Không tìm thấy địa chỉ');
    }
    return this.repo.updateAddress(id, userId, data);
  }

  async deleteAddress(id: string, userId: string) {
    const address = await this.repo.getAddressById(id, userId);
    if (!address) {
      throw new NotFoundError('Không tìm thấy địa chỉ');
    }
    return this.repo.deleteAddress(id, userId);
  }

  async setDefaultAddress(id: string, userId: string) {
    const address = await this.repo.getAddressById(id, userId);
    if (!address) {
      throw new NotFoundError('Không tìm thấy địa chỉ');
    }
    return this.repo.setDefaultAddress(id, userId);
  }
}
