import type { DialogChainObject, QDialogProps } from 'quasar'
import type { Component } from 'vue'
import type { ZodTypeAny } from 'zod'
import type { ExtractComponentProp, ExtractComponentSlot } from '../types'
import { Dialog, QDialog, QImg } from 'quasar'
import { h } from 'vue'

export const fieldDefaultStyle = {
  outlined: true,
  bgColor: 'white',
  hideBottomSpace: true,
}

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

/** 將 zodObj 的驗證資訊轉換成 quasar 的 rule function */
export function dialogPromisify<Result = 'y' | 'n'>(dialog: DialogChainObject) {
  return new Promise<Result>((resolve, reject) => {
    dialog
      .onOk(resolve)
      // eslint-disable-next-line prefer-promise-reject-errors
      .onCancel(() => reject('cancel'))
      // eslint-disable-next-line prefer-promise-reject-errors
      .onDismiss(() => reject('dismiss'))
  })
}

/** 將 Vue SFC 元件包装為 QDialog，可以更簡單配合 $q.dialog 使用
 *
 * @param component Vue SFC 元件
 * @param props SFC 內所有參數，包含 class、style、event 等等
 * @param dialogProps QDialog 原本參數
 *
 * @example
 * ```typescript
 * const component = wrapWithDialog(BrandEditStatusForm, {
 *   data,
 *   onSuccess() {
 *     dialog.hide();
 *     handleEditSuccess();
 *   },
 * });
 *
 * const dialog = $q.dialog({ component });
 * ```
 *
 * @example
 * ```typescript
 * $q.dialog({
 *   component: wrapWithDialog(
 *     BrandLog,
 *     {
 *       data,
 *       class: 'w-full'
 *     },
 *     {
 *       fullHeight: true,
 *     }
 *   ),
 * });
 * ```
 */
export function wrapWithDialog<Comp extends Component>(
  component: Comp,
  props?: ExtractComponentProp<Comp>,
  slots?: ExtractComponentSlot<Comp>,
  dialogProps?: QDialogProps,
) {
  return h(QDialog, dialogProps, {
    default: () => h(component, props ?? {}, slots ?? {}),
  })
}

/** 使用 Quasar Dialog 開啟元件
 *
 * @param component Vue SFC 元件
 * @param props SFC 內所有參數，包含 class、style、event 等等
 * @param slots SFC 插槽
 * @param dialogProps QDialog 原本參數
 * @returns
 *
 * @example
 * ```typescript
 * const dialog = openUsingDialog(BrandEditStatusForm, {
 *   data,
 *   onSuccess() {
 *     dialog.hide();
 *     handleEditSuccess();
 *   },
 * });
 * ```
 */
export function openUsingDialog<T extends Component>(
  component: T,
  props?: ExtractComponentProp<T>,
  slots?: ExtractComponentSlot<T>,
  dialogProps?: QDialogProps,
) {
  return Dialog.create({
    component: wrapWithDialog(component, props, slots, dialogProps),
  })
}

export function qImageDialog(src: string) {
  const component = wrapWithDialog(QImg, { src } as any)
  return Dialog.create({ component })
}

/**
 * 用 quasar dialog 做 confirm，並回傳 boolean
 */
export function confirmDialog(config: {
  title: string;
  message: string;
  cancel?: boolean;
}) {
  return new Promise<boolean>((resolve, reject) => {
    Dialog.create({
      title: config.title,
      message: config.message,
      cancel: config.cancel,
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false))
      .onDismiss(() => resolve(false))
  })
}
