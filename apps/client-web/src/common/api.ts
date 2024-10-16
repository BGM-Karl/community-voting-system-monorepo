import { initClient } from '@ts-rest/core'
import type { AppRouter } from '@ts-rest/core'

export function useClient<T extends AppRouter>(
  router: T,
  option?: Parameters<typeof initClient>[1],
) {
  return initClient(router, {
    baseUrl: '',
    baseHeaders: {},
    ...option,
  })
}