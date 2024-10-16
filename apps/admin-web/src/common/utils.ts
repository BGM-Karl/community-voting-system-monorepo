import type { Component } from 'vue'
import type { ExtractComponentParam, ExtractComponentSlot } from '../types'
import { diff } from 'deep-object-diff'
import { flatten, unflatten } from 'flat'
import { cloneDeep, get, hasIn, isEqual, set, toArray } from 'lodash-es'
import { pipe as ramdaPipe } from 'ramda'
import { isPlainObject, pipe } from 'remeda'
import { h } from 'vue'

/** 比較兩物件是否在所有指定路徑接相等 */
export function isEqualObject(value: any, other: any, paths: string[]): boolean {
  const anyNot = paths.some((path) =>
    !isEqual(get(value, path), get(other, path)),
  )

  return !anyNot
}

/** 元件繼承參數
 *
 * [文件](https://cn.vuejs.org/guide/components/attrs.html#fallthrough-attributes)
 */
export interface InheritAttr {
  class?: string;
  onClick?: (event: MouseEvent) => void;
}

/** Veu h function 有型別推導的版本
 *
 * [何謂 h function](https://cn.vuejs.org/guide/extras/render-function.html)
 *
 * @param component Vue SFC 元件或 element 名稱
 * @param prop SFC 內所有參數，包含 class、style、event 等等
 * @param slot SFC 插槽
 * @returns
 *
 */
export function typedH(
  component: string,
  prop?: string,
): ReturnType<typeof h>
export function typedH<Comp extends Component>(
  component: Comp,
  param?: ExtractComponentParam<Comp> & InheritAttr,
  slot?: ExtractComponentSlot<Comp>,
): ReturnType<typeof h>
export function typedH(
  component: any,
  param?: any,
  slot?: any,
) {
  if (!slot) {
    return h(component, param)
  }
  return h(component, param, slot)
}

export function toPriceFormat(value: number | string, locales?: string) {
  return pipe(
    value,
    (data) => {
      if (typeof data === 'string') {
        return Number.parseFloat(data)
      }
      return data
    },
    (data) => data.toLocaleString(locales),
  )
}

/**
 * 將新舊值做 diff ，並回傳要更新的部分
 * @param oldDatum 舊值
 * @param newDatum 新值
 */
export function diffObject<
  ReturnData = unknown,
>(config: {
  oldDatum?: unknown;
  newDatum: unknown;
}): ReturnData {
  const { oldDatum, newDatum } = config
  if (!isPlainObject(newDatum)) {
    throw new Error('newDatum 必須為物件')
  }
  if (!oldDatum)
    return flatten(newDatum)
  if (!isPlainObject(oldDatum)) {
    throw new Error('oldDatum 必須為物件')
  }

  // 將新舊值做flatten
  const oldDatumFlatten = flatten(oldDatum, { safe: true }) as Record<string, unknown>
  const newDatumFlatten = flatten(newDatum, { safe: true }) as Record<string, unknown>
  // 做 diff 找出要更新的地方
  const diffResult = diff(oldDatumFlatten, newDatumFlatten)
  console.log('🚀 ~ diffResult:', diffResult)

  // 因為 做 diff 會把 array 的結構破壞
  // 將 diff 後的結果做 flatten 再做 unflatten 把，接著做 safe 的 flatten ，就能將 array 轉回原本樣子
  const diffResultFlatten = ramdaPipe(
    () => flatten<object, object>(diffResult),
    (_diffResult) => unflatten<Record<string, any>, Record<string, any>>(_diffResult),
    (_diffResult) => flatten<object, object>(_diffResult, { safe: true }),
  )()

  // 取出 new 中的所有array key
  const keysIsArray = ramdaPipe(
    () => cloneDeep(newDatumFlatten),
    (obj) => Object.entries(obj).filter(([key, value]) => Array.isArray(value)),
    (obj) => Object.values(obj).map(([key, value]) => key),
  )()

  // 確認 diff 後的結果有沒有 array，有的話，從 newDatumFlatten 中取出，覆蓋 diff 中的結果
  keysIsArray.forEach((path: any) => {
    if (hasIn(diffResultFlatten, path)) {
      set(diffResultFlatten, path, toArray(get(newDatumFlatten, path)))
    }
  })

  return unflatten(diffResultFlatten) as ReturnData
}
