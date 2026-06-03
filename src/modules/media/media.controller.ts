import { sendResponseError, sendResponseSuccess } from '@/utils/sendResponse';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { mediaService } from './media.service';
import { MediaRepository } from './media.repository';
import {
  DeleteMediaMultipleInput,
  DeleteMediaSingleInput,
  MediaFolderCreateInput,
  MediaFolderUpdateInput,
  MultiFileData,
} from './media.validation';
import { LIMIT_COMMON_FILE_SIZE } from '@/constants';

export const mediaController = (fastify: FastifyInstance) => {
  const repo = new MediaRepository(fastify.db);
  const service = mediaService(repo);
  return {
    // ============================================================================
    // MEDIA FILE CONTROLLER
    // ============================================================================
    createMediaSingle: async (req: FastifyRequest, reply: FastifyReply) => {
      const file = (req as any).savedFile;

      if (!file) return sendResponseError(400, reply, 'Không có tệp tin nào được tải lên', null);

      try {
        const folderId = ((req.query as any)?.folderId as string) || '';

        const media = await service.createMediaSingle({
          file: file.file,
          fileName: file.originalname.split('.')[0],
          fileType: file.mimetype,
          altText: file.originalname,
          folderId: folderId,
        });

        return sendResponseSuccess(201, reply, 'Tải tệp tin lên thành công', media);
      } catch (error: any) {
        console.error('Error during multiple file upload:', error);
        return sendResponseError(
          500,
          reply,
          error?.message || 'Có lỗi xảy ra trong quá trình xử lý tệp tin',
          null
        );
      }
    },
    createMediaMultiple: async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const parts = req.files({
          limits: {
            fileSize: LIMIT_COMMON_FILE_SIZE,
          },
        });
        const { folderId } = req.query as {
          folderId?: string;
        };

        const medias = await service.createMediaMultiple(parts, folderId);

        return sendResponseSuccess(200, reply, 'Tải các tệp tin lên thành công', medias);
      } catch (error) {
        console.error('Error during multiple file upload:', error);
        return sendResponseError(
          500,
          reply,
          'Có lỗi xảy ra trong quá trình xử lý tệp tin',
          null
        );
      }
    },
    getMedia: async (req: FastifyRequest, reply: FastifyReply) => {
      const {
        folderId,
        page = '1',
        limit = '20',
      } = req.query as {
        folderId?: string;
        page?: string;
        limit?: string;
      };

      const data = await service.getMediaList(
        folderId,
        Number(page),
        Number(limit)
      );

      return sendResponseSuccess(201, reply, 'Lấy danh sách tệp tin thành công', data);
    },
    deleteMediaSingle: async (
      req: FastifyRequest<{ Body?: DeleteMediaSingleInput }>,
      reply: FastifyReply
    ) => {
      const id = req.body?.id;
      if (!id) {
        return sendResponseError(400, reply, 'Thiếu ID tệp tin', null);
      }
      const result = await service.deleteMediaSingle({ id });
      return sendResponseSuccess(
        200,
        reply,
        'Xóa tệp tin thành công',
        result
      );
    },
    deleteMediaMultiple: async (
      req: FastifyRequest<{ Body?: DeleteMediaMultipleInput }>,
      reply: FastifyReply
    ) => {
      const ids = req.body?.ids;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return sendResponseError(400, reply, 'Thiếu danh sách ID tệp tin', null);
      }
      const result = await service.deleteMediaMultiple({ ids });

      return sendResponseSuccess(200, reply, 'Đã xóa tệp tin', result);
    },
    // ============================================================================
    // MEDIA FOLDER CONTROLLER
    // ============================================================================
    createFolderHandler: async (
      req: FastifyRequest<{ Body?: MediaFolderCreateInput }>,
      reply: FastifyReply
    ) => {
      if (!req.body) {
        return sendResponseError(400, reply, 'Thiếu dữ liệu yêu cầu', null);
      }
      const newFolder = await service.createFolder(req.body!);
      return sendResponseSuccess(200, reply, 'Thành công', newFolder);
    },

    getAllFoldersHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      const result = await service.getAllFoldersAsTree();
      return sendResponseSuccess(200, reply, 'Thành công', result);
    },

    updateFolderHandler: async (
      req: FastifyRequest<{ Body?: MediaFolderUpdateInput }>,
      reply: FastifyReply
    ) => {
      if (!req.body) {
        return sendResponseError(400, reply, 'Thiếu dữ liệu yêu cầu', null);
      }
      const updatedFolder = await service.updateFolder(req.body!);
      return sendResponseSuccess(200, reply, 'Thành công', updatedFolder);
    },

    deleteFolderHandler: async (
      req: FastifyRequest<{ Params?: { id: string } }>,
      reply: FastifyReply
    ) => {
      const id = req.params?.id;
      if (!id) {
        return sendResponseError(400, reply, 'Thiếu tham số ID');
      }
      const result = await service.deleteFolder(id);
      return sendResponseSuccess(
        200,
        reply,
        `Xóa ${result.name} thành công`
      );
    },
  };
};
