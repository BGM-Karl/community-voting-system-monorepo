import { DefineComponent } from "vue";
/** 提取並替換 Mongo Document 物件 _id 部分，
 * 用於將 form 物件資料內的關聯欄位轉換成更新用資料。
 * 
 * @examples
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
export type SimplifyToObjectIdDeep<T> =
  T extends Array<any> ? SimplifyToObjectIdDeep<T[number]>[] :
  /** 特殊物件要轉換成 mongo id */
  T extends { _id: string } ? string :
  T extends object ? { [K in keyof T]: SimplifyToObjectIdDeep<T[K]> } :
  T;

/** 提取 Vue Component 之內部 props
 * 
 * 會將 style、class、event 全部取出來
 */
export type ExtractComponentProps<TComponent> =
  TComponent extends new () => {
    $props: infer P;
  }
  ? P
  : never;

/** 提取 Vue Component slots */
export type ExtractComponentSlots<TComponent> =
  TComponent extends new () => {
    $slots: infer P;
  }
  ? P
  : never;


/** 提取 Vue SFC 之 props 參數部分
 * 
 * 也就是 setup script 之 Props 定義。
 */
export type ExtractComponentParam<TComponent> =
  TComponent extends DefineComponent<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    infer P, any, any, any, any, any, any, any, any
  >
  ? P
  : never;