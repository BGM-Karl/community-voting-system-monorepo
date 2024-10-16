import { handleClone } from "./utils-clone";

export type RelationDataType<DataType> = string | DataType | undefined | null;

/**
 * 解析關聯資料的唯一識別碼 (ID)
 * @param relationData - 關聯資料，可能是字串、帶有 `_id` 屬性的物件，或 undefined/null
 * @returns 關聯資料中的 ID 字串，若無法解析則回傳 undefined
 */
function parseRelationId(relationData: string | ({ _id: string }) | undefined | null): string | undefined {
  if (typeof relationData === 'string') return relationData;
  if (!relationData) return undefined;
  return relationData._id;
}

/**
 * 解析關聯資料的內容物
 * @param relationData - 關聯資料，可能是字串、資料物件，或 undefined/null
 * @returns 關聯資料中的物件，若無法解析則回傳 undefined
 */
function parseRelationData<
  DataType,
>(relationData: RelationDataType<DataType>): DataType | undefined {
  if (!relationData || typeof relationData === 'string') return undefined;
  return handleClone(relationData) as DataType;
}

/**
 * 解析關聯資料
 * @param parseType - 解析的目標類型 ('id' 或 'data')
 * @param relationData - 要解析的關聯資料，可能是單一資料或資料陣列
 * @returns 根據類型回傳 ID 或資料物件，若無法解析則回傳 undefined
 */
export function parseRelation<DataType>(parseType: 'id', relationData: RelationDataType<DataType>): string | undefined | null;
export function parseRelation<DataTypeList>(parseType: 'idList', relationData: RelationDataType<DataTypeList>): Array<string | undefined | null>;
export function parseRelation<DataType>(parseType: 'data', relationData: RelationDataType<DataType>): DataType | undefined;
export function parseRelation<DataType>(parseType: 'dataList', relationData: RelationDataType<DataType[]>): Extract<DataType, { _id: string }>[] | undefined;
export function parseRelation<DataType>(parseType: 'id' | 'idList' | 'data' | 'dataList', relationData: any) {
  relationData = handleClone(relationData);
    // 如果是陣列
    if (Array.isArray(relationData)) {
        if (parseType === 'id' || parseType === 'idList') return relationData.map(parseRelationId);
        return relationData.map(parseRelationData);
    }
    // 如果是單一資料
    if (parseType === 'id' || parseType === 'idList') return parseRelationId(relationData);
    return parseRelationData<DataType>(relationData);
}

type StringOrStringId = string | ({ _id: string } & Record<string, any>);
type ConvertToStringOrArray<T> = T extends (infer U)[]
  ? U extends StringOrStringId
  ? string[]
  : T
  : T extends StringOrStringId
  ? string
  : T;

export type ConvertRelationDataToString<T> = T extends object
  ? {
    [K in keyof T]: T[K] extends (infer U)[] | null | undefined
    ? ConvertToStringOrArray<NonNullable<U>>[] | Extract<T[K], null | undefined>
    : T[K] extends object | null | undefined
    ? ConvertRelationDataToString<NonNullable<T[K]>> | Extract<T[K], null | undefined>
    : T[K];
  }
  : T;
