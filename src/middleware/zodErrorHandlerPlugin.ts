/**
 * ============================================================
 * 🧩 ZOD ERROR HANDLER PLUGIN – GLOBAL ERROR HANDLING
 * ============================================================
 *
 * 📌 Mục tiêu của file này
 * ------------------------------------------------------------
 * Đây là plugin xử lý lỗi TOÀN CỤC cho toàn bộ Fastify app.
 * Mọi lỗi không được catch ở route / service đều sẽ đi qua đây.
 *
 * Plugin này giúp:
 * - Chuẩn hoá format response lỗi (FE luôn nhận cùng 1 shape)
 * - Phân loại rõ từng loại lỗi (validation, business, system)
 * - Log đúng mức độ (warn / error)
 * - Gửi lỗi nghiêm trọng lên Sentry
 *
 *
 * ============================================================
 * 🧠 Vì sao dùng fastify-plugin (fp)?
 * ------------------------------------------------------------
 * - Giúp Fastify biết đây là plugin chính thức
 * - Đảm bảo plugin được load trước routes
 * - Cho phép plugin truy cập shared context
 *
 * ❗ Nếu KHÔNG dùng fastify-plugin:
 * - setErrorHandler có thể bị override
 * - plugin load sai thứ tự
 * - decorator / hook có thể không hoạt động
 *
 *
 * ============================================================
 * 🔁 LUỒNG XỬ LÝ LỖI (RẤT QUAN TRỌNG – PHẢI ĐỌC)
 * ------------------------------------------------------------
 *
 * Khi có lỗi xảy ra trong app:
 *
 *   Route / Hook / Service throw error
 *               │
 *               ▼
 *      fastify.setErrorHandler(...)
 *               │
 *               ▼
 *   Plugin này kiểm tra lỗi THEO THỨ TỰ ƯU TIÊN:
 *
 *   1️⃣ ZodError                → lỗi validate schema (Zod)
 *   2️⃣ error.validation        → lỗi validate AJV (Fastify)
 *   3️⃣ Fastify built-in error  → multipart, payload too large...
 *   4️⃣ AppError (custom)       → lỗi business logic
 *   5️⃣ Unknown error           → lỗi hệ thống → 500
 *
 * ❗ Thứ tự này KHÔNG ĐƯỢC đổi bừa
 * Vì:
 * - ZodError cũng là Error
 * - AppError cũng là Error
 * - Nếu check Error chung trước → mất phân loại
 *
 *
 * ============================================================
 * 📦 CÁC LOẠI LỖI ĐƯỢC XỬ LÝ
 * ============================================================
 */

import fp from 'fastify-plugin';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '@/utils/logger';
import { AppError, ValidationError } from '@/utils/errors';
import * as Sentry from '@sentry/node';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

export const zodErrorHandlerPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.setErrorHandler(
    async (error: any, request: FastifyRequest, reply: FastifyReply) => {
      /**
       * ============================================================
       * 1️⃣ ZOD VALIDATION ERROR
       * ------------------------------------------------------------
       * - Xảy ra khi validate body/query/params bằng Zod
       * - Thường đến từ zodValidate hoặc manual schema.parse()
       *
       * Ví dụ:
       *   userRegisterSchema.parse(request.body)
       *
       * → Ưu tiên xử lý đầu tiên
       * → Trả về HTTP 400
       * → errors được map theo field để FE dễ hiển thị
       * ============================================================
       */
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);

        logger.warn('Zod validation error', {
          url: request.url,
          method: request.method,
          errors: validationError.details,
        });

        return reply.status(400).send({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: Object.fromEntries(
            error.issues.map((issue) => [issue.path.join('.'), issue.message])
          ),
        });
      }

      /**
       * ============================================================
       * 2️⃣ FASTIFY / AJV VALIDATION ERROR
       * ------------------------------------------------------------
       * - Dành cho những chỗ CÒN dùng schema JSON (AJV)
       * - Fastify sẽ gắn lỗi vào error.validation
       *
       * Ví dụ:
       * - missing required property
       * - wrong data type
       *
       * → Gom lỗi theo field
       * → Trả về HTTP 400
       * ============================================================
       */
      if (error.validation) {
        const formattedErrors: Record<string, string[]> = {};

        for (const err of error.validation) {
          const field =
            err.instancePath.substring(1) ||
            err.params?.missingProperty ||
            'general';

          if (!formattedErrors[field]) formattedErrors[field] = [];
          formattedErrors[field].push(err.message ?? 'Invalid');
        }

        logger.warn('AJV validation error', {
          url: request.url,
          errors: formattedErrors,
        });

        return reply.status(400).send({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: formattedErrors,
        });
      }

      /**
       * ============================================================
       * 3️⃣ FASTIFY BUILT-IN CLIENT ERRORS (4xx)
       * ------------------------------------------------------------
       * - Các lỗi Fastify tự throw:
       *   + File upload quá lớn
       *   + Thiếu file
       *   + Payload invalid
       *
       * - Có statusCode < 500
       * - KHÔNG phải lỗi hệ thống
       *
       * → Trả đúng statusCode gốc
       * ============================================================
       */
      if (error.statusCode && error.statusCode < 500 && error.message) {
        logger.warn('Fastify client error', {
          statusCode: error.statusCode,
          message: error.message,
          url: request.url,
        });

        return reply.status(error.statusCode).send({
          success: false,
          message: error.message || 'Bad request',
        });
      }

      /**
       * ============================================================
       * 4️⃣ APP ERROR (CUSTOM BUSINESS ERROR)
       * ------------------------------------------------------------
       * - Do dev chủ động throw
       *
       * Ví dụ:
       *   throw new AppError('Unauthorized', 401)
       *   throw new ValidationError(errors)
       *
       * → Dùng statusCode & message có sẵn
       * → KHÔNG log stack trace (không phải bug)
       * ============================================================
       */
      if (error instanceof AppError) {
        logger.warn('AppError', {
          message: error.message,
          statusCode: error.statusCode,
        });

        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
          ...(error instanceof ValidationError && {
            errors: error.errors,
          }),
        });
      }

      /**
       * ============================================================
       * 5️⃣ UNKNOWN / SYSTEM ERROR (500)
       * ------------------------------------------------------------
       * - Lỗi không lường trước
       * - Bug code
       * - DB crash
       * - Null pointer, undefined access...
       *
       * → Log FULL thông tin
       * → Gửi lên Sentry
       * → Không leak thông tin nội bộ cho client
       * ============================================================
       */
      logger.error('Unexpected server error', {
        error,
        stack: error.stack,
        url: request.url,
        method: request.method,
        body: request.body,
      });

      console.error('🔥 Server Error:', error);

      Sentry.captureException(error, {
        tags: { route: request.url },
        extra: {
          body: request.body,
          query: request.query,
        },
      });

      return reply.status(500).send({
        success: false,
        message: 'Lỗi hệ thống, vui lòng thử lại sau',
      });
    }
  );
});
