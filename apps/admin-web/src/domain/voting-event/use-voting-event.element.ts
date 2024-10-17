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

    const tableRef = ref<QTable | undefined>()
    const columns = ref<TableColumn[]>([])
    const pagination = ref({
      sortBy: '',
      descending: false,
      page: 1,
      rowsPerPage: 50,
      rowsNumber: 50,
    })

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
   * Open creator form using dialog
   */
  function handleOpenCreatorDialog(config: {
    handleRefreshTableData?: () => void;
  }) {
    const dialog = openUsingDialog(
      VotingEventCreatorForm,
      {
        title: 'Add',
        onSubmit: async (val: any) => {
          Loading.show({
            message: 'Under creation...',
          })
          const [error, result] = await to(votingEventApi.create(val))
          Loading.hide()
          if (error) {
            Notify.create({
              type: 'negative',
              message: `Add failed!${error.message}`,
            })
            return
          }
          dialog.hide()
          config?.handleRefreshTableData?.()
          Notify.create({
            type: 'positive',
            message: 'Update successful',
          })
        },
        onError: (error: Error) => {
          Notify.create({
            type: 'negative',
            message: `Add failed!${error.message}`,
          })
        },
      } as any,
      {},
    )
  }

  /** Use dialog to open update form   */
  function handleOpenEditorDialog(config: {
    originalBaseFormData: VotingEvent['basic'];
    handleRefreshTableData?: () => void;
  }) {
    const dialog = openUsingDialog(
      VotingEventEditorForm,
      {
        title: 'edit',
        originalBaseFormData: config.originalBaseFormData,
        onSubmit: async (val: any) => {
          Loading.show({
            message: 'Updating...',
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
              message: `Update failed!${error.message}`,
            })
            return
          }
          dialog.hide()
          config?.handleRefreshTableData?.()
          Notify.create({
            type: 'positive',
            message: 'Update successful',
          })
        },
        onError: (error: Error) => {
          Notify.create({
            type: 'negative',
            message: `Update failed!${error.message}`,
          })
        },
      } as any,
      {},
    )
  }

  /** Enable deletion confirm dialog */
  function handleOpenDeleteDialog(config: {
    ids: string[];
    handleRefreshTableData?: () => void;
    handleClearSelectedRows?: () => void;
  }) {
    if (config.ids.length === 0) {
      Notify.create({
        type: 'warning',
        message: 'No items selected for deletion yet',
      })
      return
    }

    Dialog.create({
      title: `Continue?`,
      message: `The selected data will be deleted. Do you want to continue?`,
      cancel: true,
    }).onOk(async () => {
      Loading.show({
        message: 'Deleting...',
      })
      await Promise.allSettled(
        config.ids.map((id) => votingEventApi.remove({ id })),
      )
        .then(() => {
          config?.handleRefreshTableData?.()
          Notify.create({
            type: 'positive',
            message: 'Delete successfully',
          })
          config?.handleClearSelectedRows?.()
        })
        .catch((error) => {
          Notify.create({
            type: 'negative',
            message: `Deletion failed!${error.message}`,
          })
        })

      Loading.hide()
    })
  }

  return {
    getTableInfo,
    handleOpenCreatorDialog,
    handleOpenEditorDialog,
    handleOpenDeleteDialog,
  }
}
