import {
  Controller,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import { userContract } from '@community-voting-system/shared'

import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'
import to from 'await-to-js'
import { RequestUser } from '../auth/auth.type'
import { JwtGuard } from '../auth/guard/jwt.guard'
import { ReqUser } from '../common/req-user.decorator'
import { LoggerService } from '../logger/logger.service'
import { UserService } from './user.service'

@Controller()
export class UserController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly userService: UserService,
  ) {
    //
  }

  @UseGuards(JwtGuard)
  @TsRestHandler(userContract.getSelf, {
    validateResponses: true,
  })
  async getSelf(@ReqUser() { id }: RequestUser) {
    return tsRestHandler(userContract.getSelf, async () => {
      const [error, user] = await to(
        this.userService.getById({ id }),
      )
      if (error) {
        this.loggerService.error('取得帳號資料失敗')
        this.loggerService.error(error)
        throw new HttpException(
          `取得帳號資料失敗`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }

      if (!user) {
        this.loggerService.warn('取得帳號資料失敗')
        throw new HttpException(
          `取得帳號資料失敗，請重新登入`,
          HttpStatus.BAD_REQUEST,
        )
      }

      return {
        status: 200,
        body: user,
      }
    })
  }
}
