import { UserRepository } from './user.repository';
import {
  UserQueryType,
  CreateUserType,
  UpdateUserType,
} from './user.validation';
import { NotFoundError, BadRequestError } from '@/utils/errors';
import { hashPassword } from '@/utils/jwt';

export class UserService {
  private repo: UserRepository;

  constructor(repo: UserRepository) {
    this.repo = repo;
  }

  async getAllUsers(query: UserQueryType) {
    const { data, total } = await this.repo.getAllUsers(query);
    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.repo.getUserById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async createUser(data: CreateUserType) {
    // Check if email already exists
    const existingEmail = await this.repo.findUserByEmail(data.email);
    if (existingEmail) {
      throw new BadRequestError('Email is already in use');
    }

    // Check if phone already exists
    if (data.phone) {
      const existingPhone = await this.repo.findUserByPhone(data.phone);
      if (existingPhone) {
        throw new BadRequestError('Phone number is already in use');
      }
    }

    // Hash password (default: Admin@12345)
    const rawPassword = data.password || 'Admin@12345';
    const hashedPassword = await hashPassword(rawPassword);

    return this.repo.createUser({
      ...data,
      password: hashedPassword,
    });
  }

  async updateUser(id: string, data: UpdateUserType) {
    // Check if user exists
    const user = await this.repo.getUserById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check email uniqueness if email is changed
    if (data.email && data.email !== user.email) {
      const existingEmail = await this.repo.findUserByEmail(data.email);
      if (existingEmail) {
        throw new BadRequestError('Email is already in use');
      }
    }

    // Check phone uniqueness if phone is changed
    if (data.phone && data.phone !== user.phone) {
      const existingPhone = await this.repo.findUserByPhone(data.phone);
      if (existingPhone) {
        throw new BadRequestError('Phone number is already in use');
      }
    }

    return this.repo.updateUser(id, data);
  }

  async deleteUser(id: string) {
    const user = await this.repo.getUserById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return this.repo.deleteUser(id);
  }

  async bulkDeleteUsers(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestError('User IDs list cannot be empty');
    }
    return this.repo.bulkDeleteUsers(ids);
  }
}
