import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager'
import {
  Controller,
  Inject,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { singleDataContract } from '@community-voting-system/shared'
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'

import to from 'await-to-js'
import { Cache } from 'cache-manager'
import { JwtGuard } from '../../auth/guard/jwt.guard'
import { LoggerService } from '../../logger/logger.service'
import { SingleDataService } from './single-data.service'

@UseInterceptors(CacheInterceptor)
@Controller()
export class SingleDataController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly singleDataService: SingleDataService,

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

      if (/\/single-data\/?$/.test(key)) {
        this.cacheManager.del(key)
      }
    }
  }

  @TsRestHandler(singleDataContract.get, {
    validateResponses: true,
  })
  async get() {
    return tsRestHandler(singleDataContract.get, async () => {
      const [error, data] = await to(this.singleDataService.get())
      // ignore coverage
      if (error) {
        this.loggerService.error(`取得 SingleData 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '取得 SingleData 錯誤，請稍後再試',
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
  @TsRestHandler(singleDataContract.update, {
    validateResponses: true,
  })
  async update() {
    return tsRestHandler(singleDataContract.update, async ({
      body: dto,
    }) => {
      if (!dto) {
        return {
          status: 204,
        }
      }
      const [error, data] = await to(
        this.singleDataService.update(dto),
      )

      // ignore coverage
      if (error) {
        this.loggerService.error(`更新 SingleData 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '更新 SingleData 錯誤，請稍後再試',
          },
        }
      }

      this.clearCache()

      if (!data) {
        const result = await this.singleDataService.get()

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

  @TsRestHandler(singleDataContract.findLogs, {
    validateResponses: true,
  })
  async findLogs() {
    return tsRestHandler(singleDataContract.findLogs, async ({
      query: dto,
    }) => {
      const [error, result] = await to(
        this.singleDataService.findLogs(dto),
      )
      // ignore coverage
      if (error) {
        this.loggerService.error(`取得 SingleData Log 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '取得 SingleData Log 錯誤，請稍後再試',
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
