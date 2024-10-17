import type { Response } from 'express'
import { authContract } from '@community-voting-system/shared'
import {
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Res,
  UseGuards,
} from '@nestjs/common'

import { ConfigType } from '@nestjs/config'
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'
import to from 'await-to-js'
import { AccountService } from '../account/account.service'
import { ReqUser } from '../common/req-user.decorator'
import SecretConfig from '../configs/secret.config'
import { LoggerService } from '../logger/logger.service'
import { AuthService } from './auth.service'
import { ACCESS_TOKEN_HEADER_KEY, RequestUser } from './auth.type'
import { JwtRefreshTokenGuard } from './guard/jwt-refresh-token.guard'
import { LocalGuard } from './guard/local.guard'

@Controller()
export class AuthController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
    @Inject(SecretConfig.KEY)
    private readonly secretConfig: ConfigType<typeof SecretConfig>,
  ) {
    //
  }

  @UseGuards(JwtRefreshTokenGuard)
  @TsRestHandler(authContract.refresh, {
    validateResponses: true,
  })
  async refresh(
    @ReqUser() user: RequestUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    return tsRestHandler(authContract.refresh, async () => {
      // 取得帳號
      const [error, account] = await to(this.accountService.findById(user.id))
      if (error) {
        this.loggerService.error('取得帳號失敗')
        this.loggerService.error(error)
        throw new HttpException(
          `Login error, please try again later`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }

      if (!account) {
        return {
          status: 403,
          body: {},
        }
      }

      const { accessToken, refreshToken }
        = await this.authService.updateRefreshToken(account)

      const { accessExpiresIn } = this.secretConfig
      const options = this.authService.getCookieOptions(accessExpiresIn)
      res.cookie(ACCESS_TOKEN_HEADER_KEY, `Bearer ${accessToken}`, options)

      return {
        status: 200,
        body: {
          accessToken,
          refreshToken,
        },
      }
    })
  }

  @UseGuards(LocalGuard)
  @TsRestHandler(authContract.localLogin, {
    validateResponses: true,
  })
  async localLogin(
    @ReqUser() user: RequestUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    return tsRestHandler(authContract.localLogin, async () => {
      // 取得帳號
      const [error, account] = await to(this.accountService.findById(user.id))
      if (error) {
        this.loggerService.error(error)
        throw new HttpException(
          `Login error, please try again later`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }

      if (!account) {
        return {
          status: 403,
          body: {},
        }
      }

      const { accessToken, refreshToken }
        = await this.authService.updateRefreshToken(account)

      const { accessExpiresIn } = this.secretConfig
      const options = this.authService.getCookieOptions(accessExpiresIn)
      res.cookie(ACCESS_TOKEN_HEADER_KEY, `Bearer ${accessToken}`, options)

      return {
        status: 200,
        body: {
          accessToken,
          refreshToken,
        },
      }
    })
  }

  @TsRestHandler(authContract.logout, {
    validateResponses: true,
  })
  async logout(@Res({ passthrough: true }) res: Response) {
    return tsRestHandler(authContract.logout, async () => {
      res.clearCookie(ACCESS_TOKEN_HEADER_KEY)
      return {
        status: 204,
        body: {},
      }
    })
  }
}
