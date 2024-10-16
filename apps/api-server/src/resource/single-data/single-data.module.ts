import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { LoggerModule } from '../../logger/logger.module'
import { LogSchema } from '../../schema'
import { UtilsModule } from '../../utils/utils.module'
import { SingleData, SingleDataSchema } from './schema'
import { SingleDataController } from './single-data.controller'
import { SingleDataService } from './single-data.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SingleData.name, schema: SingleDataSchema },
      // 直接使用 `${Xxxx.name}Log` 會讓 blueprint 壞掉
      { name: `SingleDataLog`, schema: LogSchema },
    ]),
    UtilsModule,
    LoggerModule,
  ],
  controllers: [SingleDataController],
  providers: [SingleDataService],
  exports: [SingleDataService],
})
export class SingleDataModule {
  //
}
