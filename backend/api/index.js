require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const { AppModule } = require('./dist/src/app.module.js');

let cachedApp = null;

async function createApp() {
  if (cachedApp) return cachedApp;

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter, {
    logger: ['error', 'warn'],
  });

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === process.env.FRONTEND_URL ||
        /^https:\/\/lead-tracker-frontend[\w-]*\.vercel\.app$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  cachedApp = expressApp;
  return cachedApp;
}

module.exports = async function handler(req, res) {
  const app = await createApp();
  app(req, res);
};
