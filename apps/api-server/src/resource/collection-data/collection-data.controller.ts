import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager'
import {
  Controller,
  Inject,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { collectionDataContract } from '@community-voting-system/shared'
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'

import to from 'await-to-js'
import { Cache } from 'cache-manager'
import { JwtGuard } from '../../auth/guard/jwt.guard'
import { LoggerService } from '../../logger/logger.service'
import {
  CollectionDataService,
} from './collection-data.service'

@UseInterceptors(CacheInterceptor)
@Controller()
export class CollectionDataController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly collectionDataService: CollectionDataService,

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

      if (/\/collection-data\/?$/.test(key)) {
        this.cacheManager.del(key)
      }
    }
  }

  @UseGuards(JwtGuard)
  @TsRestHandler(collectionDataContract.create, {
    validateResponses: true,
  })
  async create() {
    return tsRestHandler(collectionDataContract.create, async ({
      body: dto,
    }) => {
      const [error, data] = await to(this.collectionDataService.create(dto))
      // ignore coverage
      if (error) {
        this.loggerService.error(`建立 CollectionData 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '建立 CollectionData 錯誤，請稍後再試',
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

  @TsRestHandler(collectionDataContract.find, {
    validateResponses: true,
  })
  async find() {
    return tsRestHandler(collectionDataContract.find, async ({
      query: dto,
    }) => {
      const [error, result] = await to(this.collectionDataService.find(dto))
      // ignore coverage
      if (error) {
        this.loggerService.error(`取得所有 CollectionData 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '取得所有 CollectionData 錯誤，請稍後再試',
          },
        }
      }

      return {
        status: 200,
        body: result,
      }
    })
  }

  @TsRestHandler(collectionDataContract.findOne, {
    validateResponses: true,
  })
  async findOne() {
    return tsRestHandler(collectionDataContract.findOne, async ({
      params: { id },
    }) => {
      const [error, document] = await to(this.collectionDataService.findOne(id))
      // ignore coverage
      if (error) {
        this.loggerService.error(`取得指定 CollectionData 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '取得指定 CollectionData 錯誤，請稍後再試',
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

  @TsRestHandler(collectionDataContract.update, {
    validateResponses: true,
  })
  async update() {
    return tsRestHandler(collectionDataContract.update, async ({
      params: { id },
      body: dto,
    }) => {
      const oldData = await this.collectionDataService.findOne(id)
      if (!oldData) {
        return {
          status: 404,
        }
      }

      const [error, data] = await to(this.collectionDataService.update(id, dto))
      // ignore coverage
      if (error) {
        this.loggerService.error(`更新 CollectionData 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '更新 CollectionData 錯誤，請稍後再試',
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

  @TsRestHandler(collectionDataContract.remove, {
    validateResponses: true,
  })
  async remove() {
    return tsRestHandler(collectionDataContract.remove, async ({
      params: { id },
    }) => {
      const oldData = await this.collectionDataService.findOne(id)
      if (!oldData) {
        return {
          status: 404,
        }
      }

      const [error, data] = await to(this.collectionDataService.remove(id))
      // ignore coverage
      if (error) {
        this.loggerService.error(`刪除 CollectionData 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '刪除 CollectionData 錯誤，請稍後再試',
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

  @TsRestHandler(collectionDataContract.findLogs, {
    validateResponses: true,
  })
  async findLogs() {
    return tsRestHandler(collectionDataContract.findLogs, async ({
      params: { id },
      query: dto,
    }) => {
      const [error, result] = await to(
        this.collectionDataService.findLogs(id, dto),
      )
      // ignore coverage
      if (error) {
        this.loggerService.error(`取得 ${id} CollectionData Log 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '取得 CollectionData Log 錯誤，請稍後再試',
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
