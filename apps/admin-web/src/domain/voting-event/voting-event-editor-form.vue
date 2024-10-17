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
            {{ props.title}}
          </div>

          <div v-if="updateForm">
            <!-- Block1 Start -->
            <div class="basis-[calc(50%_-_20px)]">
              <div class="sticky left-0 top-[-1px] z-10 basis-full bg-white py-3 text-base font-bold">
                {{ updateVotingEventDtoSchema.description || 'Basic information' }}
              </div>
              <div class="flex flex-col gap-2">
                <basic-form-layout label="Basic information">
                  <q-input
                    v-bind="basicUpdateInputOption('title')"
                    v-model="updateForm.title"
                    label="Title"
                  />
                  <q-input
                    v-bind="basicUpdateInputOption('description')"
                    v-model="updateForm.description"
                    label="describe"
                    type="textarea"
                  />
                  <div>
                    <q-input
                      v-bind="basicUpdateInputOption('startAt')"
                      v-model="updateForm.startAt"
                      label="start time"
                      :rules="[() => !!updateForm.startAt || 'start time為必填']"
                      hint="The default is the current time"
                    />
                    <q-popup-proxy :breakpoint="2000">
                      <div class="flex flex-nowrap !max-w-[600px]">
                        <q-date
                          v-model="updateForm.startAt"
                          mask="YYYY-MM-DD HH:mm"
                          flat
                          today-btn
                          square
                        />
                        <q-time
                          v-model="updateForm.startAt"
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
                      v-bind="basicUpdateInputOption('endAt')"
                      v-model="updateForm.endAt"
                      label="end time"
                      :rules="[() => !!updateForm.endAt || 'end time為必填']"
                      hint="The default is current time + 5 minutes"
                    />
                    <q-popup-proxy :breakpoint="2000">
                      <div class="flex flex-nowrap !max-w-[600px]">
                        <q-date
                          v-model="updateForm.endAt"
                          mask="YYYY-MM-DD HH:mm"
                          flat
                          today-btn
                          square
                        />
                        <q-time
                          v-model="updateForm.endAt"
                          mask="YYYY-MM-DD HH:mm"
                          flat
                          today-btn
                          square
                        />
                      </div>
                    </q-popup-proxy>
                  </div>
                </basic-form-layout>
                <basic-form-layout label="option parameters">
                  <q-input
                    v-bind="basicUpdateInputOption('maxSelectableOptions')"
                    v-model.number="updateForm.maxSelectableOptions"
                    label="Maximum number of choices"
                  />
                  <q-input
                    v-bind="basicUpdateInputOption('requiredParticipationRate')"
                    v-model.number="updateForm.requiredParticipationRate"
                    label="Participation ratio through households"
                  />
                  <q-input
                    v-bind="basicUpdateInputOption('requiredWeightRate')"
                    v-model.number="updateForm.requiredWeightRate"
                    label="Through household participation weight ratio"
                  />
                  <q-input
                    v-bind="basicUpdateInputOption('totalHouseholds')"
                    v-model.number="updateForm.totalHouseholds"
                    label="Total number of households"
                  />
                  <q-input
                    v-bind="basicUpdateInputOption('totalWeight')"
                    v-model.number="updateForm.totalWeight"
                    label="Total number of households weight"
                  />
                  <q-input
                    v-bind="basicUpdateInputOption('options', true)"
                    :model-value="(updateForm.options ?? []).map((v) => v.content).join(', ')"
                    label="voting options"
                    hint="Please separate with commas"
                    :rules="[() => (updateForm.options ?? []).length > 1 || 'There must be at least two options']"
                    @update:model-value="updateForm.options = ($event as string).split(',').map((v) => ({ content: v.trim() }))"
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
import type { VotingEvent } from './voting-event.contract'
import {
  convertZodObjToQuasarRules,
  convertZodObjToZodType,
} from '@community-voting-system/shared'
import dayjs from 'dayjs'

import { defaultsDeep } from 'lodash-es'
import { QForm, QInput, useFormChild } from 'quasar'
import { clone, isString, omit, pipe } from 'remeda'
import { nextTick, ref } from 'vue'
import { diffObject } from '../../common/utils'
import { confirmDialog, fieldDefaultStyle } from '../../common/utils-quasar'
import BasicFormLayout from '../../layout/basic-form-layout.vue'
import { createVotingEventDtoSchema, updateVotingEventDtoSchema, votingEventCreatorFormDefault } from './voting-event.contract'

const emit = defineEmits<{
  (e: 'submit', value: typeof updateForm.value): void;
  (e: 'error', value: ReturnType<typeof onError>): void;
  (e: 'reset'): void;
  (e: 'validationError', value: Component): void;
}>()

interface Props {
  innerForm?: boolean;
  title?: string;
  originalBaseFormData: VotingEvent['basic'];
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
  updateForm.value.startAt = dayjs(updateForm.value.startAt).toISOString()
  updateForm.value.endAt = dayjs(updateForm.value.endAt).toISOString()
  if (
    (await confirmDialog({
      title: 'Do you want to continue? ',
      message: 'Are you sure you want to edit? ',
      cancel: true,
    })) === false
  ) {
    return
  }
  console.log('updateForm.value', updateForm.value)

  const result = updateVotingEventDtoSchema.safeParse(updateForm.value)
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
    '🚀 ~ file: votingEvent-editor-from.vue:298 ~ handleSubmit ~ data:',
    data,
  )
  emit('submit', data)
}

/** 將 base 的資料轉換成 update */
function baseToUpdate(
  data: Props['originalBaseFormData'],
): NonNullable<VotingEvent['request']['update']['body']> {
  return pipe(
    data,
    (val) => clone(val),

    (data) => ({
      ...data,
      // 關聯資料的 Id todo 修改
      endAt: dayjs(data.timestamp.endAt).format('YYYY-MM-DD HH:mm'),
      startAt: dayjs(data.timestamp.startAt).format('YYYY-MM-DD HH:mm'),
      // belongProductSupplierList: filter(parseRelation('idList', data.belongProductSupplierList), isTruthy),
    } satisfies NonNullable<VotingEvent['request']['update']['body']>),
    (data) => omit(data, [
      'id',
      'timestamp',
    ]),
    (data) => defaultsDeep(data, votingEventCreatorFormDefault),
  )
}

function basicUpdateInputOption(key: keyof FlattenObject<typeof updateForm.value>, enumOption = false) {
  const zodRule = convertZodObjToQuasarRules<typeof updateForm.value>(
    updateVotingEventDtoSchema,
    key,
  )
  const createZodObj = convertZodObjToZodType(createVotingEventDtoSchema, key)
  const updateZodObj = convertZodObjToZodType<typeof updateForm.value>(updateVotingEventDtoSchema, key)
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
