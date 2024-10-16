import { votingEventContract } from '@community-voting-system/shared'
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager'
import {
  Controller,
  Inject,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'

import to from 'await-to-js'
import { Cache } from 'cache-manager'
import { RequestUser } from 'src/auth/auth.type'
import { JwtGuard } from 'src/auth/guard/jwt.guard'
import { ReqUser } from 'src/common/req-user.decorator'
import { LoggerService } from '../../logger/logger.service'
import {
  VotingEventService,
} from './voting-event.service'

@UseInterceptors(CacheInterceptor)
@Controller()
export class VotingEventController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly votingEventService: VotingEventService,

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

      if (/\/voting-event\/?$/.test(key)) {
        this.cacheManager.del(key)
      }
    }
  }

  // @UseGuards(JwtGuard)
  @TsRestHandler(votingEventContract.create, {
    validateResponses: true,
  })
  async create() {
    return tsRestHandler(votingEventContract.create, async ({
      body: dto,
    }) => {
      const [error, data] = await to(this.votingEventService.create(dto))
      // ignore coverage
      if (error) {
        this.loggerService.error(`建立 VotingEvent 錯誤 :${error}`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: `建立 VotingEvent 錯誤，請稍後再試 ${error}`,
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

  @UseGuards(JwtGuard)
  @TsRestHandler(votingEventContract.vote, {
    validateResponses: true,
  })
  async vote(
    @ReqUser() user: RequestUser,
  ) {
    console.log('user', user)

    return tsRestHandler(votingEventContract.vote, async ({
      params: { id },
      body: dto,
    }) => {
      const [error, data] = await to(this.votingEventService.vote(user.id, id, dto))
      // ignore coverage
      if (error) {
        this.loggerService.error(`投票 VotingEvent 錯誤 :${error}`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: `投票 VotingEvent 錯誤，請稍後再試 ${error}`,
          },
        }
      }

      this.clearCache()

      return {
        status: 200,
        body: data as any,
      }
    })
  }

  @TsRestHandler(votingEventContract.find, {
    validateResponses: true,
  })
  async find() {
    return tsRestHandler(votingEventContract.find, async ({
      query: dto,
    }) => {
      const [error, result] = await to(this.votingEventService.find(dto))
      // ignore coverage
      if (error) {
        this.loggerService.error(`取得所有 VotingEvent 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '取得所有 VotingEvent 錯誤，請稍後再試',
          },
        }
      }

      return {
        status: 200,
        body: result,
      }
    })
  }

  @TsRestHandler(votingEventContract.findOne, {
    validateResponses: true,
  })
  async findOne() {
    return tsRestHandler(votingEventContract.findOne, async ({
      params: { id },
    }) => {
      const [error, document] = await to(this.votingEventService.findOne(id))
      // ignore coverage
      if (error) {
        this.loggerService.error(`取得指定 VotingEvent 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '取得指定 VotingEvent 錯誤，請稍後再試',
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

  @TsRestHandler(votingEventContract.update, {
    validateResponses: true,
  })
  async update() {
    return tsRestHandler(votingEventContract.update, async ({
      params: { id },
      body: dto,
    }) => {
      const oldData = await this.votingEventService.findOne(id)
      if (!oldData) {
        return {
          status: 404,
        }
      }

      const [error, data] = await to(this.votingEventService.update(id, dto))
      // ignore coverage
      if (error) {
        this.loggerService.error(`更新 VotingEvent 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '更新 VotingEvent 錯誤，請稍後再試',
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

  @TsRestHandler(votingEventContract.remove, {
    validateResponses: true,
  })
  async remove() {
    return tsRestHandler(votingEventContract.remove, async ({
      params: { id },
    }) => {
      const oldData = await this.votingEventService.findOne(id)
      if (!oldData) {
        return {
          status: 404,
        }
      }

      const [error, data] = await to(this.votingEventService.remove(id))
      // ignore coverage
      if (error) {
        this.loggerService.error(`刪除 VotingEvent 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '刪除 VotingEvent 錯誤，請稍後再試',
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

  @TsRestHandler(votingEventContract.findLogs, {
    validateResponses: true,
  })
  async findLogs() {
    return tsRestHandler(votingEventContract.findLogs, async ({
      params: { id },
      query: dto,
    }) => {
      const [error, result] = await to(
        this.votingEventService.findLogs(id, dto),
      )
      // ignore coverage
      if (error) {
        this.loggerService.error(`取得 ${id} VotingEvent Log 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '取得 VotingEvent Log 錯誤，請稍後再試',
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
