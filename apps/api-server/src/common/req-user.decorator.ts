/**
 * 用於取得 request 中解析完成之 user
 * AuthGuard('jwt') 之 user 內容請見 jwt.strategy
 * AuthGuard('local') 之 user 內容請見 local.strategy
 */

import type { ExecutionContext } from '@nestjs/common'
import type { RequestUser } from '../auth/auth.type'
import { createParamDecorator } from '@nestjs/common'

export const ReqUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user as RequestUser
  },
)
