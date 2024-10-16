import type { AppRoute, ClientInferRequest, ClientInferResponses } from '@ts-rest/core'
import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import { definePaginatedDataSchema, findDtoSchema } from '../common'
import { defineLogSchema } from '../log'
import { singleDataSchema } from './schema'

const contract = initContract()

// 取得 single-data
const get = {
  method: 'GET',
  path: '/v1/single-data',
  responses: {
    200: singleDataSchema,
  },
  summary: '取得 single-data',
} as const satisfies AppRoute

// 更新 single-data
export const updateSingleDataDtoSchema = singleDataSchema.omit({
  id: true,
  timestamp: true,
}).extend({
  updateDescription: z.string().optional(),
}).partial()

const update = {
  method: 'PATCH',
  path: '/v1/single-data',
  body: z.optional(updateSingleDataDtoSchema),
  responses: {
    200: singleDataSchema,
    204: contract.noBody(),
  },
  summary: '更新 single-data',
} as const satisfies AppRoute

// 取得指定 single-data log
const findLogs = {
  method: 'GET',
  path: '/v1/single-data/logs',
  query: findDtoSchema.extend({}),
  responses: {
    200: definePaginatedDataSchema(
      defineLogSchema(singleDataSchema),
    ),
  },
  summary: '取得指定 single-data log',
} as const satisfies AppRoute

export const singleDataContract = contract.router({
  get,
  update,

  findLogs,
}, {
  pathPrefix: '/api',
  commonResponses: {
    500: z.object({
      message: z.string(),
    }),
  },
})
export interface SingleDataContract {
  request: ClientInferRequest<typeof singleDataContract>;
  response: ClientInferResponses<typeof singleDataContract>;
}
