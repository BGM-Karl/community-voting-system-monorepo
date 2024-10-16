import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UtilsModule } from '../../utils/utils.module'
import { LoggerModule } from '../../logger/logger.module'
import { LogSchema } from '../../schema'
import { {{pascalCase name}}, {{pascalCase name}}Schema } from './schema'
import { {{pascalCase name}}Controller } from './{{kebabCase name}}.controller'
import { {{pascalCase name}}Service } from './{{kebabCase name}}.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: {{pascalCase name}}.name, schema: {{pascalCase name}}Schema },
      // 直接使用 `${Xxxx.name}Log` 會讓 blueprint 壞掉
      { name: `{{pascalCase name}}Log`, schema: LogSchema },
    ]),
    UtilsModule,
    LoggerModule,
  ],
  controllers: [{{pascalCase name}}Controller],
  providers: [{{pascalCase name}}Service],
  exports: [{{pascalCase name}}Service],
})
export class {{pascalCase name}}Module {
  //
}
