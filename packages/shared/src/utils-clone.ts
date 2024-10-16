// import { cloneDeep } from 'lodash'
import { clone } from 'remeda'

/**
 * 處理複製物件預設使用 JSON.parse(JSON.stringify(data))，若有特殊需求可使用 lodash 或 remeda
 */
export function handleClone<Data>(data: Data, type: 'Remeda' | 'Lodash' | 'Json' = 'Json'): Data | undefined {
  if (type === 'Remeda')
    return clone(data)
  // if (type === 'Lodash')
  //   return cloneDeep(data)
  if (type === 'Json') {
    try {
      return JSON.parse(JSON.stringify(data))
    }
    catch (error) {
      // console.error('handleClone error:', error);
      return data
    }
  }
  return undefined
}
