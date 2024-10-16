import type { AppRoute, ClientInferRequest, ClientInferResponses } from '@ts-rest/core'
import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import { emptyObjectSchema } from '../common'

const c = initContract()

// 本地登入
const localLogin = {
  method: 'POST',
  path: '/v1/auth/local',
  body: z.object({
    username: z.string(),
    password: z.string(),
  }),
  responses: {
    200: z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
    }),
    403: emptyObjectSchema,
  },
  summary: '本地登入',
} satisfies AppRoute

// 更新權杖
const refresh = {
  method: 'GET',
  path: '/v1/auth/refresh',
  responses: {
    200: z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
    }),
    403: emptyObjectSchema,
  },
  summary: '更新權杖',
} satisfies AppRoute

// 登出
const logout = {
  method: 'DELETE',
  path: '/v1/auth',
  body: emptyObjectSchema,
  responses: {
    204: emptyObjectSchema,
  },
  summary: '登出',
} satisfies AppRoute

export const authContract = c.router({
  localLogin,
  refresh,
  logout,
}, {
  pathPrefix: '/api',
})

export interface AuthContract {
  request: ClientInferRequest<typeof authContract>;
  response: ClientInferResponses<typeof authContract>;
}
