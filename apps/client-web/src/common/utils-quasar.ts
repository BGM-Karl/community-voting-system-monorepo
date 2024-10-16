import {
  Dialog,
  DialogChainObject,
  QDialog, QDialogProps
} from "quasar";
import { Component, h } from "vue";
import { ExtractComponentProps, ExtractComponentSlots } from "../types";

/** 可以將 Quasar Dialog Plugin 包裝為 Promise
 * 
 * onCancel、onDismiss 事件則分別回傳 `reject('cancel')`、`reject('dismiss')`，
 * 
 * 如果使用 BaseDialog，預設回傳 'y'|'n'，若調整 Action 內容，記得泛型調整回傳結果
 * 
 * @example
 * ```typescript
 * dialogPromisify(
 *   $q.dialog({
 *     component: BaseDialog,
 *     componentProps,
 *   })
 * ).then((result: 'y' | 'n') => {
 *
 * }).catch((event: 'cancel' | 'dismiss') => {
 *
 * });
 * ```
 */
export function dialogPromisify<Result = 'y' | 'n'>(dialog: DialogChainObject) {
  return new Promise<Result>((resolve, reject) => {
    dialog
      .onOk(resolve)
      .onCancel(() => reject('cancel'))
      .onDismiss(() => reject('dismiss'));
  });
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
  props?: ExtractComponentProps<Comp>,
  slots?: ExtractComponentSlots<Comp>,
  dialogProps?: QDialogProps,
) {

  return h(QDialog, dialogProps, {
    default: () => h(component, props ?? {}, slots ?? {})
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
  props?: ExtractComponentProps<T>,
  slots?: ExtractComponentSlots<T>,
  dialogProps?: QDialogProps,
) {
  return Dialog.create({
    component: wrapWithDialog(
      component, props, slots, dialogProps
    ),
  });
}

