import type { ZodObject, ZodTypeAny } from 'zod'
import type { FlattenObject } from './flattenObject'
import get from 'lodash-es/get'
import { isString } from 'remeda'

/** 將 zodAny 的驗證資訊轉換成 quasar 的 rule function */
export function convertZodAnyToQuasarRules(validator: ZodTypeAny) {
  return (item: any) => {
    const result = validator?.safeParse(item)
    if (!result)
      return '錯誤！'
    if (result.success)
      return true
    return result.error.issues[0]?.message ?? '錯誤！'
  }
}
export function convertZodObjToZodType<
  ObjectData extends { [key: string]: any },
>(
  zodObject: ZodObject<any>,
  path: keyof FlattenObject<ObjectData>,
): ZodTypeAny {
  if (!isString(path)) {
    throw new Error('路徑錯誤')
  }
  const pathArray = (path as string).split('.')
  // eslint-disable-next-line array-callback-return
  return pathArray.reduce<ZodTypeAny>((acc, cur) => {
    let result: object = acc
    if ('unwrap' in result && typeof result.unwrap === 'function') {
      result = result.unwrap()
    }
    if ('shape' in result && typeof result.shape === 'object' && result.shape) {
      result = result.shape
    }
    if (cur in result) {
      return get(result, cur)
    }
    // if (acc instanceof ZodObject) {
    //   return acc.shape[cur].unwrap();
    // } else if (acc instanceof ZodOptional) {
    //   const innerSchema = acc.unwrap();
    //   if (innerSchema instanceof ZodObject) {
    //     return acc.unwrap().shape[cur];
    //   }
    //   return innerSchema;
  }, zodObject)
}
/** 將 zodObj 的驗證資訊轉換成 quasar 的 rule function */
export function convertZodObjToQuasarRules<
  ObjectData extends { [key: string]: any },
>(
  zodObject: ZodObject<any>,
  path: keyof FlattenObject<ObjectData>,
) {
  const validator = convertZodObjToZodType<ObjectData>(zodObject, path)
  return convertZodAnyToQuasarRules(validator)
}
