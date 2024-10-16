/**
 * 用於取得 request 中解析完成之 user
 * AuthGuard('jwt') 之 user 內容請見 jwt.strategy
 * AuthGuard('local') 之 user 內容請見 local.strategy
 */

import type {
  ExecutionContext,
} from '@nestjs/common'
import type { OnEventOptions } from '@nestjs/event-emitter/dist/interfaces'
import type { RequestUser } from '../auth/auth.type'
import {
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

export const ReqUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user as RequestUser
  },
)

/** 可以註冊多個事件的 OnEvent
 *
 * wildcard 通用匹配符號無效的折衷方案
 */
export function OnEvents(events: string[], options?: OnEventOptions) {
  return applyDecorators(...events.map((e) => OnEvent(e, options)))
}
