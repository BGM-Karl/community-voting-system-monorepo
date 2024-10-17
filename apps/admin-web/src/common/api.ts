import type { AppRoute, AppRouter, ClientInferResponseBody, InitClientArgs, ServerInferResponses } from '@ts-rest/core'
import { initClient } from '@ts-rest/core'
import { initQueryClient } from '@ts-rest/vue-query'
import axios from 'axios'

export const instance = axios.create({
  baseURL: '/api',
})

instance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response } = error

    // if ([401, 403].includes(response.status)) {
    //   router.push({ name: RouteName.LOGIN });
    // }

    return Promise.reject(error)
  },
)

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

export async function useApi<
  Router extends AppRouter,
  Arg extends InitClientArgs,
  Client extends ReturnType<typeof initClient<Router, Arg>>,
  ResponseShapes extends ServerInferResponses<Router>,
>(
  api: () => Promise<{
    status: number;
    body: ClientInferResponseBody<AppRoute, 200 | 201>;
  }>,
) {
  const result = await api()
  if (![200, 201].includes(result.status)) {
    throw result.body
  }

  return result.body
}

export function useQueryClient<T extends AppRouter>(
  router: T,
  option?: Parameters<typeof initQueryClient>[1],
) {
  return initQueryClient(router, {
    baseUrl: '',
    baseHeaders: {},
    ...option,
  })
}
