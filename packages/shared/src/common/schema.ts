import type { EmptyObject as FEmptyObject } from 'type-fest'
import { z } from 'zod'

export const objectIdSchema = z.coerce.string().regex(/^[0-9a-f]{24}$/)

/** nestjs 不允許 controller 回傳 null、undefined，
 * 會自動轉換成空物件，也就是 {}
 *
 * @deprecated 請不要使用，建議使用 contract.noBody()
 */
export const emptyObjectSchema = z.object({})
export type EmptyObject = FEmptyObject

export const timestampSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  /** 用於實現軟刪除 */
  deletedAt: z.string().datetime().optional(),
})
export interface Timestamp extends z.infer<typeof timestampSchema> { }

/** 基於頁數的分頁資料 */
export function definePaginatedDataSchema<Data>(dataSchema: z.ZodSchema<Data>) {
  return z.object({
    skip: z.coerce.number(),
    limit: z.coerce.number(),
    total: z.coerce.number(),
    data: z.array(dataSchema),
  })
}
/** 基於頁數的分頁資料 */
export interface PaginatedData<Data> extends z.infer<
  ReturnType<typeof definePaginatedDataSchema<Data>>
> { }

/** 基於 Cursor 的分頁資料 */
export function defineCursorPaginatedDataSchema<Data>(dataSchema: z.ZodSchema<Data>) {
  return z.object({
    /** data 內的資料不包含 startId 項目 */
    startId: z.string().optional(),
    limit: z.coerce.number(),
    data: z.array(dataSchema),
  })
}
/** 基於 Cursor 的分頁資料 */
export interface CursorCursorPaginatedData<Data> extends z.infer<
  ReturnType<typeof defineCursorPaginatedDataSchema<Data>>
> { }
