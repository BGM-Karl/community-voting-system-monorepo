import type { AppRoute, ClientInferRequest, ClientInferResponses } from '@ts-rest/core'
import { initContract } from '@ts-rest/core'
import { userSchema } from './schema'

// 取得 user 自身資料
const getSelf = {
  method: 'GET',
  path: '/v1/user/self',
  responses: {
    200: userSchema,
  },
  summary: '取得 user 自身資料',
} satisfies AppRoute

export const userContract = initContract().router({
  getSelf,
}, {
  pathPrefix: '/api',
})

export interface UserContract {
  request: ClientInferRequest<typeof userContract>;
  response: ClientInferResponses<typeof userContract>;
}
