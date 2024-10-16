<template>
  <div class="h-full w-full flex flex-col flex-nowrap">
    <div class="overflow-y-auto">
      <div
        class="sticky top-0 z-10 w-full flex items-center bg-white p-5"
        :class="{
          'border mb-1': props.mode === 'table',
        }"
      >
        <div class="flex flex-col gap-2">
          <h1
            v-if="props.title"
            class="text-h6"
          >
            {{ props.title }}
          </h1>
        </div>
        <div
          v-if="!!keywordRef"
          class="ml-auto flex flex-col justify-end"
        >
          <q-btn
            label="清除搜尋"
            color="primary"
            flat
            @click="handleSearch('')"
          />
        </div>
        <div
          v-else
          class="ml-auto flex gap-2"
        >
          <q-btn
            v-if="props.visibleCreateButton"
            label="新增"
            color="primary"
            icon="add"
            square
            unelevated
            class="w-28"
            @click="
              memberAccountElement.handleOpenCreatorDialog({
                handleRefreshTableData: tableRef?.requestServerInteraction,
              })"
          />
        </div>
      </div>

      <div>
        <q-table
          ref="tableRef"
          v-model:selected="selectedRows"
          v-model:pagination="pagination"
          :rows="rows"
          :columns="columns"
          :loading="memberAccountListIsLoading"
          row-key="id"
          :selection="tableSelectType"
          bordered
          class="data-table q-sticky-header-table w-full"
          :class="{
            ' rounded-b-none border-b shadow-none -mt-1': props.mode !== 'table',
            '!max-h-[600px]': props.mode === 'table',
          }"
          :rows-per-page-options="[20, 50, 100]"
          :visible-columns="props.visibleColumns"
          @request="handleTableRequest"
          @row-contextmenu="handleOpenContextMenu"
        >
          <template #loading>
            <q-inner-loading
              showing
              color="primary"
            />
          </template>

          <!-- 功能按鈕 -->
          <template #body-cell-tool="qTdProps">
            <q-td
              v-if="tableRef"
              :props="qTdProps"
              class="flex flex-nowrap items-center justify-center gap-2"
            >
              <q-btn
                dense
                icon="edit"
                size="sm"
                text-color="grey"
                @click="
                  memberAccountElement.handleOpenEditorDialog({
                    originalBaseFormData: qTdProps.row,
                    handleRefreshTableData: tableRef.requestServerInteraction,
                  })"
              >
                <q-tooltip>編輯</q-tooltip>
              </q-btn>
              <q-btn
                dense
                icon="delete"
                size="sm"
                text-color="grey"
                @click="memberAccountElement.handleOpenDeleteDialog({
                  ids: [qTdProps.row.id],
                  handleClearSelectedRows: () => selectedRows = [],
                  handleRefreshTableData: tableRef.requestServerInteraction,
                })"
              >
                <q-tooltip>刪除</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
        <q-menu
          v-if="contextMenuData && tableRef"
          v-model="contextMenuState"
          touch-position
          context-menu
        >
          <q-list
            dense
            style="min-width: 100px"
          >
            <q-item>
              <q-item-section>
                <member-account-card :data="contextMenuData" />
              </q-item-section>
            </q-item>

            <q-separator />
            <q-item
              v-close-popup
              clickable
              dense
              @click="
                memberAccountElement.handleOpenEditorDialog({
                  originalBaseFormData: contextMenuData,
                  handleRefreshTableData: tableRef.requestServerInteraction,
                })"
            >
              <q-item-section>編輯</q-item-section>
              <q-item-section avatar>
                <q-icon
                  name="edit"
                  size="16px"
                />
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item
              v-close-popup
              clickable
              @click="memberAccountElement.handleOpenDeleteDialog({
                ids: [contextMenuData.id],
                handleClearSelectedRows: () => selectedRows = [],
                handleRefreshTableData: tableRef.requestServerInteraction,
              })"
            >
              <q-item-section>刪除</q-item-section>
              <q-item-section avatar>
                <q-icon
                  name="delete"
                  size="16px"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
    </div>

    <div class="bg-white">
      <div
        v-if="props.mode === 'multiSelect' || props.mode === 'singleSelect'"
        class="w-full flex"
      >
        <q-btn
          v-close-popup
          label="取消"
          color="primary"
          flat
        />

        <q-btn
          :disable="selectedRows.length === 0"
          :label="`確定(${selectedRows.length})`"
          color="primary"
          square
          unelevated
          class="ml-auto w-28"
          @click="emit('submit', selectedRows)"
        />
      </div>
      <div v-else-if="props.mode === 'view'">
        <q-btn
          v-close-popup
          label="關閉視窗"
          color="primary"
          flat
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FlattenObject } from '@community-voting-system/shared'
import { convertZodObjToZodType } from '@community-voting-system/shared'
import { useAsyncState } from '@vueuse/core'
import dayjs from 'dayjs'
import { defaultsDeep, get } from 'lodash-es'
import { QItem, QItemSection, QMenu, QTable, useQuasar } from 'quasar'
import { isString, pipe } from 'remeda'
import { computed, ref, watch } from 'vue'
import { memberAccountSchema } from './member-account.contract'
import MemberAccountCard from './member-account-card.vue'
import { useMemberAccountApi } from './use-member-account.api'
import { useMemberAccountElement } from './use-member-account.element'

