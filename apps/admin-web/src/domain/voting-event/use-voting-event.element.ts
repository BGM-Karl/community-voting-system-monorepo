import type { QTable } from 'quasar'
import type { Ref } from 'vue'
import type { VotingEvent, VotingEventItemDeepKeys } from './voting-event.contract'
import { syncRef } from '@vueuse/core'
import to from 'await-to-js'
import { Dialog, Loading, Notify } from 'quasar'
import { ref } from 'vue'
import { openUsingDialog } from '../../common/utils-quasar'
import { useVotingEventApi } from './use-voting-event.api'
import VotingEventCreatorForm from './voting-event-creator-form.vue'

import VotingEventEditorForm from './voting-event-editor-form.vue'

export function useVotingEventElement<
  MoreTableColsKey extends string[] = [],
>() {
  // API
  const votingEventApi = useVotingEventApi()

  function getTableInfo(apiRespondData: Ref<VotingEvent['response']['getList'] | undefined>) {
    type TableColsKey =
      | VotingEventItemDeepKeys
      | 'tool'
      | MoreTableColsKey[number]

    type TableColumn = NonNullable<
      {
        field: TableColsKey;
        name: string;
        label: string;
        [key: string]: any;
      }[] &
      InstanceType<typeof QTable>['columns']
    >[number]

    // 基本設定
    const tableRef = ref<QTable | undefined>()
    const columns = ref<TableColumn[]>([])
    const pagination = ref({
      sortBy: '',
      descending: false,
      page: 1,
      rowsPerPage: 50,
      rowsNumber: 50,
    })
    /**
     * 因為如果用這個會造成vue 自動解包 ref 的問題
     * const rows: Ref<UnwrapRefSimple<SingleDatum>[]>，導致型別推導會有問題，所以改用 as Ref<SingleDatum[]>
     * - https://stackoverflow.com/questions/69813587/vue-unwraprefsimplet-generics-type-cant-assignable-to-t-at-reactive
     */
    const rows = ref<Array<VotingEvent['basic']>>([])
    // const rows = ref([]) as Ref<VotingEventList['data']>;
    const selectedRows = ref<Array<VotingEvent['basic']>>([])

    syncRef(rows, apiRespondData, {
      transform: {
        rtl: (data) => {
          pagination.value.rowsNumber = data?.total ?? 0
          return data?.data as any ?? []
        },
      },
      deep: true,
      direction: 'rtl',
    })

    return {
      tableRef,
      columns,
      pagination,
      rows,
      selectedRows,
    }
  }

  /**
   * 用dialog 打開 creator form
   */
  function handleOpenCreatorDialog(config: {
    handleRefreshTableData?: () => void;
  }) {
    const dialog = openUsingDialog(
      VotingEventCreatorForm,
      {
        title: '新增',
        onSubmit: async (val: any) => {
          Loading.show({
            message: '建立中...',
          })
          const [error, result] = await to(votingEventApi.create(val))
          Loading.hide()
          if (error) {
            Notify.create({
              type: 'negative',
              message: `新增失敗！${error.message}`,
            })
            return
          }
          dialog.hide()
          config?.handleRefreshTableData?.()
          Notify.create({
            type: 'positive',
            message: '更新成功',
          })
        },
        onError: (error: Error) => {
          Notify.create({
            type: 'negative',
            message: `新增失敗！${error.message}`,
          })
        },
      } as any,
      {},
    )
  }

  /**
   * 用 dialog 打開 update form
   */
  function handleOpenEditorDialog(config: {
    originalBaseFormData: VotingEvent['basic'];
    handleRefreshTableData?: () => void;
  }) {
    const dialog = openUsingDialog(
      VotingEventEditorForm,
      {
        title: '編輯',
        originalBaseFormData: config.originalBaseFormData,
        onSubmit: async (val: any) => {
          Loading.show({
            message: '更新中...',
          })
          const [error, result] = await to(
            votingEventApi.update(
              { id: config.originalBaseFormData.id },
              val,
            ),
          )
          Loading.hide()
          if (error) {
            Notify.create({
              type: 'negative',
              message: `更新失敗！${error.message}`,
            })
            return
          }
          dialog.hide()
          config?.handleRefreshTableData?.()
          Notify.create({
            type: 'positive',
            message: '更新成功',
          })
        },
        onError: (error: Error) => {
          Notify.create({
            type: 'negative',
            message: `更新失敗！${error.message}`,
          })
        },
      } as any,
      {},
    )
  }

  /** 開啟刪除 confirm dialog */
  function handleOpenDeleteDialog(config: {
    ids: string[];
    handleRefreshTableData?: () => void;
    handleClearSelectedRows?: () => void;
  }) {
    if (config.ids.length === 0) {
      Notify.create({
        type: 'warning',
        message: '尚未選擇刪除項目',
      })
      return
    }

    Dialog.create({
      title: `是否繼續？`,
      message: `即將刪除選擇的資料，是否繼續？`,
      cancel: true,
    }).onOk(async () => {
      Loading.show({
        message: '刪除中...',
      })
      await Promise.allSettled(
        config.ids.map((id) => votingEventApi.remove({ id })),
      )
        .then(() => {
          config?.handleRefreshTableData?.()
          Notify.create({
            type: 'positive',
            message: '刪除成功',
          })
          config?.handleClearSelectedRows?.()
        })
        .catch((error) => {
          Notify.create({
            type: 'negative',
            message: `刪除失敗！${error.message}`,
          })
        })

      Loading.hide()
    })
  }

  return {
    // 基本資料
    getTableInfo,
    // 建立
    handleOpenCreatorDialog,
    // 編輯
    handleOpenEditorDialog,
    // 刪除
    handleOpenDeleteDialog,

  }
}
