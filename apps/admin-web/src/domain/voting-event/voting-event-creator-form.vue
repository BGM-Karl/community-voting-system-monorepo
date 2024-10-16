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
            {{ props.title || '新增會員角色' }}
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
                {{ createVotingEventDtoSchema.description || '基本資訊' }}
              </div>
              <div
                v-if="createForm"
                class="flex flex-col gap-2"
              >
                <basic-form-layout label="基本資料">
                  <q-input
                    v-bind="basicCreateInputOption('title')"
                    v-model="createForm.title"
                    label="標題"
                  />
                  <q-input
                    v-bind="basicCreateInputOption('description')"
                    v-model="createForm.description"
                    label="描述"
                    type="textarea"
                  />
                  <div>
                    <q-input
                      v-bind="basicCreateInputOption('startAt')"
                      v-model="createForm.startAt"
                      label="開始時間"
                      :rules="[() => !!createForm.startAt || '開始時間為必填']"
                      hint="預設是現在時間"
                    />
                    <q-popup-proxy :breakpoint="2000">
                      <div class="flex flex-nowrap !max-w-[600px]">
                        <q-date
                          v-model="createForm.startAt"
                          mask="YYYY-MM-DD HH:mm"
                          flat
                          today-btn
                          square
                        />
                        <q-time
                          v-model="createForm.startAt"
                          mask="YYYY-MM-DD HH:mm"
                          flat
                          today-btn
                          square
                        />
                      </div>
                    </q-popup-proxy>
                  </div>

                  <div>
                    <q-input
                      v-bind="basicCreateInputOption('endAt')"
                      v-model="createForm.endAt"
                      label="結束時間"
                      :rules="[() => !!createForm.endAt || '結束時間為必填']"
                      hint="預設是現在時間+5分鐘"
                    />
                    <q-popup-proxy :breakpoint="2000">
                      <div class="flex flex-nowrap !max-w-[600px]">
                        <q-date
                          v-model="createForm.endAt"
                          mask="YYYY-MM-DD HH:mm"
                          flat
                          today-btn
                          square
                        />
                        <q-time
                          v-model="createForm.endAt"
                          mask="YYYY-MM-DD HH:mm"
                          flat
                          today-btn
                          square
                        />
                      </div>
                    </q-popup-proxy>
                  </div>
                </basic-form-layout>
                <basic-form-layout label="選項參數">
                  <q-input
                    v-bind="basicCreateInputOption('maxSelectableOptions')"
                    v-model.number="createForm.maxSelectableOptions"
                    label="最大選擇數"
                  />
                  <q-input
                    v-bind="basicCreateInputOption('requiredParticipationRate')"
                    v-model.number="createForm.requiredParticipationRate"
                    label="通過住戶參與人數比例"
                  />
                  <q-input
                    v-bind="basicCreateInputOption('requiredWeightRate')"
                    v-model.number="createForm.requiredWeightRate"
                    label="通過住戶參與權重比例"
                  />
                  <q-input
                    v-bind="basicCreateInputOption('totalHouseholds')"
                    v-model.number="createForm.totalHouseholds"
                    label="全部住戶人數"
                  />
                  <q-input
                    v-bind="basicCreateInputOption('totalWeight')"
                    v-model.number="createForm.totalWeight"
                    label="全部住戶人數權重"
                  />
                  <q-input
                    v-bind="basicCreateInputOption('options', true)"
                    :model-value="createForm.options.map((v) => v.content).join(', ')"
                    label="選項"
                    hint="請用逗號分隔"
                    :rules="[() => createForm.options.length > 1 || '選項至少要有兩個']"
                    @update:model-value="createForm.options = ($event as string).split(',').map((v) => ({ content: v.trim() }))"
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
import type { VotingEvent } from './voting-event.contract'
import {
  convertZodObjToQuasarRules,
  convertZodObjToZodType,
} from '@community-voting-system/shared'
import dayjs from 'dayjs'
import { cloneDeep, isString } from 'lodash-es'

import { QForm, useFormChild } from 'quasar'
import { nextTick, ref } from 'vue'
import { confirmDialog, fieldDefaultStyle } from '../../common/utils-quasar'
import BasicFormLayout from '../../layout/basic-form-layout.vue'
import { createVotingEventDtoSchema, votingEventCreatorFormDefault } from './voting-event.contract'

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

const createForm = ref<VotingEvent['request']['create']['body']>(cloneDeep(votingEventCreatorFormDefault))

async function handleReset() {
  formElement.value?.reset()
  await nextTick()
  formElement.value?.resetValidation()
  formElement.value?.focus()
  createForm.value = cloneDeep(votingEventCreatorFormDefault)
}

async function handleSubmit() {
  createForm.value.startAt = dayjs(createForm.value.startAt).toISOString()
  createForm.value.endAt = dayjs(createForm.value.endAt).toISOString()
  if (
    (await confirmDialog({
      title: '是否繼續？',
      message: '確定要新增嗎？',
      cancel: true,
    })) === false
  ) {
    return
  }
  const result = createVotingEventDtoSchema.safeParse(createForm.value)
  if (!result.success) {
    console.error(result.error)

    emit('error', new Error(`參數錯誤${result.error.message}`))
    return
  }
  emit('submit', createForm.value)
}

function basicCreateInputOption(key: keyof FlattenObject<typeof createForm.value>, enumOption = false) {
  const zodRule = convertZodObjToQuasarRules<typeof createForm.value>(
    createVotingEventDtoSchema,
    key,
  )
  const zodObj = convertZodObjToZodType<typeof createForm.value>(createVotingEventDtoSchema, key)
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
