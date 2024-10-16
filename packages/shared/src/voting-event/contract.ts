import type { AppRoute, ClientInferRequest, ClientInferResponses } from '@ts-rest/core'
import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import {
  definePaginatedDataSchema,
  findDtoSchema,
  objectIdSchema,
} from '../common'
import { defineLogSchema } from '../log'
import { votingEventSchema } from './schema'

const contract = initContract()

// 建立 voting-event
export const createVotingEventDtoSchema = votingEventSchema.omit({
  id: true,
  timestamp: true,
}).omit({
  options: true,
}).extend({
  options: z.array(
    z.object({
      /** 選項的內容 */
      content: z.string().describe('選項的內容'),
    }),
  ).describe('投票選項列表'),
  /** 開始時間 */
  startAt: z.string().datetime().describe('開始時間'),
  /** 結束時間 */
  endAt: z.string().datetime().describe('結束時間'),
}).partial({
})
const create = {
  method: 'POST',
  path: '/v1/voting-events',
  body: createVotingEventDtoSchema,
  responses: {
    201: votingEventSchema,
  },
  summary: '建立 voting-event',
} as const satisfies AppRoute

// 取得 voting-event
const find = {
  method: 'GET',
  path: '/v1/voting-events',
  query: findDtoSchema.extend({}),
  responses: {
    200: definePaginatedDataSchema(
      votingEventSchema
        .extend({
          /** 當前狀態 */
          status: z.enum(['未開始', '進行中', '已結束']).describe('當前狀態'),
        }),
    ),
  },
  summary: '取得 voting-event',
} as const satisfies AppRoute

// 取得指定 voting-event
const findOne = {
  method: 'GET',
  path: '/v1/voting-events/:id',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  responses: {
    200: votingEventSchema.extend({
      /** 當前狀態 */
      status: z.enum(['未開始', '進行中', '已結束']).describe('當前狀態'),
    }),
    404: contract.noBody(),
  },
  summary: '取得指定 voting-event',
} as const satisfies AppRoute

// 更新指定 voting-event
const update = {
  method: 'PATCH',
  path: '/v1/voting-events/:id',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  body: createVotingEventDtoSchema.deepPartial(),
  responses: {
    200: votingEventSchema,
    204: contract.noBody(),
    404: contract.noBody(),
  },
  summary: '更新指定 voting-event',
} as const satisfies AppRoute

// 刪除指定 voting-event
const remove = {
  method: 'DELETE',
  path: '/v1/voting-events/:id',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  body: contract.noBody(),
  responses: {
    200: votingEventSchema,
    404: contract.noBody(),
  },
  summary: '刪除指定 voting-event',
} as const satisfies AppRoute

// 指定 voting-event 投票
const vote = {
  method: 'POST',
  path: '/v1/voting-events/:id/vote',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    /** 選項 id */
    optionIdList: z.array(objectIdSchema).describe('選項 id'),
  }),
  responses: {
    200: votingEventSchema,
    404: contract.noBody(),
  },
} as const satisfies AppRoute

// 取得指定 voting-event log
const findLogs = {
  method: 'GET',
  path: '/v1/voting-events/:id/logs',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  query: findDtoSchema.extend({}),
  responses: {
    200: definePaginatedDataSchema(
      defineLogSchema(votingEventSchema),
    ),
    404: contract.noBody(),
  },
  summary: '取得指定 voting-event log',
} as const satisfies AppRoute

export const votingEventContract = contract.router({
  create,
  find,
  findOne,
  update,
  remove,
  vote,

  findLogs,
}, {
  pathPrefix: '/api',
  commonResponses: {
    500: z.object({
      message: z.string(),
    }),
  },
})

export interface VotingEventContract {
  request: ClientInferRequest<typeof votingEventContract>;
  response: ClientInferResponses<typeof votingEventContract>;
}
