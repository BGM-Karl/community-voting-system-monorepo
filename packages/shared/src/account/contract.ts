import type { AppRoute, ClientInferRequest, ClientInferResponses } from '@ts-rest/core'
import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import {
  definePaginatedDataSchema,
  emptyObjectSchema,
  objectIdSchema,
} from '../common'
import { accountSchema } from './schema'

const c = initContract()

// 建立 account
const create = {
  method: 'POST',
  path: '/v1/accounts',
  body: z.object({
    username: z.string(),
    password: z.string(),
    name: z.string(),
    weight: z.number().default(0),
    description: z.string().optional(),
  }),
  responses: {
    201: z.object({
      data: z.string(),
    }),
  },
  summary: '建立 account',
} satisfies AppRoute

// 取得 account
const find = {
  method: 'GET',
  path: '/v1/accounts',
  // FIX: 使用 findDtoSchema 會一直出現 TypeError: Cannot read properties of undefined (reading 'extend')
  query: z.object({
    skip: z.coerce.number().int().min(0).optional(),
    limit: z.coerce.number().int().min(0).optional(),
    keyword: z.string().optional(),
  }),
  responses: {
    200: definePaginatedDataSchema(accountSchema),
    404: emptyObjectSchema,
  },
  summary: '取得 account',
} satisfies AppRoute

// 取得指定 account
const findOne = {
  method: 'GET',
  path: '/v1/accounts/:id',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  responses: {
    200: accountSchema,
    404: emptyObjectSchema,
  },
  summary: '取得指定 account',
} satisfies AppRoute

// 更新指定 account
const update = {
  method: 'PATCH',
  path: '/v1/accounts/:id',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  body: create.body.pick({
    name: true,
    password: true,
    description: true,
    weight: true,
  }).partial(),
  responses: {
    200: accountSchema,
    404: emptyObjectSchema,
  },
  summary: '更新指定 account',
} satisfies AppRoute

// delete指定 account
const remove = {
  method: 'DELETE',
  path: '/v1/accounts/:id',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  body: emptyObjectSchema,
  responses: {
    200: emptyObjectSchema,
    404: emptyObjectSchema,
  },
  summary: 'delete指定 account',
} satisfies AppRoute

export const accountContract = c.router({
  create,
  find,
  findOne,
  update,
  remove,
}, {
  pathPrefix: '/api',
})

export interface AccountContract {
  request: ClientInferRequest<typeof accountContract>;
  response: ClientInferResponses<typeof accountContract>;
}
