<template>
  <div class="border border-[#d7d7d7] rounded-md p-3">
    <div class="select-none text-xs text-gray-500">
      {{ props.label }}
    </div>
    <div class="w-full flex flex-col flex-nowrap gap-2 px-3 pt-3">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string;
}
const props = withDefaults(defineProps<Props>(), {
  label: '',
})
</script>

<style scoped></style>
