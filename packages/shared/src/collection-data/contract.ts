import type { AppRoute, ClientInferRequest, ClientInferResponses } from '@ts-rest/core'
import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import {
  definePaginatedDataSchema,
  findDtoSchema,
  objectIdSchema,
} from '../common'
import { defineLogSchema } from '../log'
import { collectionDataSchema } from './schema'

const contract = initContract()

// 建立 collection-data
export const createCollectionDataDtoSchema = collectionDataSchema.omit({
  id: true,
  timestamp: true,
}).extend({
}).partial({
})
const create = {
  method: 'POST',
  path: '/v1/collection-datas',
  body: createCollectionDataDtoSchema,
  responses: {
    201: collectionDataSchema,
  },
  summary: '建立 collection-data',
} as const satisfies AppRoute

// 取得 collection-data
const find = {
  method: 'GET',
  path: '/v1/collection-datas',
  query: findDtoSchema.extend({}),
  responses: {
    200: definePaginatedDataSchema(collectionDataSchema),
  },
  summary: '取得 collection-data',
} as const satisfies AppRoute

// 取得指定 collection-data
const findOne = {
  method: 'GET',
  path: '/v1/collection-datas/:id',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  responses: {
    200: collectionDataSchema,
    404: contract.noBody(),
  },
  summary: '取得指定 collection-data',
} as const satisfies AppRoute

// 更新指定 collection-data
const update = {
  method: 'PATCH',
  path: '/v1/collection-datas/:id',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  body: createCollectionDataDtoSchema.partial().extend({
    /** 描述變更內容 */
    updateDescription: z.string().optional(),
  }),
  responses: {
    200: collectionDataSchema,
    204: contract.noBody(),
    404: contract.noBody(),
  },
  summary: '更新指定 collection-data',
} as const satisfies AppRoute

// 刪除指定 collection-data
const remove = {
  method: 'DELETE',
  path: '/v1/collection-datas/:id',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  body: contract.noBody(),
  responses: {
    200: collectionDataSchema,
    404: contract.noBody(),
  },
  summary: '刪除指定 collection-data',
} as const satisfies AppRoute

// 取得指定 collection-data log
const findLogs = {
  method: 'GET',
  path: '/v1/collection-datas/:id/logs',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  query: findDtoSchema.extend({}),
  responses: {
    200: definePaginatedDataSchema(
      defineLogSchema(collectionDataSchema),
    ),
    404: contract.noBody(),
  },
  summary: '取得指定 collection-data log',
} as const satisfies AppRoute

export const collectionDataContract = contract.router({
  create,
  find,
  findOne,
  update,
  remove,

  findLogs,
}, {
  pathPrefix: '/api',
  commonResponses: {
    500: z.object({
      message: z.string(),
    }),
  },
})

export interface CollectionDataContract {
  request: ClientInferRequest<typeof collectionDataContract>;
  response: ClientInferResponses<typeof collectionDataContract>;
}
