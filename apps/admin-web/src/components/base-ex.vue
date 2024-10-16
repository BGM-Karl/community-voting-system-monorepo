<!-- <template></template> -->

<script setup lang="ts">
interface Prop {
  label?: string;
}
const prop = withDefaults(defineProps<Prop>(), {
  label: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>()
</script>

<style scoped lang="sass">
</style>
