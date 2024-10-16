<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card class="flex flex-col justify-between p-1 min-w-[400px] min-h-[150px]">
      <q-card-section class=" flex items-center">
        <q-avatar
          :icon="props.icon.name"
          color="white"
          :text-color="props.icon.color"
          :font-size="props.icon.size"
          square
        />
        <span class=" ml-6 text-xl text-[#5E5E5E]">
          {{ props.message }}
        </span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          v-for="btn in props.actions"
          :key="btn.action"
          :color="btn.color"
          :text-color="getTextColor(btn.textColor, btn.type)"
          :style="getTypeStyle(btn.type)"
          unelevated
          :size="btn.size"
          :padding="btn.padding"
          @click="handleOKClick(btn.action)"
        >
          {{ btn.label }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cloneDeep, defaultsDeep } from 'lodash-es';
import { useDialogPluginComponent } from 'quasar';
import { map, pipe } from 'ramda';

export type BtnType = 'negative';

interface Action {
  /** 動作 */
  action: string;
  /** 類型 */
  type?: BtnType;
  /** 內容 */
  label: string;
  /** 背景顏色 */
  color?: string;
  padding?: string;
  /** 文字顏色 */
  textColor?: string;
  size?: string;
}

export interface Props {
  icon?: {
    /** 名稱
     * @default notifications
     */
    name?: string;
    /** 顏色
     * @default warning
     */
    color?: string;
    /** @default 50px */
    size?: string;
  };
  /** 訊息
   * @default 確定是否執行此動作？
   */
  message?: string;
  /** 按鈕
   * @default 確定(y)、取消(n)
   */
  actions?: Action[];
}

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent<string>()

const defaultAction = {
  textColor: 'primary',
  size: '16px',
}

const defaultProps: Required<Props> = {
  icon: {
    name: 'notifications',
    color: 'warning',
    size: '50px',
  },
  message: '確定是否執行此動作？',
  actions: [
    {
      action: 'y',
      label: '確認',
      ...defaultAction,
    },
    {
      action: 'n',
      label: '取消',
      ...defaultAction,
    },
  ]
}

const _props = defineProps<Props>();
const props = computed(() => pipe(
  () => defaultsDeep(cloneDeep(_props), defaultProps),
  (props: Required<Props>) => {
    const actions = _props.actions?.map((action) => defaultsDeep(action, defaultAction))
      ?? defaultProps.actions;
    return {
      ...props, actions
    }
  },
)());

const emit = defineEmits({
  ...useDialogPluginComponent.emitsObject
});

const styleMap: Record<BtnType, string> = {
  negative: 'background: #FEE2E2; color: #C10015;',
}

function handleOKClick(action: string) {
  onDialogOK(action);
}

function getTypeStyle(type: BtnType) {
  if (!type) {
    return undefined;
  }

  return styleMap[type];
}

function getTextColor(color?: string, type?: BtnType) {
  if (type) {
    return undefined;
  }

  return color ?? 'primary'
}
</script>

<style scoped lang="sass">
</style>
