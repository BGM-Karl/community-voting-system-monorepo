import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { LoggerModule } from '../../logger/logger.module'
import { LogSchema } from '../../schema'
import { UtilsModule } from '../../utils/utils.module'
import { CollectionDataController } from './collection-data.controller'
import { CollectionDataService } from './collection-data.service'
import { CollectionData, CollectionDataSchema } from './schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CollectionData.name, schema: CollectionDataSchema },
      // 直接使用 `${Xxxx.name}Log` 會讓 blueprint 壞掉
      { name: `CollectionDataLog`, schema: LogSchema },
    ]),
    UtilsModule,
    LoggerModule,
  ],
  controllers: [CollectionDataController],
  providers: [CollectionDataService],
  exports: [CollectionDataService],
})
export class CollectionDataModule {
  //
}
