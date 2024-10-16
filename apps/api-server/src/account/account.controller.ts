import { accountContract } from '@community-voting-system/shared'
import {
  Controller,
  HttpException,
  HttpStatus,
} from '@nestjs/common'

import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'
import to from 'await-to-js'

import { RequestUser } from '../auth/auth.type'
import { ReqUser } from '../common/req-user.decorator'
import { LoggerService } from '../logger/logger.service'
import { AccountService, CreateError } from './account.service'

// @UseGuards(JwtGuard)
@Controller()
export class AccountController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly accountService: AccountService,
  ) {
    //
  }

  @TsRestHandler(accountContract.create)
  async create(
    @ReqUser() user: RequestUser,
  ) {
    return tsRestHandler(accountContract.create, async ({ body: dto }) => {
      // if (user.role !== 'admin') {
      //   throw new HttpException(
      //     '無權限',
      //     HttpStatus.FORBIDDEN,
      //   )
      // }

      const [createError, result] = await to(this.accountService.create(dto))
      if (createError?.message === CreateError.USERNAME_DUPLICATE) {
        throw new HttpException(
          'username 已存在，請嘗試其他組合',
          HttpStatus.BAD_REQUEST,
        )
      }

      if (createError?.message === CreateError.ACCOUNT_EXISTED) {
        throw new HttpException('帳號已經存在', HttpStatus.BAD_REQUEST)
      }

      if (createError) {
        this.loggerService.error(`建立帳號發生錯誤 :`)
        this.loggerService.error(createError)

        throw new HttpException(
          '建立帳號發生錯誤，請稍後再試',
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }

      return {
        status: 201,
        body: {
          data: result,
        },
      }
    })
  }

  @TsRestHandler(accountContract.find)
  async find() {
    return tsRestHandler(accountContract.find, async ({ query: dto }) => {
      const [totalError, total] = await to(this.accountService.getTotalNumber())
      if (totalError) {
        this.loggerService.error(`取得 account 總數錯誤 : ${totalError}`)

        throw new HttpException(
          '取得資料發生錯誤，請稍後再試',
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }

      const { skip = 0, limit = 30 } = dto

      const [findError, result] = await to(
        this.accountService.find({ skip, limit }),
      )
      if (findError) {
        this.loggerService.error(`accountService.find() 錯誤 : ${findError}`)

        throw new HttpException(
          '取得資料發生錯誤，請稍後再試',
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }

      return {
        status: 200,
        body: {
          total,
          skip,
          limit,
          data: result.map((item) => item.toJSON()),
        },
      }
    })
  }

  @TsRestHandler(accountContract.findOne)
  async findOne() {
    return tsRestHandler(accountContract.findOne, async ({ params }) => {
      const { id } = params

      const [error, result] = await to(this.accountService.findById(id))
      if (error) {
        this.loggerService.error(`查詢帳號 ID ${id} 錯誤 : ${error}`)

        throw new HttpException(
          '取得資料發生錯誤，請稍後再試',
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
      if (!result) {
        return { status: 404, body: {} }
      }

      return {
        status: 200,
        body: result.toJSON(),
      }
    })
  }

  @TsRestHandler(accountContract.update)
  async update(
    // @ReqUser() user: RequestUser,
  ) {
    return tsRestHandler(accountContract.update, async ({ body: dto, params }) => {
      const { id } = params

      // 不是 admin，也不是自己的帳號
      // if (user.role !== 'admin' && id !== user.id) {
      //   throw new HttpException(
      //     '無權限',
      //     HttpStatus.FORBIDDEN,
      //   )
      // }

      const [error, result] = await to(
        this.accountService.update(id, dto),
      )
      if (error) {
        this.loggerService.error(`更新資料 ${id} 錯誤 : ${error}`)

        throw new HttpException(
          '更新資料發生錯誤，請稍後再試',
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
      if (!result) {
        return { status: 404, body: {} }
      }

      return {
        status: 200,
        body: result.toJSON(),
      }
    })
  }

  @TsRestHandler(accountContract.remove)
  async remove(
    @ReqUser() user: RequestUser,
  ) {
    return tsRestHandler(accountContract.remove, async ({ params }) => {
      const { id } = params

      // 不是 admin，也不是自己的帳號
      // if (user.role !== 'admin' && id !== user.id) {
      //   throw new HttpException(
      //     '無權限',
      //     HttpStatus.FORBIDDEN,
      //   )
      // }

      const [error, result] = await to(this.accountService.remove(id))
      if (error) {
        this.loggerService.error(`刪除帳號 ID ${id} 錯誤 : ${error}`)

        throw new HttpException(
          '刪除資料發生錯誤，請稍後再試',
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
      if (!result) {
        return { status: 404, body: {} }
      }

      return { status: 200, body: {} }
    })
  }
}
