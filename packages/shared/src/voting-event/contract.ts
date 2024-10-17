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

// Create voting-event
export const createVotingEventDtoSchema = votingEventSchema.omit({
  id: true,
  timestamp: true,
}).omit({
  options: true,
}).extend({
  options: z.array(
    z.object({
      /** Contents of options */
      content: z.string().describe('content of option'),
    }),
  ).describe('voting option list'),
  /** Start time */
  startAt: z.string().datetime().describe('start time'),
  /** End time */
  endAt: z.string().datetime().describe('end time'),
}).partial({
})
const create = {
  method: 'POST',
  path: '/v1/voting-events',
  body: createVotingEventDtoSchema,
  responses: {
    201: votingEventSchema,
  },
  summary: 'Create voting-event',
} as const satisfies AppRoute

// Get voting-event
const find = {
  method: 'GET',
  path: '/v1/voting-events',
  query: findDtoSchema.extend({}),
  responses: {
    200: definePaginatedDataSchema(
      votingEventSchema
        .extend({
          /** Current status */
          status: z.enum(['Not started', 'In progress', 'Ended']).describe('Current status'),
        }),
    ),
  },
  summary: 'Get voting-event',
} as const satisfies AppRoute

// Get the specified voting-event
const findOne = {
  method: 'GET',
  path: '/v1/voting-events/:id',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  responses: {
    200: votingEventSchema.extend({
      /** Current status */
      status: z.enum(['Not started', 'In progress', 'Ended']).describe('Current status'),
    }),
    404: contract.noBody(),
  },
  summary: 'Get the specified voting-event',
} as const satisfies AppRoute

// Update the specified voting-event
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
  summary: 'Update specified voting-event',
} as const satisfies AppRoute

// Delete the specified voting-event
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
  summary: 'Delete the specified voting-event',
} as const satisfies AppRoute

// Specify voting-event to vote
const vote = {
  method: 'POST',
  path: '/v1/voting-events/:id/vote',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    /** option id */
    optionIdList: z.array(objectIdSchema).describe('option id'),
  }),
  responses: {
    200: votingEventSchema,
    404: contract.noBody(),
  },
} as const satisfies AppRoute

// Get the specified voting-event log
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
  summary: 'Get the specified voting-event log',
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
