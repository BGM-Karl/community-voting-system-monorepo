import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import bcrypt from 'bcrypt'
import { CookieOptions } from 'express'
import ms from 'ms'
import { AccountService } from '../account/account.service'
import { AccountDocument } from '../account/schema'

import SecretConfig from '../configs/secret.config'
import { LoggerService } from '../logger/logger.service'
import { UtilsService } from '../utils/utils.service'
import { JwtPayload } from './auth.type'

@Injectable()
export class AuthService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly accountService: AccountService,
    private readonly jwtService: JwtService,
    private readonly utilsService: UtilsService,
    @Inject(SecretConfig.KEY)
    private readonly secretConfig: ConfigType<typeof SecretConfig>,
  ) {
    //
  }

  async validateLocalAccount(username: string, password: string) {
    const account = await this.accountService.findByUsername(username, true)

    if (!account) {
      return undefined
    }

    const isMatch = await bcrypt.compare(password, account.password)
    if (isMatch) {
      return account
    }

    return undefined
  }

  async updateRefreshToken(account: AccountDocument) {
    const token = this.getJwtTokens(account)

    // 更新 refreshToken
    await this.accountService.updateRefreshToken(
      account._id.toString(),
      token.refreshToken,
    )

    return token
  }

  getJwtTokens(account: AccountDocument) {
    const {
      jwtAccessSecret,
      accessExpiresIn,
      jwtRefreshSecret,
      refreshExpiresIn,
    } = this.secretConfig

    const payload: JwtPayload = {
      id: account._id.toString(),
      role: account.role,
    }

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtAccessSecret,
      expiresIn: accessExpiresIn,
    })
    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtRefreshSecret,
      expiresIn: refreshExpiresIn,
    })

    return {
      accessToken,
      refreshToken,
    }
  }

  getCookieOptions(expiresIn: string) {
    const result: CookieOptions = {
      path: '/',
      signed: true,
      secure: !this.utilsService.isDev(), // https Only
      httpOnly: true,
      maxAge: ms(expiresIn),
      sameSite: 'strict',
    }

    return result
  }
}
