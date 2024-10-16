import { z } from 'zod'
import { objectIdSchema, timestampSchema } from '../common'

export const singleDataSchema = z.object({
  id: objectIdSchema,
  /** 名稱 */
  name: z.string(),
  description: z.string(),
  remark: z.string(),
  timestamp: timestampSchema,
})
export interface SingleData extends z.infer<typeof singleDataSchema> { }
// export type SingleData = z.infer<typeof singleDataSchema>
