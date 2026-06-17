import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
// import fastifySwaggerUI from '@fastify/swagger-ui';
import registerRoutes from './routes';
import { ENV_CONFIG } from './config/env';
import fastifyCors from '@fastify/cors';
import { zodErrorHandlerPlugin } from './middleware/zodErrorHandlerPlugin';
import * as Sentry from '@sentry/node';
import multipart from '@fastify/multipart';
import databasePlugin from './plugins/database';
import fastifyJwt from '@fastify/jwt';

import fastifyCookie from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyApiReference from '@scalar/fastify-api-reference';

export function buildServer() {
  // Khởi tạo Fastify với ZodTypeProvider
  const server = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
      level: ENV_CONFIG.NODE_ENV === 'development' ? 'debug' : 'info',
    },
    // Trust Proxy if behind Nginx/Cloudflare
    trustProxy: true,
  }).withTypeProvider<ZodTypeProvider>();

  // Security Plugins
  server.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        ...fastifyHelmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': [
          "'self'",
          "'unsafe-inline'",
          'cdn.jsdelivr.net',
          '*.scalar.com',
        ],
        'style-src': [
          "'self'",
          "'unsafe-inline'",
          'cdn.jsdelivr.net',
          'fonts.googleapis.com',
          '*.scalar.com',
        ],
        'font-src': ["'self'", 'fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'cdn.jsdelivr.net', '*.scalar.com'],
        'connect-src': ["'self'", 'cdn.jsdelivr.net', '*.scalar.com'],
      },
    },
  });
  server.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });
  server.register(fastifyCookie, {
    secret: ENV_CONFIG.COOKIE_SECRET, // for cookies signature
    hook: 'onRequest',
  });

  // Register JWT
  server.register(fastifyJwt, {
    secret: ENV_CONFIG.ACCESS_TOKEN_SECRET_SIGNATURE,
    sign: {
      expiresIn: ENV_CONFIG.ACCESS_TOKEN_LIFE,
    },
  });

  Sentry.init({
    dsn: ENV_CONFIG.SENTRY_URL || '',
    integrations: [
      // send console.log, console.warn, and console.error calls as logs to Sentry
      Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
    ],
    // Enable logs to be sent to Sentry
    enableLogs: true,
  });

  // ==== CORS ====  //

  const allowedOrigins = [
    ENV_CONFIG.CLIENT_ORIGIN,
    ENV_CONFIG.CLIENT_URL,
    'https://ecommerce-fashion-fe.vercel.app',
    'http://localhost:3000',
    /\.vercel\.app$/, // Cho phép tất cả các domain Vercel (bao gồm preview)
  ].filter(Boolean);

  server.register(fastifyCors, {
    origin: ENV_CONFIG.IS_DEVELOPMENT ? true : allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  });

  server.register(databasePlugin);

  // Thêm validator và serializer của Zod
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  // ======================================================
  // Đăng ký Multipart LÊN TRƯỚC để Fastify hiểu content type này
  server.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });

  // Đăng ký Swagger
  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Ecommerce fashion doc api',
        description: 'API documentation for the ecommerce website',
        version: '1.0.0',
      },

      servers: [{ url: ENV_CONFIG.BASE_URL }, { url: ENV_CONFIG.SERVER_URL }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  // Diagnostic log for Scalar API Key
  if (ENV_CONFIG.SCALAR_API_KEY) {
    server.log.info(
      `Scalar API Key loaded. Length: ${ENV_CONFIG.SCALAR_API_KEY.length}, Starts with: ${ENV_CONFIG.SCALAR_API_KEY.substring(0, 10)}...`
    );
  } else {
    server.log.warn('Scalar API Key NOT found in configuration.');
  }

  // sử dụng_scalar để hiển thị tài liệu , đây là cách mới ui mới đẹp hơn, hiện tại đang dùng
  server.register(fastifyApiReference, {
    routePrefix: '/docs',
    configuration: {
      spec: {
        content: () => server.swagger(),
      },
      // You can also add more Scalar options here
      theme: 'Kepler-11e',
      // url: 'https://registry.scalar.com/phong_phan/apis/ecommerce-app-project-phong-phan/latest?format=json',
      // agent: ENV_CONFIG.SCALAR_API_KEY
      //   ? { key: ENV_CONFIG.SCALAR_API_KEY }
      //   : undefined,
    },
  });

  //  Đăng ký Swagger UI để hiển thị tài liệu , đây là cách cũ ui cũ
  // server.register(fastifySwaggerUI, {
  //   routePrefix: '/docs',

  //   uiConfig: {
  //     docExpansion: 'list',
  //     deepLinking: false,
  //   },
  //   theme: {
  //     css: [
  //       {
  //         filename: 'theme.css',
  //         content: '.swagger-ui .topbar { background-color: #129c08ff; }',
  //       },
  //     ],
  //     js: [
  //       {
  //         filename: 'custom.js',
  //         content: 'console.log("Swagger UI loaded!");',
  //       },
  //     ],
  //   },
  // });

  //  Đăng ký plugin xử lý lỗi
  // Nó nên được đăng ký trước các route
  server.register(zodErrorHandlerPlugin);
  // Sentry.setupFastifyErrorHandler(server);

  // Đăng ký routes như bình thường
  registerRoutes(server);

  // ======= RENDER API DEFAULT ======= //
  server.get('/', async (request, reply) => {
    return reply.send({
      success: true,
      message: [
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '  🚀🚀  WELCOME TO API - ECOMMERCE PROJECT  🚀🚀',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '✅ Status: API is running successfully!',
        `🕒 Timestamp: ${new Date().toISOString()}`,
        '',
        '📌 Version : v1.0.0',
        `📌 Base URL: ${ENV_CONFIG.SERVER_URL}`,
        `📌 Docs     : ${ENV_CONFIG.SERVER_URL}/docs`,
        '📌 Author  : Your Name',
        '📌 Repo    : https://github.com/your-repo/ecommerce-api',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      ],
      timestamp: new Date().toISOString(),
    });
  });

  return server;
}
