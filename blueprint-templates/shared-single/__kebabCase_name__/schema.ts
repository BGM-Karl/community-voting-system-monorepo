import { z } from 'zod'
import { objectIdSchema, timestampSchema } from '../common'

export const {{ camelCase name }}Schema = z.object({
  id: objectIdSchema,
  /** 名稱 */
  name: z.string(),
  description: z.string(),
  remark: z.string(),
  timestamp: timestampSchema,
})
export interface { {pascalCase name } } extends z.infer < typeof {{camelCase name }}Schema > {}
// export type {{pascalCase name}} = z.infer<typeof {{camelCase name}}Schema>
