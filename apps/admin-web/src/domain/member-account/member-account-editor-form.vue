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
            {{ props.title }}
          </div>

          <div v-if="updateForm">
            <!-- Block1 Start -->
            <div class="basis-[calc(50%_-_20px)]">
              <div class="sticky left-0 top-[-1px] z-10 basis-full bg-white py-3 text-base font-bold">
                {{ updateMemberAccountDtoSchema.description || 'Basic information' }}
              </div>
              <div class="flex flex-col gap-2">
                <basic-form-layout label="Basic information">
                  <q-input
                    v-bind="basicUpdateInputOption('name')"
                    v-model="updateForm.name"
                    label="Household name"
                    :hint="`username：${props.originalBaseFormData.username}`"
                  />

                  <q-input
                    v-bind="basicUpdateInputOption('password')"
                    v-model="updateForm.password"
                    label="password"
                  />
                  <q-input
                    v-bind="basicUpdateInputOption('weight')"
                    v-model.number="updateForm.weight"
                    label="weight"
                  />
                  <q-input
                    v-bind="basicUpdateInputOption('description')"
                    v-model="updateForm.description"
                    label="describe"
                    type="textarea"
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
              label="Clear"
              flat
              @click="
                emit('reset'); handleReset();
              "
            />
            <q-space />
            <q-btn
              v-close-popup
              color="primary"
              label="Cancel"
              class="w-20"
              flat
            />
            <q-btn
              type="submit"
              color="primary"
              label="ok"
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
import type { MemberAccount } from './member-account.contract'
import {
  convertZodObjToQuasarRules,
  convertZodObjToZodType,
} from '@community-voting-system/shared'
import { defaultsDeep } from 'lodash-es'

import { QForm, QInput, useFormChild } from 'quasar'
import { clone, isString, omit, pipe } from 'remeda'
import { nextTick, ref } from 'vue'
import { diffObject } from '../../common/utils'
import { confirmDialog, fieldDefaultStyle } from '../../common/utils-quasar'
import BasicFormLayout from '../../layout/basic-form-layout.vue'
import { createMemberAccountDtoSchema, memberAccountCreatorFormDefault, updateMemberAccountDtoSchema } from './member-account.contract'

const emit = defineEmits<{
  (e: 'submit', value: typeof updateForm.value): void;
  (e: 'error', value: ReturnType<typeof onError>): void;
  (e: 'reset'): void;
  (e: 'validationError', value: Component): void;
}>()

interface Props {
  innerForm?: boolean;
  title?: string;
  originalBaseFormData: MemberAccount['basic'];
}
const props = withDefaults(defineProps<Props>(), {
  innerForm: false,
  title: '',
}) as Props

/**
 * 用來儲存表單資料的地方(新資料)
 */
const updateForm = ref(
  pipe(props.originalBaseFormData, clone, baseToUpdate),
)

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

async function handleReset() {
  formElement.value?.reset()
  await nextTick()
  formElement.value?.resetValidation()
  formElement.value?.focus()
  updateForm.value = baseToUpdate(props.originalBaseFormData)
}

async function handleSubmit() {
  if (
    (await confirmDialog({
      title: 'Do you want to continue? ',
      message: 'Are you sure you want to edit? ',
      cancel: true,
    })) === false
  ) {
    return
  }
  const result = updateMemberAccountDtoSchema.safeParse(updateForm.value)
  if (!result.success) {
    console.error(result.error)

    emit('error', new Error(`參數錯誤${result.error.message}`))
    return
  }

  const data = diffObject({
    newDatum: result.data,
    oldDatum: baseToUpdate(props.originalBaseFormData),
  }) as typeof updateForm.value
  console.log(
    '🚀 ~ file: memberAccount-editor-from.vue:298 ~ handleSubmit ~ data:',
    data,
  )
  emit('submit', data)
}

/** 將 base 的資料轉換成 update */
function baseToUpdate(
  data: Props['originalBaseFormData'],
): NonNullable<MemberAccount['request']['update']['body']> {
  return pipe(
    data,
    (val) => clone(val),
    (data) => omit(data, [
      'id',
      'timestamp',
    ]),
    (data) => ({
      ...data,
      // 關聯資料的 Id todo 修改
      // belongProductSupplierList: filter(parseRelation('idList', data.belongProductSupplierList), isTruthy),
    } satisfies NonNullable<MemberAccount['request']['update']['body']>),
    (data) => defaultsDeep(data, memberAccountCreatorFormDefault),
  )
}

function basicUpdateInputOption(key: keyof FlattenObject<typeof updateForm.value>, enumOption = false) {
  const zodRule = convertZodObjToQuasarRules<typeof updateForm.value>(
    updateMemberAccountDtoSchema,
    key,
  )
  const createZodObj = convertZodObjToZodType(createMemberAccountDtoSchema, key)
  const updateZodObj = convertZodObjToZodType<typeof updateForm.value>(updateMemberAccountDtoSchema, key)
  let options: string[] | undefined
  if (enumOption) {
    options = updateZodObj._def.values
  }
  return {
    ...fieldDefaultStyle,
    label: updateZodObj.description ?? createZodObj.description,
    rules: [zodRule],
  }
}
</script>

<style scoped></style>
