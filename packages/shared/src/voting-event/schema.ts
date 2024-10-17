import { z } from 'zod'
import { objectIdSchema, timestampSchema } from '../common'

export const votingEventSchema = z.object({
  id: objectIdSchema,
  /** Whether to end early */
  isEndedEarly: z.boolean().default(false).describe('Whether to end early'),
  /** Title */
  title: z.string().describe('title'),
  /** Detailed description */
  description: z.string().describe('detailed description'),
  /** Required participation rate (decimal between 0-1) */
  requiredParticipationRate: z.number().default(0.5).describe('Required participation rate (decimal between 0-1)'),
  /** Required weight rate (decimal between 0-1) */
  requiredWeightRate: z.number().default(0.5).describe('Required weight rate (decimal between 0-1)'),
  /** The maximum number of options that each household can choose */
  maxSelectableOptions: z.number().describe('The maximum number of options that each household can select'),
  /** Total number of households that should participate */
  totalHouseholds: z.number().describe('Total number of households that should participate'),
  /** Total weight that should participate */
  totalWeight: z.number().describe('Total weight that should participate'),
  /** List of voting options */
  options: z.array(
    z.object({
      id: objectIdSchema,
      /** Contents of options */
      content: z.string().describe('content of option'),
    }),
  ).describe('voting option list'),
  /** Voting results */
  result: z.object({
    /** Number of households actually participating in voting */
    participatingHouseholds: z.number().default(0).describe('Number of households actually participating in voting'),
    /** Total weight of actual voting */
    participatingWeight: z.number().default(0).describe('Total weight of actual voting participation'),
    /** Voting results for each option */
    optionResults: z.array(
      z.object({
        /** Unique identifier for the option */
        optionId: objectIdSchema,
        /** Contents of options */
        content: z.string().describe('content of option'),
        /** Number of votes this option received */
        votes: z.number().describe('The number of votes this option received'),
        /** The weight obtained by this option */
        weight: z.number().describe('The weight obtained by this option'),
        /** Voting user ID list */
        voterIds: z.array(objectIdSchema).default([]).describe('voting user list'),
      }),
    ).default([]).describe('Vote results for each option'),
  }).default({
    participatingHouseholds: 0,
    participatingWeight: 0,
    optionResults: [],
  }).describe('voting results'),
  timestamp: timestampSchema.extend({
    /** Start time */
    startAt: z.string().datetime().describe('start time'),
    /** End time */
    endAt: z.string().datetime().describe('end time'),
  }),
})
export interface VotingEvent extends z.infer<typeof votingEventSchema> { }
