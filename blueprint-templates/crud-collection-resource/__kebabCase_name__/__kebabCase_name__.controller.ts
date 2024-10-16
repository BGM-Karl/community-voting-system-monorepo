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
import { LoggerService } from '../../logger/logger.service'
import { JwtGuard } from '../../auth/guard/jwt.guard'
import {
  {{pascalCase name}}Service,
} from './{{kebabCase name}}.service'

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

  @UseGuards(JwtGuard)
  @TsRestHandler({{camelCase name}}Contract.create, {
    validateResponses: true,
  })
  async create() {
    return tsRestHandler({{camelCase name}}Contract.create, async ({
      body: dto,
    }) => {
      const [error, data] = await to(this.{{camelCase name}}Service.create(dto))
      // ignore coverage
      if (error) {
        this.loggerService.error(`建立 {{pascalCase name}} 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '建立 {{pascalCase name}} 錯誤，請稍後再試',
          },
        }
      }

      this.clearCache()

      return {
        status: 201,
        body: data,
      }
    })
  }

  @TsRestHandler({{camelCase name}}Contract.find, {
    validateResponses: true,
  })
  async find() {
    return tsRestHandler({{camelCase name}}Contract.find, async ({
      query: dto,
    }) => {
      const [error, result] = await to(this.{{camelCase name}}Service.find(dto))
      // ignore coverage
      if (error) {
        this.loggerService.error(`取得所有 {{pascalCase name}} 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '取得所有 {{pascalCase name}} 錯誤，請稍後再試',
          },
        }
      }

      return {
        status: 200,
        body: result,
      }
    })
  }

  @TsRestHandler({{camelCase name}}Contract.findOne, {
    validateResponses: true,
  })
  async findOne() {
    return tsRestHandler({{camelCase name}}Contract.findOne, async ({
      params: { id },
    }) => {
      const [error, document] = await to(this.{{camelCase name}}Service.findOne(id))
      // ignore coverage
      if (error) {
        this.loggerService.error(`取得指定 {{pascalCase name}} 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '取得指定 {{pascalCase name}} 錯誤，請稍後再試',
          },
        }
      }

      if (!document) {
        return {
          status: 404,
        }
      }

      return {
        status: 200,
        body: document,
      }
    })
  }

  @TsRestHandler({{camelCase name}}Contract.update, {
    validateResponses: true,
  })
  async update() {
    return tsRestHandler({{camelCase name}}Contract.update, async ({
      params: { id },
      body: dto,
    }) => {
      const oldData = await this.{{camelCase name}}Service.findOne(id)
      if (!oldData) {
        return {
          status: 404,
        }
      }

      const [error, data] = await to(this.{{camelCase name}}Service.update(id, dto))
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
      if (!data) {
        return {
          status: 404,
        }
      }

      this.clearCache()

      return {
        status: 200,
        body: data,
      }
    })
  }

  @TsRestHandler({{camelCase name}}Contract.remove, {
    validateResponses: true,
  })
  async remove() {
    return tsRestHandler({{camelCase name}}Contract.remove, async ({
      params: { id },
    }) => {
      const oldData = await this.{{camelCase name}}Service.findOne(id)
      if (!oldData) {
        return {
          status: 404,
        }
      }

      const [error, data] = await to(this.{{camelCase name}}Service.remove(id))
      // ignore coverage
      if (error) {
        this.loggerService.error(`刪除 {{pascalCase name}} 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '刪除 {{pascalCase name}} 錯誤，請稍後再試',
          },
        }
      }
      if (!data) {
        return {
          status: 404,
        }
      }

      this.clearCache()

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
      params: { id },
      query: dto,
    }) => {
      const [error, result] = await to(
        this.{{camelCase name}}Service.findLogs(id, dto),
      )
      // ignore coverage
      if (error) {
        this.loggerService.error(`取得 ${id} {{pascalCase name}} Log 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '取得 {{pascalCase name}} Log 錯誤，請稍後再試',
          },
        }
      }
      if (!result) {
        return {
          status: 404,
        }
      }

      return {
        status: 200,
        body: result,
      }
    })
  }
}
