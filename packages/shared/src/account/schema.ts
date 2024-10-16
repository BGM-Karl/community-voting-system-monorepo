import { z } from 'zod'
import { objectIdSchema, timestampSchema } from '../common'
import { defineConstants } from '../define'

export const {
  ACCOUNT_ROLE_KV: ACCOUNT_ROLE,
  ACCOUNT_ROLE_MAP_BY_KEY,
  ACCOUNT_ROLE_MAP_BY_VALUE,
  ACCOUNT_ROLE_VALUES,
} = defineConstants(
  [
    {
      key: 'ADMIN',
      value: 'admin',
      label: '管理者',
      description: '可以設定各類原始資料',
    },
    {
      key: 'BASIC',
      value: 'basic',
      label: '使用者',
      description: '只能輸出、查看報價單內容',
    },
  ] as const,
  'ACCOUNT_ROLE',
)
export type AccountRole = typeof ACCOUNT_ROLE_VALUES[number]

export const accountSchema = z.object({
  id: objectIdSchema,
  role: z.nativeEnum(ACCOUNT_ROLE),
  username: z.string(),
  name: z.string(),
  weight: z.number().default(0),
  description: z.string().optional(),
  refreshToken: z.string().optional(),
  timestamp: timestampSchema,
})
export type Account = z.infer<typeof accountSchema>