interface Props {
  title?: string;
  mode?: 'singleSelect' | 'multiSelect' | 'view' | 'table';
  visibleColumns?: (typeof cols)[number]['name'][];
  visibleCreateButton?: boolean;
  visibleTrashButton?: boolean;

  defaultCheckedIds?: string[];
  /* 僅顯示已刪除的資料 */
  onlyShowDeleted?: boolean;
}
const emit = defineEmits<{
  (e: 'submit', value: typeof selectedRows.value): void;
}>()

const props = withDefaults(defineProps<Props>(), {
  visibleColumns: undefined,
  mode: 'table',
  visibleCreateButton: true,
  visibleTrashButton: true,
  title: '',
  defaultCheckedIds: () => [],
  onlyShowDeleted: false,
}) as Props

const memberAccountApi = useMemberAccountApi()
const $q = useQuasar()

/** table 的 select 多選、單選或正常 table */
const tableSelectType = computed(() =>
  props.mode === 'multiSelect'
    ? 'multiple'
    : props.mode === 'singleSelect'
      ? 'single'
      : 'none',
)

const {
  isLoading: memberAccountListIsLoading,
  isReady: memberAccountListIsReady,
  state: memberAccountList,
  execute: executeMemberAccountListQuery,
} = useAsyncState(
  async (_dto: Parameters<typeof memberAccountApi.getList>[0]) => {
    const dto = defaultsDeep(
      _dto,

    )
    const result = await memberAccountApi.getList(dto)

    if (isString(result)) {
      $q.notify({
        type: 'negative',
        message: result,
      })
      return
    }
    return result
  },
  undefined,
  { resetOnExecute: false },
)

const memberAccountElement = useMemberAccountElement()
const { tableRef, columns, pagination, rows, selectedRows }
  = memberAccountElement.getTableInfo(memberAccountList)
type MemberAccountRow = (typeof rows.value)[number]

/** 處理預設打勾 */
watch(
  [() => props.defaultCheckedIds, () => rows.value],
  ([_defaultCheckedIds, _rows]) => {
    selectedRows.value = _rows.filter((row) =>
      (_defaultCheckedIds ?? []).includes(row.id),
    )
  },
  {
    immediate: true,
    deep: true,
  },
)

async function handleTableRequest(
  params: Parameters<
    NonNullable<InstanceType<typeof QTable>['$props']['onRequest']>
  >[0],
) {
  const { page, rowsPerPage, sortBy, descending } = params.pagination
  const skip = (page - 1) * rowsPerPage
  const limit = rowsPerPage
  const result = await executeMemberAccountListQuery(0, {
    skip,
    limit,
  })
  if (!result)
    return
  // if (isErrResponse(result)) {
  //   $q.notify({
  //     type: 'negative',
  //     message: `${result.message}<${result.status}>`,
  //   })
  //   return
  // }
  pagination.value = {
    sortBy,
    descending,
    rowsPerPage: result.limit,
    page: Math.round(result?.skip / result.limit) + 1,
    rowsNumber: result.total,
  }
}

function handleCol<Key extends keyof FlattenObject<MemberAccountRow>>(
  key: Key,
  defaultLabel = '',
  format?: (val: any) => any,
  otherName?: string,
) {
  return {
    name: otherName ?? key.toString(),
    label:
      convertZodObjToZodType<MemberAccountRow>(
        memberAccountSchema,
        key,
      )?.description || defaultLabel,
    field: 'id',
    align: 'left',
    sortable: false,
    format: (val: any, row: MemberAccountRow) =>
      pipe(
        row,
        (row) => get(row, key),
        (val) => (format?.(val) ?? val),
      ),
  } satisfies (typeof columns.value)[number]
}

const cols = ([
  {
    field: 'tool',
    name: 'tool',
    label: '操作',
    align: 'center',
    // headerClasses: 'w-20',
  },
  handleCol('timestamp.createdAt', '建立時間', (val: MemberAccountRow['timestamp']['createdAt']) =>
    val ? dayjs(val).toDate().toLocaleString() : ''),
  handleCol('name', '住戶名稱'),
  handleCol('username', '使用者名稱'),
  handleCol('description', '簡介'),
  handleCol('weight', '權重'),

] satisfies typeof columns.value)
  .sort((a, b) => (props.visibleColumns?.indexOf(a.name) ?? 0) - (props.visibleColumns?.indexOf(b.name) ?? 0)) as typeof columns.value

// (dataList) => sort(dataList, (a, b) => (props.visibleColumns?.indexOf(a.name) ?? 0) - (props.visibleColumns?.indexOf(b.name) ?? 0)) as typeof columns.value,
columns.value = [...cols]
const contextMenuState = ref(false)
const contextMenuData = ref<MemberAccountRow>()
watch(contextMenuState, (val) => {
  if (!val) {
    contextMenuData.value = undefined
  }
})
async function handleOpenContextMenu(event: any, row: MemberAccountRow, index: number) {
  contextMenuData.value = row
}

const keywordRef = ref<string>()
function handleSearch(keyword?: string) {
  if (isString(keyword)) {
    keywordRef.value = keyword || undefined
  }
  executeMemberAccountListQuery(0, {
    // brandNameOrCode: keywordRef.value,
  })
}
</script>

<style scoped></style>
