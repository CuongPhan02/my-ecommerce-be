import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { sendResponseSuccess } from '@/utils/sendResponse';
import {
  UserQueryType,
  CreateUserType,
  UpdateUserType,
  BulkDeleteType,
} from './user.validation';

export const userController = (fastify: FastifyInstance) => {
  const repo = new UserRepository(fastify.db);
  const service = new UserService(repo);

  return {
    getAllUsersHandler: async (
      request: FastifyRequest<{ Querystring: UserQueryType }>,
      reply: FastifyReply
    ) => {
      const query = request.query;
      const result = await service.getAllUsers(query);
      return sendResponseSuccess(200, reply, 'Users fetched successfully', result);
    },

    getUserByIdHandler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const result = await service.getUserById(id);
      return sendResponseSuccess(200, reply, 'User details fetched successfully', result);
    },

    createUserHandler: async (
      request: FastifyRequest<{ Body: CreateUserType }>,
      reply: FastifyReply
    ) => {
      const data = request.body;
      const result = await service.createUser(data);
      return sendResponseSuccess(201, reply, 'User created successfully', result);
    },

    updateUserHandler: async (
      request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserType }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const data = request.body;
      const result = await service.updateUser(id, data);
      return sendResponseSuccess(200, reply, 'User updated successfully', result);
    },

    deleteUserHandler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const result = await service.deleteUser(id);
      return sendResponseSuccess(200, reply, 'User deleted successfully', result);
    },

    bulkDeleteUsersHandler: async (
      request: FastifyRequest<{ Body: BulkDeleteType }>,
      reply: FastifyReply
    ) => {
      const { ids } = request.body;
      const result = await service.bulkDeleteUsers(ids);
      return sendResponseSuccess(200, reply, 'Users deleted successfully', result);
    },
  };
};
