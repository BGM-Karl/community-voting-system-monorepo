import { join } from 'node:path'
import process from 'node:process'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'

import { ConfigModule, ConfigService } from '@nestjs/config'
import { DevtoolsModule } from '@nestjs/devtools-integration'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'
import { PassportModule } from '@nestjs/passport'
import { ServeStaticModule } from '@nestjs/serve-static'
import { AccountModule } from './account/account.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'

import { AuthModule } from './auth/auth.module'
import dbConfig, { get as getDbConfig } from './configs/db.config'
import mainConfig from './configs/main.config'
import secretConfig from './configs/secret.config'
import storageConfig from './configs/storage.config'

import { LoggerModule } from './logger/logger.module'
import { VotingEventModule } from './resource/voting-event/voting-event.module'
import { UserModule } from './user/user.module'
import { UtilsModule } from './utils/utils.module'

const envMode = process.env.STAGE_ENV ?? process.env.NODE_ENV ?? 'development'

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../', 'client'),
      exclude: ['/api*'],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mainConfig, dbConfig, secretConfig, storageConfig],
      envFilePath: [`env/.env.${envMode}`, 'env/.env'],
      cache: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { mongoDbUri: uri } = getDbConfig(configService)

        return {
          uri,
        }
      },
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot({
      maxListeners: 40,
    }),
    LoggerModule,
    PassportModule,

    UtilsModule,
    AuthModule,
    UserModule,
    AccountModule,
    VotingEventModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule {
  //
}
