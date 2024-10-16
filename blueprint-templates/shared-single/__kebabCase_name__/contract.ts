import type { AppRoute, ClientInferRequest, ClientInferResponses } from '@ts-rest/core'
import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import { definePaginatedDataSchema, findDtoSchema, updateBasicImageDtoSchema } from '../common'
import { defineLogSchema } from '../log'
import { {{camelCase name }}Schema } from './schema'

const contract = initContract()

// 取得 {{kebabCase name}}
const get = {
  method: 'GET',
  path: '/v1/{{kebabCase name}}',
  responses: {
    200: {{ camelCase name }}Schema,
  },
summary: '取得 {{kebabCase name}}',
} as const satisfies AppRoute

// 更新 {{kebabCase name}}
export const update{{ pascalCase name }}DtoSchema = {{camelCase name }}Schema.omit({
  id: true,
  timestamp: true,
}).extend({
  image: updateBasicImageDtoSchema,
  updateDescription: z.string().optional(),
}).partial()

const update = {
  method: 'PATCH',
  path: '/v1/{{kebabCase name}}',
  body: z.optional(update{{ pascalCase name }}DtoSchema),
  responses: {
    200: {{ camelCase name }}Schema,
      204: contract.noBody(),
  },
summary: '更新 {{kebabCase name}}',
} as const satisfies AppRoute

// 取得指定 {{kebabCase name}} log
const findLogs = {
  method: 'GET',
  path: '/v1/{{kebabCase name}}/logs',
  query: findDtoSchema.extend({}),
  responses: {
    200: definePaginatedDataSchema(
      defineLogSchema({{ camelCase name }}Schema),
    ),
  },
summary: '取得指定 {{kebabCase name}} log',
} as const satisfies AppRoute

export const {{ camelCase name }}Contract = contract.router({
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
export interface { {pascalCase name } }Contract {
  request: ClientInferRequest < typeof {{camelCase name }
} Contract >;
response: ClientInferResponses < typeof {{camelCase name }}Contract >;
}
