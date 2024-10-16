import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { PassportModule } from '@nestjs/passport'
import { AccountModule } from './account/account.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { LoggerModule } from './logger/logger.module'
import { CollectionDataModule } from './resource/collection-data/collection-data.module'
import { SingleDataModule } from './resource/single-data/single-data.module'

import { VotingEventModule } from './resource/voting-event/voting-event.module'
import { UserModule } from './user/user.module'
import { UtilsModule } from './utils/utils.module'

@Module({
  imports: [
    UtilsModule,
    PassportModule,
    AuthModule,
    LoggerModule,
    UserModule,
    AccountModule,
    VotingEventModule,
    CacheModule.register({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot({
      maxListeners: 40,
    }),

    SingleDataModule,
    CollectionDataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppMockModule {
  //
}
