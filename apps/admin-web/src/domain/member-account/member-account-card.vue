<template>
  <div>
    <div v-if="props.mode === 'simple'">
      {{ props.data.name }}({{ props.data.description }})
    </div>
    <div v-else-if="props.mode === 'detail'">
      <div>{{ props.data.name }}({{ props.data.description }})</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MemberAccount } from './member-account.contract'

interface Props {
  /** 顯示模式
   * - 簡單模式
   * - 詳細模式
   */
  mode?: 'simple' | 'detail';
  data: MemberAccount['basic'];
}
const props = withDefaults(defineProps<Props>(), {
  mode: 'simple',
})
</script>

<style scoped></style>
