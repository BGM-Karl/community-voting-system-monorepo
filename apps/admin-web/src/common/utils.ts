import type { Component } from 'vue'
import type { ExtractComponentParam, ExtractComponentSlot } from '../types'
import { diff } from 'deep-object-diff'
import { flatten, unflatten } from 'flat'
import { cloneDeep, get, hasIn, isEqual, set, toArray } from 'lodash-es'
import { pipe as ramdaPipe } from 'ramda'
import { isPlainObject, pipe } from 'remeda'
import { h } from 'vue'

export function isEqualObject(value: any, other: any, paths: string[]): boolean {
  const anyNot = paths.some((path) =>
    !isEqual(get(value, path), get(other, path)),
  )

  return !anyNot
}

export interface InheritAttr {
  class?: string;
  onClick?: (event: MouseEvent) => void;
}

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

export function diffObject<
  ReturnData = unknown,
>(config: {
  oldDatum?: unknown;
  newDatum: unknown;
}): ReturnData {
  const { oldDatum, newDatum } = config
  if (!isPlainObject(newDatum)) {
    throw new Error('newDatum error')
  }
  if (!oldDatum)
    return flatten(newDatum)
  if (!isPlainObject(oldDatum)) {
    throw new Error('oldDatum error')
  }

  const oldDatumFlatten = flatten(oldDatum, { safe: true }) as Record<string, unknown>
  const newDatumFlatten = flatten(newDatum, { safe: true }) as Record<string, unknown>
  const diffResult = diff(oldDatumFlatten, newDatumFlatten)
  console.log('🚀 ~ diffResult:', diffResult)

  const diffResultFlatten = ramdaPipe(
    () => flatten<object, object>(diffResult),
    (_diffResult) => unflatten<Record<string, any>, Record<string, any>>(_diffResult),
    (_diffResult) => flatten<object, object>(_diffResult, { safe: true }),
  )()

  const keysIsArray = ramdaPipe(
    () => cloneDeep(newDatumFlatten),
    (obj) => Object.entries(obj).filter(([key, value]) => Array.isArray(value)),
    (obj) => Object.values(obj).map(([key, value]) => key),
  )()

  keysIsArray.forEach((path: any) => {
    if (hasIn(diffResultFlatten, path)) {
      set(diffResultFlatten, path, toArray(get(newDatumFlatten, path)))
    }
  })

  return unflatten(diffResultFlatten) as ReturnData
}
