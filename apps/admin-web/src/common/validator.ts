/** 各類表單驗證 function FP 版本 */

import type { ValidationRule } from 'quasar'
import { isNil } from 'lodash-es'

/** 建立符合 Quasar field rule 參數 */
export function createRule(rules: any[], message: string) {
  return [
    eitherAny(...rules, () => message),
  ] as unknown as ValidationRule[]
}

/** either 任意數量參數版本
 *
 * 配合 quasar 的 rule，可以這樣建立：
 * ```
 * const isIframeRule: ValidationRule[] = [
 *   eitherAny(isIframe, always('必須為有效的 iframe 標籤')),
 * ];
 * const notEmptyRule: ValidationRule[] = [
 *   eitherAny(notEmpty, always('請輸入文字')),
 * ];
 * ```
 *
 * 可串聯多個驗證
 * ```
 * // 可選數值輸入框
 * const numberRule: ValidationRule[] = [
 *   eitherAny(isOptional, isPositiveNumber, always('必須為大於零正整數')),
 * ];
 * ```
 */
export function eitherAny(...fns: any[]) {
  // return reduce(either, fns[0], fns.slice(1));
}

/** 數值是否大於零之正整數 */
export function isPositiveNumberGreaterThan0(value: any) {
  return /^0*[1-9]\d*$/.test(`${value}`)
}

/** 數值是否正整數 */
export function isPositiveNumber(value: any) {
  return /^\d+$/.test(`${value}`)
}

/**
 * 數值是否為 `null`、`undefined`、`''`、`[]`
 */
export function isOptional(value: any) {
  if (Array.isArray(value)) {
    return value.length === 0
  }

  return isNil(value) || value === ''
}
/** isOptional 的反轉 */
export function notEmpty(value: any) {
  return !isOptional(value)
}

/** 僅限 YYYY-MM-DD 格式 */
export function isDate(value: any) {
  const regex = /^(\d{4})-(\d{2})-(\d{2})$/
  if (!regex.test(value)) {
    return false
  }

  const [, year, month, day] = (regex.exec(value) as RegExpExecArray).map(Number)
  const date = new Date(year!, month! - 1, day)

  if (date.getFullYear() !== year
    || date.getMonth() + 1 !== month
    || date.getDate() !== day) {
    return false
  }

  return true
}
