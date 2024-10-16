import type {
  CollectionData,
  CollectionDataContract,
} from '@community-voting-system/shared'

import {
  collectionDataContract,
} from '@community-voting-system/shared'
import request from 'supertest'
import { useContract } from '../../common/utils/utils-ts-rest'

/** e2e 測試之合約轉換層
 *
 * 將合約轉換成 API 呼叫，這樣就可以直接拿合約內容進行 e2e 測試
 *
 * 也就是說只要合約有變動，這裡也要跟著變動，這樣就可以確保合約的正確性
 *
 * 同時只要 e2e 測試通過，即表示合約正確，可以交付
 *
 * 另一個附加好處是如果其他資源的 e2e 測試有依賴此資源，也可以直接拿去重複使用
 *
 * @param server 測試環境中的 HTTP server 主體
 */
export function createCollectionDataApi(server: any) {
  return {
    async create(data: CollectionDataContract['request']['create']['body'], code = 201) {
      const { url, method } = useContract(collectionDataContract.create, {
        body: data,
      })

      const { body, statusCode } = await request(server)[method](url)
        .send(data)

      if (code !== statusCode) {
        throw new Error(`${statusCode} : ${JSON.stringify(body, null, 2)}`)
      }

      return body as Extract<
        CollectionDataContract['response']['create'],
        { status: 201 }
      >['body']
    },
    async find(data?: CollectionDataContract['request']['find']['query'], code = 200) {
      const { url, method } = useContract(collectionDataContract.find, {
        query: data ?? {},
      })

      const { body, statusCode } = await request(server)[method](url)
        .query(data ?? {})

      if (code !== statusCode) {
        throw new Error(`${statusCode} : ${JSON.stringify(body, null, 2)}`)
      }

      return body as Extract<
        CollectionDataContract['response']['find'],
        { status: 200 }
      >['body']
    },
    async findOne(id: string, code = 200) {
      const { url, method } = useContract(collectionDataContract.findOne, {
        params: { id },
      })

      const { body, statusCode } = await request(server)[method](url)

      if (code !== statusCode) {
        throw new Error(`${statusCode} : ${JSON.stringify(body, null, 2)}`)
      }

      return body as Extract<
        CollectionDataContract['response']['findOne'],
        { status: 200 }
      >['body']
    },
    async update(id: string, data: CollectionDataContract['request']['update']['body'], code = 200) {
      const { url, method } = useContract(collectionDataContract.update, {
        params: { id },
        body: data,
      })

      const { body, statusCode } = await request(server)[method](url)
        .send(data)

      if (code !== statusCode) {
        throw new Error(`${statusCode} : ${JSON.stringify(body, null, 2)}`)
      }

      return body as Extract<
        CollectionDataContract['response']['update'],
        { status: 200 }
      >['body']
    },
    async remove(id: string, code = 200) {
      const { url, method } = useContract(collectionDataContract.remove, {
        params: { id },
      })

      const { body, statusCode } = await request(server)[method](url)

      if (code !== statusCode) {
        throw new Error(`${statusCode} : ${JSON.stringify(body, null, 2)}`)
      }

      return body as CollectionData
    },

    async findLogs(
      id: string,
      data?: CollectionDataContract['request']['findLogs']['query'],
      code = 200,
    ) {
      const { url, method } = useContract(collectionDataContract.findLogs, {
        params: { id },
        query: data ?? {},
      })

      const { body, statusCode } = await request(server)[method](url)
        .send(data)

      if (code !== statusCode) {
        throw new Error(JSON.stringify(body, null, 2))
      }

      return body as Extract<
        CollectionDataContract['response']['findLogs'],
        { status: 200 }
      >['body']
    },
  }
}
