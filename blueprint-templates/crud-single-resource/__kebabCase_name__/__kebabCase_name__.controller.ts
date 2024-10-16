import {
  Controller,
  Inject,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import to from 'await-to-js'
import { {{camelCase name}}Contract } from '@community-voting-system/shared'
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'

import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { JwtGuard } from '../../auth/guard/jwt.guard'
import { LoggerService } from '../../logger/logger.service'
import { {{pascalCase name}}Service } from './{{kebabCase name}}.service'

@UseInterceptors(CacheInterceptor)
@Controller()
export class {{pascalCase name}}Controller {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly {{camelCase name}}Service: {{pascalCase name}}Service,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {
    //
  }

  /** ignore coverage */
  private async clearCache() {
    const keys = await this.cacheManager.store.keys?.()
    if (!keys || !Array.isArray(keys))
      return

    for (const key of keys) {
      if (typeof key !== 'string')
        return

      if (/\/{{kebabCase name}}\/?$/.test(key)) {
        this.cacheManager.del(key)
      }
    }
  }

  @TsRestHandler({{camelCase name}}Contract.get, {
    validateResponses: true,
  })
  async get() {
    return tsRestHandler({{camelCase name}}Contract.get, async () => {
      const [error, data] = await to(this.{{camelCase name}}Service.get())
      // ignore coverage
      if (error) {
        this.loggerService.error(`取得 {{pascalCase name}} 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '取得 {{pascalCase name}} 錯誤，請稍後再試',
          },
        }
      }

      return {
        status: 200,
        body: data,
      }
    })
  }

  @UseGuards(JwtGuard)
  @TsRestHandler({{camelCase name}}Contract.update, {
    validateResponses: true,
  })
  async update() {
    return tsRestHandler({{camelCase name}}Contract.update, async ({
      body: dto,
    }) => {
      if (!dto) {
        return {
          status: 204,
        }
      }
      const [error, data] = await to(
        this.{{camelCase name}}Service.update(dto),
      )

      // ignore coverage
      if (error) {
        this.loggerService.error(`更新 {{pascalCase name}} 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '更新 {{pascalCase name}} 錯誤，請稍後再試',
          },
        }
      }

      this.clearCache()

      if (!data) {
        const result = await this.{{camelCase name}}Service.get()

        return {
          status: 200,
          body: result,
        }
      }

      return {
        status: 200,
        body: data,
      }
    })
  }

  @TsRestHandler({{camelCase name}}Contract.findLogs, {
    validateResponses: true,
  })
  async findLogs() {
    return tsRestHandler({{camelCase name}}Contract.findLogs, async ({
      query: dto,
    }) => {
      const [error, result] = await to(
        this.{{camelCase name}}Service.findLogs(dto),
      )
      // ignore coverage
      if (error) {
        this.loggerService.error(`取得 {{pascalCase name}} Log 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '取得 {{pascalCase name}} Log 錯誤，請稍後再試',
          },
        }
      }

      return {
        status: 200,
        body: result,
      }
    })
  }
}
