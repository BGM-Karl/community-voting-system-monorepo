import { isEqual, get, isObject } from "lodash-es";
import { either, pipeWith, reduce } from "ramda";
import { Component, h } from "vue";
import { ExtractComponentProps, ExtractComponentSlots, SimplifyToObjectIdDeep } from "../types";

/** 比較兩物件是否在所有指定路徑接相等 */
export function isEqualObject(value: any, other: any, paths: string[]): boolean {
  const anyNot = paths.some((path) =>
    !isEqual(get(value, path), get(other, path))
  );

  return !anyNot;
}

/** 提取並替換 Mongo Document 物件 _id 部分，
 * 用於將 form 物件資料內的關聯欄位轉換成更新用資料。
 * 
 * @example
 * ```typescript
 * // 例如目前的 form 為：
 * const data = {
 *   a: 1,
 *   b: {
 *     _id: '2'
 *   },
 *   c: [
 *     {
 *       data: 3,
 *       d: {
 *         _id: '4',
 *       }
 *     }
 *   ]
 * }
 * 
 * // 可以看出含有 _id 的物件是關聯資料，變更的時候應該只給 _id，而不是整個物件。
 * // 得 API 傳輸的變更用資料為：
 * const data = {
 *   a: 1,
 *   b: '2',
 *   c: [
 *     {
 *       data: 3,
 *       d: '4'
 *     }
 *   ]
 * }
 * ```
 */
export function simplifyToDocIdDeep<Data>(object: Data):
  Data extends object ? SimplifyToObjectIdDeep<Data> : Data {
  // 一般型別
  if (!isObject(object)) {
    const value: any = object;
    return value;
  }

  // 矩陣
  if (Array.isArray(object)) {
    const result: any = object.map(simplifyToDocIdDeep);
    return result;
  }

  // 單層
  if (object && '_id' in object) {
    return object._id as any;
  }

  // 深層物件
  const result: any = {};

  Object.entries((object as any)).forEach(([key, value]: [string, any]) => {
    if (Array.isArray(value)) {
      const newValue = value.map(simplifyToDocIdDeep);
      result[key] = newValue;
      return;
    }

    if (typeof value === 'object') {
      if ('_id' in value) {
        result[key] = value._id;
        return;
      }

      const newValue = simplifyToDocIdDeep(value);
      result[key] = newValue;
      return;
    }

    result[key] = value;
  });

  return result;
}

/** 元件繼承參數
 * 
 * [文檔](https://cn.vuejs.org/guide/components/attrs.html#fallthrough-attributes)
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
 * @param props SFC 內所有參數，包含 class、style、event 等等
 * @param slots SFC 插槽
 * @returns 
 * 
 */
export function typedH(
  component: string,
  props?: string,
): ReturnType<typeof h>
export function typedH<Comp extends Component>(
  component: Comp,
  props?: ExtractComponentProps<Comp> & InheritAttr,
  slots?: ExtractComponentSlots<Comp>,
): ReturnType<typeof h>
export function typedH(
  component: any,
  props?: any,
  slots?: any,
) {
  if (!slots) {
    return h(component, props);
  }
  return h(component, props, slots);
}

