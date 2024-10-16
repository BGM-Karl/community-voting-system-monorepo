import type { Timestamp } from '../common/schema'
import type { User } from '../user'
import { z } from 'zod'
import { objectIdSchema, timestampSchema } from '../common/schema'
import { userSchema } from '../user'

/**
 * 使用 just-diff 實作
 *
 * https://www.npmjs.com/package/just-diff
 */
const changeSchema = z.object({
  op: z.enum(['add', 'remove', 'replace']),
  path: z.array(z.union([z.string(), z.number()])),
  oldValue: z.any().optional(),
  value: z.any(),
})
export interface Change extends z.infer<typeof changeSchema> { }

/** Log 紀錄 */
export function defineLogSchema<Data>(dataSchema: z.ZodSchema<Data>) {
  return z.object({
    /** 來源 ID */
    sourceId: objectIdSchema,
    oldData: dataSchema.optional(),
    changes: changeSchema.array(),
    description: z.string(),
    editor: userSchema.nullish(),
    timestamp: timestampSchema,
  })
}
/** Log 紀錄 */
export interface Log<Data = undefined> {
  readonly id: string;
  /** 來源 ID */
  sourceId: string;
  /** changes 套用前的資料 */
  oldData?: Data;
  /** 變更內容 */
  changes: Change[];
  description: string;
  editor?: User;
  timestamp: Timestamp;
}
