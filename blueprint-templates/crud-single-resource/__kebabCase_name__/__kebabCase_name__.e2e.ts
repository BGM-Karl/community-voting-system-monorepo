import request from 'supertest'

import type { {{pascalCase name}}, {{pascalCase name}}Contract } from '@community-voting-system/shared'
import { {{camelCase name}}Contract } from '@community-voting-system/shared'
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
export function create{{pascalCase name}}Api(server: any) {
  return {
    async get(code = 200) {
      const { url, method } = useContract({{camelCase name}}Contract.get)

      const { body, statusCode } = await request(server)[method](url)

      if (code !== statusCode) {
        throw new Error(`${statusCode} : ${JSON.stringify(body, null, 2)}`)
      }

      return body as {{pascalCase name}}
    },
    async update(data?: {{pascalCase name}}Contract['request']['update']['body'], code = 200) {
      const { url, method } = useContract({{camelCase name}}Contract.update, {
        body: data,
      })

      const { statusCode, body } = await request(server)[method](url)
        .send(data)

      if (code !== statusCode) {
        throw new Error(`${statusCode} : ${JSON.stringify(body, null, 2)}`)
      }

      return body as Extract<
        {{pascalCase name}}Contract['response']['update'],
        { status: 200 }
      >['body']
    },
    async findLogs(data?: {{pascalCase name}}Contract['request']['findLogs']['query'], code = 200) {
      const { url, method } = useContract({{camelCase name}}Contract.findLogs, {
        query: data ?? {},
      })

      const { statusCode, body } = await request(server)[method](url)
        .query(data ?? {})

      if (code !== statusCode) {
        throw new Error(`${statusCode} : ${JSON.stringify(body, null, 2)}`)
      }

      return body as Extract<
        {{pascalCase name}}Contract['response']['findLogs'],
        { status: 200 }
      >['body']
    },
  }
}
