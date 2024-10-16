import type { AppRoute, ClientInferRequest, ClientInferResponses } from '@ts-rest/core'
import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import {
  definePaginatedDataSchema,
  findDtoSchema,
  objectIdSchema,
  updateBasicImageDtoSchema,
} from '../common'
import { defineLogSchema } from '../log'
import { {{camelCase name }}Schema } from './schema'

const contract = initContract()

// 建立 {{kebabCase name}}
export const create{{ pascalCase name }}DtoSchema = {{camelCase name }}Schema.omit({
  id: true,
  timestamp: true,
}).extend({
  image: z.optional(updateBasicImageDtoSchema),
}).partial({
  remark: true,
  description: true,
})
const create = {
  method: 'POST',
  path: '/v1/{{kebabCase name}}s',
  body: create{{ pascalCase name }}DtoSchema,
    responses: {
  201: { {camelCase name } } Schema,
  },
summary: '建立 {{kebabCase name}}',
} as const satisfies AppRoute

// 取得 {{kebabCase name}}
const find = {
  method: 'GET',
  path: '/v1/{{kebabCase name}}s',
  query: findDtoSchema.extend({}),
  responses: {
    200: definePaginatedDataSchema({{ camelCase name }}Schema),
},
  summary: '取得 {{kebabCase name}}',
} as const satisfies AppRoute

// 取得指定 {{kebabCase name}}
const findOne = {
  method: 'GET',
  path: '/v1/{{kebabCase name}}s/:id',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  responses: {
    200: {{ camelCase name }}Schema,
      404: contract.noBody(),
  },
summary: '取得指定 {{kebabCase name}}',
} as const satisfies AppRoute

// 更新指定 {{kebabCase name}}
const update = {
  method: 'PATCH',
  path: '/v1/{{kebabCase name}}s/:id',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  body: create{{ pascalCase name }}DtoSchema.partial().extend({
    /** 描述變更內容 */
    updateDescription: z.string().optional(),
  }),
    responses: {
  200: { {camelCase name } } Schema,
    204: contract.noBody(),
      404: contract.noBody(),
  },
summary: '更新指定 {{kebabCase name}}',
} as const satisfies AppRoute

// 刪除指定 {{kebabCase name}}
const remove = {
  method: 'DELETE',
  path: '/v1/{{kebabCase name}}s/:id',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  body: contract.noBody(),
  responses: {
    200: {{ camelCase name }}Schema,
      404: contract.noBody(),
  },
summary: '刪除指定 {{kebabCase name}}',
} as const satisfies AppRoute

// 取得指定 {{kebabCase name}} log
const findLogs = {
  method: 'GET',
  path: '/v1/{{kebabCase name}}s/:id/logs',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  query: findDtoSchema.extend({}),
  responses: {
    200: definePaginatedDataSchema(
      defineLogSchema({{ camelCase name }}Schema),
    ),
404: contract.noBody(),
  },
summary: '取得指定 {{kebabCase name}} log',
} as const satisfies AppRoute

export const {{ camelCase name }}Contract = contract.router({
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

export interface { {pascalCase name } }Contract {
  request: ClientInferRequest < typeof {{camelCase name }
} Contract >;
response: ClientInferResponses < typeof {{camelCase name }}Contract >;
}
