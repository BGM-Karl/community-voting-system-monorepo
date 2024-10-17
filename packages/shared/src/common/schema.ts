import type { EmptyObject as FEmptyObject } from 'type-fest'
import { z } from 'zod'

export const objectIdSchema = z.coerce.string().regex(/^[0-9a-f]{24}$/)

/** NestJS does not allow controllers to return null or undefined,
 * it will automatically convert them to an empty object, i.e., {}
 *
 * @deprecated Please do not use this, it is recommended to use contract.noBody() instead
 */
export const emptyObjectSchema = z.object({})
export type EmptyObject = FEmptyObject

export const timestampSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  deletedAt: z.string().datetime().optional(),
})
export interface Timestamp extends z.infer<typeof timestampSchema> { }

/** Pagination data based on page numbers */
export function definePaginatedDataSchema<Data>(dataSchema: z.ZodSchema<Data>) {
  return z.object({
    skip: z.coerce.number(),
    limit: z.coerce.number(),
    total: z.coerce.number(),
    data: z.array(dataSchema),
  })
}
/** Pagination data based on page numbers */
export interface PaginatedData<Data> extends z.infer<
  ReturnType<typeof definePaginatedDataSchema<Data>>
> { }

/** Pagination data based on Cursor */
export function defineCursorPaginatedDataSchema<Data>(dataSchema: z.ZodSchema<Data>) {
  return z.object({
    /** data 內的資料不包含 startId 項目 */
    startId: z.string().optional(),
    limit: z.coerce.number(),
    data: z.array(dataSchema),
  })
}
/** Pagination data based on Cursor */
export interface CursorCursorPaginatedData<Data> extends z.infer<
  ReturnType<typeof defineCursorPaginatedDataSchema<Data>>
> { }
