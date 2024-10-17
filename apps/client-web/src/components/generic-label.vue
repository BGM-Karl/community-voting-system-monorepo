<template>
  <div class="">
    <div class="">
      label type ：{{ typeofResult }}
    </div>
    <slot :label="label" />
  </div>
</template>

<script setup lang="ts" generic="Label">

import { computed, ref } from 'vue';

interface Props {
  label: Label;
}
const props = withDefaults(defineProps<Props>(), {});

const emit = defineEmits<{
  'update:label': [value: Label]
}>();

defineSlots<{
  default?: (props: { label: Label }) => any
}>();

const typeofResult = computed(() => typeof props.label);
const label = computed(() => props.label);
</script>

<style scoped lang="sass">
</style>
