import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { COOKIE_NAME } from '@/constants';
import {
  GoogleLoginInput,
  LoginInput,
  RegisterInput,
  VerifyEmailInput,
  ResendVerifyEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from './auth.validation';
import { sendResponseSuccess } from '@/utils/sendResponse';
import { AuthRepository } from './auth.repository';
import ms from 'ms';
import { ENV_CONFIG } from '@/config/env';
import { BadRequestError } from '@/utils/errors';

export const authController = (fastify: FastifyInstance) => {
  const repo = new AuthRepository(fastify.db);
  const service = new AuthService(repo);
  return {
    registerHandler: async (
      req: FastifyRequest<{
        Body?: RegisterInput;
      }>,
      reply: FastifyReply
    ) => {
      const result = await service.register(req.body!);
      return sendResponseSuccess(200, reply, 'Đăng ký tài khoản thành công', result);
    },

    loginHandler: async (
      req: FastifyRequest<{
        Body?: LoginInput;
      }>,
      reply: FastifyReply
    ) => {
      const userAgent = req.headers['user-agent'];
      const ip = req.ip;

      const result = await service.login(req.server, req.body!, userAgent, ip);

      const maxAge = ms(ENV_CONFIG.REFRESH_TOKEN_LIFE);

      reply.setCookie(COOKIE_NAME, result.refreshToken, {
        path: '/',
        httpOnly: true,
        sameSite: ENV_CONFIG.IS_PRODUCTION ? 'none' : 'lax', // Prod khác domain thì dùng 'none', Dev cùng localhost dùng 'lax'
        secure: ENV_CONFIG.IS_PRODUCTION, // Prod bắt buộc true, Dev thì false
        maxAge: maxAge / 1000,
      });

      // Remove refreshToken from body response if not mobile
      // if (!req.body?.isMobile) {
      //   const { refreshToken, ...response } = result;
      //   return sendResponseSuccess(200, reply, 'Đăng nhập thành công', response);
      // }

      return sendResponseSuccess(200, reply, 'Đăng nhập thành công', result);
    },

    googleLoginHandler: async (
      req: FastifyRequest<{
        Body?: GoogleLoginInput;
      }>,
      reply: FastifyReply
    ) => {
      const userAgent = req.headers['user-agent'];
      const ip = req.ip;

      const result = await service.googleLogin(
        req.server,
        req.body!.code,
        userAgent,
        ip
      );

      const maxAge = ms(ENV_CONFIG.REFRESH_TOKEN_LIFE);

      reply.setCookie(COOKIE_NAME, result.refreshToken, {
        path: '/',
        httpOnly: true,
        sameSite: ENV_CONFIG.IS_PRODUCTION ? 'none' : 'lax',
        secure: ENV_CONFIG.IS_PRODUCTION,
        maxAge: maxAge / 1000,
      });

      if (!req.body?.isMobile) {
        const { refreshToken, ...response } = result;
        return sendResponseSuccess(
          200,
          reply,
          'Đăng nhập Google thành công',
          response
        );
      }

      return sendResponseSuccess(200, reply, 'Đăng nhập Google thành công', result);
    },

    logOutHandler: async (
      req: FastifyRequest<{
        Body?: { refreshToken?: string };
      }>,
      reply: FastifyReply
    ) => {
      const refreshToken =
        req.body?.refreshToken || (req.cookies[COOKIE_NAME] as string);

      if (!refreshToken) {
        reply.clearCookie(COOKIE_NAME, { path: '/' });
        return sendResponseSuccess(200, reply, 'Đã đăng xuất (không có token)', { message: 'Đã đăng xuất' });
      }

      const result = await service.logout(refreshToken);
      reply.clearCookie(COOKIE_NAME, { path: '/' });
      return sendResponseSuccess(200, reply, 'Đăng xuất thành công', result);
    },

    refreshTokenHandler: async (
      req: FastifyRequest<{
        Body?: { refreshToken?: string };
      }>,
      reply: FastifyReply
    ) => {
      const userAgent = req.headers['user-agent'];
      const ip = req.ip;

      const refreshToken =
        req.body?.refreshToken || (req.cookies[COOKIE_NAME] as string);

      if (!refreshToken) {
        throw new BadRequestError('Thiếu refresh token');
      }

      const result = await service.refresh(
        req.server,
        refreshToken,
        userAgent,
        ip
      );

      const maxAge = ms(ENV_CONFIG.REFRESH_TOKEN_LIFE);

      reply.setCookie(COOKIE_NAME, result.refreshToken, {
        path: '/',
        httpOnly: true,
        sameSite: ENV_CONFIG.IS_PRODUCTION ? 'none' : 'lax', // Prod khác domain thì dùng 'none', Dev cùng localhost dùng 'lax'
        secure: ENV_CONFIG.IS_PRODUCTION, // Prod bắt buộc true, Dev thì false
        maxAge: maxAge / 1000,
      });

      return sendResponseSuccess(200, reply, 'Làm mới token thành công', {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    },

    getMeHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      const user = req.user as { id: string };
      const result = await service.getProfile(user.id);
      return sendResponseSuccess(200, reply, 'Lấy thông tin cá nhân thành công', result);
    },
    verifyEmailHandler: async (
      req: FastifyRequest<{ Body?: VerifyEmailInput }>,
      reply: FastifyReply
    ) => {
      if (!req.body?.email || !req.body?.token) {
        throw new BadRequestError('Thiếu email hoặc token');
      }
      const result = await service.verifyEmail(req.body.email, req.body.token);
      return sendResponseSuccess(200, reply, 'Xác thực email thành công', result);
    },

    resendVerifyEmailHandler: async (
      req: FastifyRequest<{ Body?: ResendVerifyEmailInput }>,
      reply: FastifyReply
    ) => {
      const result = await service.resendVerificationEmail(
        req.body!.email,
        req.body!.urlRedirect
      );
      return sendResponseSuccess(
        200,
        reply,
        'Gửi lại email xác thực thành công',
        result
      );
    },
    forgotPasswordHandler: async (
      req: FastifyRequest<{ Body?: ForgotPasswordInput }>,
      reply: FastifyReply
    ) => {
      const result = await service.forgotPassword(
        req.body!.email,
        req.body!.urlRedirect
      );
      return sendResponseSuccess(200, reply, 'Yêu cầu đặt lại mật khẩu đã được gửi', result);
    },
    resetPasswordHandler: async (
      req: FastifyRequest<{ Body?: ResetPasswordInput }>,
      reply: FastifyReply
    ) => {
      const result = await service.resetPassword(
        req.body!.email,
        req.body!.token,
        req.body!.password
      );
      return sendResponseSuccess(200, reply, 'Đặt lại mật khẩu thành công', result);
    },

    updateProfileHandler: async (
      req: FastifyRequest<{ Body?: UpdateProfileInput }>,
      reply: FastifyReply
    ) => {
      const user = req.user as { id: string };
      const result = await service.updateProfile(user.id, req.body!);
      return sendResponseSuccess(200, reply, 'Cập nhật thông tin thành công', result);
    },

    changePasswordHandler: async (
      req: FastifyRequest<{ Body?: ChangePasswordInput }>,
      reply: FastifyReply
    ) => {
      const user = req.user as { id: string };
      const result = await service.changePassword(user.id, req.body!);
      return sendResponseSuccess(200, reply, 'Đổi mật khẩu thành công', result);
    },
  };
};
