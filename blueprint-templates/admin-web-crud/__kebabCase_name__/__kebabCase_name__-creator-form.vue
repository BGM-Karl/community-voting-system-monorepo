<template>
  <div class="w-full">
    <q-form
      ref="formElement"
      @submit="handleSubmit"
      @validation-error="emit('validationError', $event)"
      @reset="emit('reset')"
    >
      <q-card class="min-w-[30rem]">
        <q-card-section>
          <div class="mb-3 text-lg font-bold">
            ｛｛ props.title || '新增會員角色' ｝｝
            <q-icon
              name="help"
              class="-mt-0.5 !text-gray-300"
            >
              <q-tooltip>說明</q-tooltip>
            </q-icon>
          </div>

          <div>
            <!-- Block1 Start -->
            <div class="basis-[calc(50%_-_20px)]">
              <div class="sticky left-0 top-[-1px] z-10 basis-full bg-white py-3 text-base font-bold">
                ｛｛ create{{pascalCase name}}DtoSchema.description || '基本資訊' ｝｝
              </div>
              <div
                v-if="createForm"
                class="flex flex-col gap-2"
              >
                <basic-form-layout label="基本資料">
                  <q-input
                    v-bind="basicCreateInputOption('name')"
                    v-model="createForm.name"
                  />
                </basic-form-layout>
              </div>
            </div>
            <!-- Block1 End -->
          </div>
        </q-card-section>
        <q-card-actions class="sticky bottom-0 z-10 w-full bg-white shadow">
          <div class="w-full flex gap-2 pb-3 pr-2">
            <q-btn
              color="primary"
              label="清除"
              flat
              @click="
                emit('reset'); handleReset();
              "
            />
            <q-space />
            <q-btn
              v-close-popup
              color="primary"
              label="取消"
              class="w-20"
              flat
            />
            <q-btn
              type="submit"
              color="primary"
              label="確認"
              class="w-20"
            />
          </div>
        </q-card-actions>
      </q-card>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import type {
  FlattenObject,
} from '@community-voting-system/shared'
import type { Component } from 'vue'
import type { {{pascalCase name}} } from './{{kebabCase name}}.contract'
import {
  convertZodObjToQuasarRules,
  convertZodObjToZodType,
} from '@community-voting-system/shared'
import { cloneDeep, isString } from 'lodash-es'
import { QForm, useFormChild } from 'quasar'

import { nextTick, ref } from 'vue'
import { confirmDialog, fieldDefaultStyle } from '../../common/utils-quasar'
import BasicFormLayout from '../../layout/basic-form-layout.vue'
import { create{{pascalCase name}}DtoSchema, {{camelCase name}}CreatorFormDefault } from './{{kebabCase name}}.contract'

interface Props {
  innerForm?: boolean;
  title?: string;
}
const emit = defineEmits<{
  (e: 'submit', value: typeof createForm.value): void;
  (e: 'error', value: ReturnType<typeof onError>): void;
  (e: 'reset'): void;
  (e: 'validationError', value: Component): void;
}>()

const props = withDefaults(defineProps<Props>(), {
  innerForm: false,
  title: '',
}) as Props

const formElement = ref<InstanceType<typeof QForm>>()
useFormChild({
  requiresQForm: props.innerForm,
  validate: () => {
    if (!formElement.value)
      return false
    return formElement.value?.validate()
  },
})

function onError(error: Error | string) {
  return isString(error) ? new Error(error) : error
}

const createForm = ref<{{pascalCase name}}['request']['create']['body']>(cloneDeep({{camelCase name}}CreatorFormDefault))

async function handleReset() {
  formElement.value?.reset()
  await nextTick()
  formElement.value?.resetValidation()
  formElement.value?.focus()
  createForm.value = cloneDeep({{camelCase name}}CreatorFormDefault)
}

async function handleSubmit() {
  if (
    (await confirmDialog({
      title: '是否繼續？',
      message: '確定要新增嗎？',
      cancel: true,
    })) === false
  ) {
    return
  }
  const result = create{{pascalCase name}}DtoSchema.safeParse(createForm.value)
  if (!result.success) {
    console.error(result.error)

    emit('error', new Error(`參數錯誤${result.error.message}`))
    return
  }
  emit('submit', createForm.value)
}

function basicCreateInputOption(key: keyof FlattenObject<typeof createForm.value>, enumOption = false) {
  const zodRule = convertZodObjToQuasarRules<typeof createForm.value>(
    create{{pascalCase name}}DtoSchema,
    key,
  )
  const zodObj = convertZodObjToZodType<typeof createForm.value>(create{{pascalCase name}}DtoSchema, key)
  let options: string[] | undefined
  if (enumOption) {
    options = zodObj._def.values
  }
  return {
    ...fieldDefaultStyle,
    label: zodObj.description,
    rules: [zodRule],
    options,
  }
}
</script>

<style scoped></style>
