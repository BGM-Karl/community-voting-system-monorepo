import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { Account, AccountSchema } from './schema';
import { UtilsModule } from '../utils/utils.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    LoggerModule,
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    UtilsModule,
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {
  //
}
