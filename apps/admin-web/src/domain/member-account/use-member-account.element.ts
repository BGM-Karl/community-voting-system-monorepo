import type { QTable } from 'quasar'
import type { Ref } from 'vue'
import type { MemberAccount, MemberAccountItemDeepKeys } from './member-account.contract'
import { syncRef } from '@vueuse/core'
import to from 'await-to-js'
import { Dialog, Loading, Notify } from 'quasar'
import { ref } from 'vue'
import { openUsingDialog } from '../../common/utils-quasar'
import MemberAccountCreatorForm from './member-account-creator-form.vue'
import MemberAccountEditorForm from './member-account-editor-form.vue'

import { useMemberAccountApi } from './use-member-account.api'

export function useMemberAccountElement<
  MoreTableColsKey extends string[] = [],
>() {
  // API
  const memberAccountApi = useMemberAccountApi()

  function getTableInfo(apiRespondData: Ref<MemberAccount['response']['getList'] | undefined>) {
    type TableColsKey =
      | MemberAccountItemDeepKeys
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

    const rows = ref<Array<MemberAccount['basic']>>([])
    // const rows = ref([]) as Ref<MemberAccountList['data']>;
    const selectedRows = ref<Array<MemberAccount['basic']>>([])

    syncRef(rows, apiRespondData, {
      transform: {
        rtl: (data) => {
          pagination.value.rowsNumber = data?.total ?? 0
          return data?.data ?? []
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
      MemberAccountCreatorForm,
      {
        title: 'Add',
        onSubmit: async (val: any) => {
          Loading.show({
            message: 'Creating...',
          })
          const [error, result] = await to(memberAccountApi.create(val))
          Loading.hide()
          if (error) {
            Notify.create({
              type: 'negative',
              message: `Failed to add！${error.message}`,
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
            message: `Failed to add！${error.message}`,
          })
        },
      } as any,
      {},
    )
  }

  /**
    * Use dialog to open update form
    */
  function handleOpenEditorDialog(config: {
    originalBaseFormData: MemberAccount['basic'];
    handleRefreshTableData?: () => void;
  }) {
    const dialog = openUsingDialog(
      MemberAccountEditorForm,
      {
        title: 'edit',
        originalBaseFormData: config.originalBaseFormData,
        onSubmit: async (val: any) => {
          Loading.show({
            message: 'Updating...',
          })
          const [error, result] = await to(
            memberAccountApi.update(
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
        config.ids.map((id) => memberAccountApi.remove({ id })),
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
