import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import compression from 'compression'
import cookieParser from 'cookie-parser'
import { json } from 'express'

import helmet from 'helmet'
import { AppModule } from './app.module'
import { get as getMainConfig } from './configs/main.config'
import { get as getSecretConfig } from './configs/secret.config'
import { UtilsService } from './utils/utils.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  })

  app.use(json({ limit: '50mb' }))

  const configService = app.get(ConfigService)
  const mainConfig = getMainConfig(configService)
  const secretConfig = getSecretConfig(configService)

  const utilsService = app.get(UtilsService)

  if (!utilsService.isDev()) {
    app.use(helmet())
  }

  app.use(compression())
  app.use(cookieParser(secretConfig.jwtAccessSecret))

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  await app.listen(mainConfig.port)
}
bootstrap()
