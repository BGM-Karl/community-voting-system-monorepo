import type { FlattenMaps, HydratedDocument } from 'mongoose'
import Mongoose from 'mongoose'

/** 嘗試將 string 轉換為 ObjectId 物件，如果已經是 ObjectId 則不處理
 *
 * 可以輸入 string[] 會變為 ObjectId[]
 */
export function parseObjectId(value: Mongoose.Types.ObjectId): Mongoose.Types.ObjectId
export function parseObjectId(value: Mongoose.Types.ObjectId[]): Mongoose.Types.ObjectId[]
export function parseObjectId(value: string): Mongoose.Types.ObjectId
export function parseObjectId(value: string[]): Mongoose.Types.ObjectId[]
export function parseObjectId(
  value: string[] | string | Mongoose.Types.ObjectId | Mongoose.Types.ObjectId[],
) {
  if (Array.isArray(value)) {
    if (value[0] instanceof Mongoose.Types.ObjectId) {
      return value
    }

    return value.map((v) => new Mongoose.Types.ObjectId(v))
  }

  if (value instanceof Mongoose.Types.ObjectId) {
    return value
  }
  return new Mongoose.Types.ObjectId(value)
}

type SimplifiedDoc<Doc> = Omit<FlattenMaps<Doc>, '_id'> & { _id: string }

/** 將 Document 轉換為一般 JS 物件並將其中的 ObjectId 轉為 string
 *
 * 也可以避免 ts-rest 認為 id 的 ObjectId 與 string 不同的問題
 *
 * 目前型別判斷有些問題，會跑出很多不存在的 method，請不要使用資料以外的 property
 *
 * 不轉為一般物件的話 omit、pick 這類 utils function 會無法正常運作，
 * 也不用將 ObjectId 再轉成 string
 *
 * @deprecated 直接使用 id 屬性即可
 */
export function toObject<Data, Doc extends HydratedDocument<Data>>(
  doc: Doc,
): SimplifiedDoc<Doc>
export function toObject<Data, Doc extends HydratedDocument<Data>>(
  doc: Doc | undefined | null,
): undefined | SimplifiedDoc<Doc>
export function toObject<Data, Doc extends HydratedDocument<Data>>(
  doc?: Doc | null,
) {
  if (!doc) {
    return undefined
  }

  try {
    const result = {
      ...doc.toObject({ flattenMaps: true }),
      _id: doc.id,
    }

    return result as SimplifiedDoc<Doc>
  }
  catch {
    return doc
  }
}
