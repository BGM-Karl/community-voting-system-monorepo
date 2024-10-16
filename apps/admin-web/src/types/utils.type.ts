import type { DefineComponent } from 'vue'

/** 提取 Vue Component 之內部 props
 *
 * 會將 style、class、event 全部取出來
 */
export type ExtractComponentParam<TComponent> =
  TComponent extends new () => { $props: infer P } ? NonNullable<P> :
  TComponent extends (props: infer P, ...args: any) => any ? P :
  never

/** 提取 Vue Component slots */
export type ExtractComponentSlot<TComponent> =
  TComponent extends new () => {
    $slots: infer P;
  }
  ? P
  : never

/** 提取 Vue SFC 之 props 參數部分
 *
 * 也就是 setup script 之 Props 定義。
 */
export type ExtractComponentProp<TComponent> =
  TComponent extends DefineComponent<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    infer P,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >
  ? P
  : never
