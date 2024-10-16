import { z } from 'zod'
import { accountSchema } from '../account'

export const userSchema = accountSchema.extend({
  refreshToken: z.void(),
  signature: z.void(),
})
/** 去除機敏資訊的 Account */
export interface User extends z.infer<
  typeof userSchema
> { }
