import awsLambdaFastify from '@fastify/aws-lambda';
import { buildServer } from './app';

// Khởi tạo Fastify server
const server = buildServer();

// Tạo proxy handler tương thích với signature của AWS Lambda (API Gateway/ALB events)
export const handler = awsLambdaFastify(server);
