import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AccountModule } from 'src/account/account.module'
import { LoggerModule } from '../../logger/logger.module'
import { LogSchema } from '../../schema'
import { UtilsModule } from '../../utils/utils.module'
import { VotingEvent, VotingEventSchema } from './schema'
import { VotingEventController } from './voting-event.controller'
import { VotingEventService } from './voting-event.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VotingEvent.name, schema: VotingEventSchema },
      // 直接使用 `${Xxxx.name}Log` 會讓 blueprint 壞掉
      { name: `VotingEventLog`, schema: LogSchema },
    ]),
    UtilsModule,
    LoggerModule,
    AccountModule,
  ],
  controllers: [VotingEventController],
  providers: [VotingEventService],
  exports: [VotingEventService],
})
export class VotingEventModule {
  //
}
