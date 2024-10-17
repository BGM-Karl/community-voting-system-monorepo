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

export function convertZodAnyToQuasarRules(validator: ZodTypeAny) {
  return (item: any) => {
    const result = validator?.safeParse(item)
    if (!result)
      return 'ERROR'
    if (result.success)
      return true
    return result.error.issues[0]?.message ?? 'ERROR'
  }
}

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
