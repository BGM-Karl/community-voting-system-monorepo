import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AccountService } from '../../account/account.service'
import SecretConfig from '../../configs/secret.config'
import {
  ACCESS_TOKEN_HEADER_KEY,
  JwtPayload as AuthJwtPayload,
  RequestUser,
} from '../auth.type'

/** 細節可參考文件：https://docs.nestjs.com/recipes/passport#implementing-passport-jwt */
@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    @Inject(SecretConfig.KEY)
    private readonly secretConfig: ConfigType<typeof SecretConfig>,
    private readonly accountService: AccountService,
  ) {
    const { jwtRefreshSecret } = secretConfig

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const value = request.headers?.[ACCESS_TOKEN_HEADER_KEY] ?? ''
          if (Array.isArray(value)) {
            return ''
          }

          const [bearer, token] = value.split(' ')
          if (!token) {
            return null
          }

          return token
        },
      ]),
      secretOrKey: jwtRefreshSecret,
      /** https://docs.nestjs.com/recipes/passport#request-scoped-strategies */
      passReqToCallback: true,
    })
  }

  /** 此 method return 數值會被寫入 request.user 中。（回傳 falsy 表示不可通過） */
  async validate(
    request: Request,
    payload: JwtPayload & AuthJwtPayload,
  ): Promise<RequestUser | undefined> {
    const refreshToken = request.headers?.[ACCESS_TOKEN_HEADER_KEY]
    if (!refreshToken || Array.isArray(refreshToken)) {
      return undefined
    }

    const [bearer, token] = refreshToken.split(' ')
    const account = await this.accountService.findById(payload.id)
    if (!account) {
      return undefined
    }

    if (account.refreshToken === token) {
      return {
        id: account._id.toString(),
        role: account.role,
      }
    }

    return undefined
  }
}
