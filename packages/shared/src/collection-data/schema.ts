import { z } from 'zod'
import { objectIdSchema, timestampSchema } from '../common'

export const collectionDataSchema = z.object({
  id: objectIdSchema,
  /** 名稱 */
  name: z.string(),
  description: z.string(),
  remark: z.string(),
  timestamp: timestampSchema,
})
export interface CollectionData extends z.infer<typeof collectionDataSchema> { }
