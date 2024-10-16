import { z } from 'zod'
import { objectIdSchema, timestampSchema } from '../common'

export const votingEventSchema = z.object({
  id: objectIdSchema,
  /** 是否提前結束 */
  isEndedEarly: z.boolean().default(false).describe('是否提前結束'),
  /** 標題 */
  title: z.string().describe('標題'),
  /** 詳細描述 */
  description: z.string().describe('詳細描述'),
  /** 要求的參與率（0-1之間的小數） */
  requiredParticipationRate: z.number().default(0.5).describe('要求的參與率（0-1之間的小數）'),
  /** 要求的權重率（0-1之間的小數） */
  requiredWeightRate: z.number().default(0.5).describe('要求的權重率（0-1之間的小數）'),
  /** 每個住戶最多可以選擇的選項數 */
  maxSelectableOptions: z.number().describe('每個住戶最多可以選擇的選項數'),
  /** 應參與的總住戶數 */
  totalHouseholds: z.number().describe('應參與的總住戶數'),
  /** 應參與的總權重 */
  totalWeight: z.number().describe('應參與的總權重'),
  /** 投票選項列表 */
  options: z.array(
    z.object({
      id: objectIdSchema,
      /** 選項的內容 */
      content: z.string().describe('選項的內容'),
    }),
  ).describe('投票選項列表'),
  /** 投票結果 */
  result: z.object({
    /** 實際參與投票的住戶數 */
    participatingHouseholds: z.number().default(0).describe('實際參與投票的住戶數'),
    /** 實際參與投票的總權重 */
    participatingWeight: z.number().default(0).describe('實際參與投票的總權重'),
    /** 每個選項的投票結果 */
    optionResults: z.array(
      z.object({
        /** 選項的唯一標識符 */
        optionId: objectIdSchema,
        /** 選項的內容 */
        content: z.string().describe('選項的內容'),
        /** 該選項獲得的票數 */
        votes: z.number().describe('該選項獲得的票數'),
        /** 該選項獲得的權重 */
        weight: z.number().describe('該選項獲得的權重'),
        /** 投票用戶的 Id 列表 */
        voterIds: z.array(objectIdSchema).default([]).describe('投票用戶列表'),
      }),
    ).default([]).describe('每個選項的投票結果'),
  }).default({
    participatingHouseholds: 0,
    participatingWeight: 0,
    optionResults: [],
  }).describe('投票結果'),
  timestamp: timestampSchema.extend({
    /** 開始時間 */
    startAt: z.string().datetime().describe('開始時間'),
    /** 結束時間 */
    endAt: z.string().datetime().describe('結束時間'),
  }),
})
export interface VotingEvent extends z.infer<typeof votingEventSchema> { }
