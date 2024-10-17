import type { Timestamp } from '../common/schema'
import type { User } from '../user'
import { z } from 'zod'
import { objectIdSchema, timestampSchema } from '../common/schema'
import { userSchema } from '../user'

/**
 * Implemented using just-diff
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

/** Log record */
export function defineLogSchema<Data>(dataSchema: z.ZodSchema<Data>) {
  return z.object({
    /** Source ID */
    sourceId: objectIdSchema,
    oldData: dataSchema.optional(),
    changes: changeSchema.array(),
    description: z.string(),
    editor: userSchema.nullish(),
    timestamp: timestampSchema,
  })
}
/** Log record */
export interface Log<Data = undefined> {
  readonly id: string;
  /** Source ID */
  sourceId: string;
  /** Data before changes were applied */
  oldData?: Data;
  /** Change details */
  changes: Change[];
  description: string;
  editor?: User;
  timestamp: Timestamp;
}
