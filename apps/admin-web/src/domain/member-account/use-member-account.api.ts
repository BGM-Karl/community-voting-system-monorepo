import type { MemberAccount } from './member-account.contract'
import to from 'await-to-js'
import { computed } from 'vue'
import { useClient } from '../../common/api'
import { memberAccountContract } from './member-account.contract'

export function useMemberAccountApi(
) {
  const MemberAccountApiInstance = computed(() => {
    return useClient(memberAccountContract)
  })

  async function getList(query: MemberAccount['request']['getList']['query']) {
    const target = memberAccountContract.find.summary
    const [err, result] = await to(MemberAccountApiInstance.value.find({ query }))
    if (err || !result) {
      return `${target} ${err}`
    }
    if (result.status === 200) {
      return result.body
    }
    return `${target} ${result}`
  }

  async function getOne(params: MemberAccount['request']['getOne']['params']) {
    const target = memberAccountContract.findOne.summary
    const [err, result] = await to(MemberAccountApiInstance.value.findOne({ params }))
    if (err || !result) {
      return `${target} ${err}`
    }
    if (result.status === 200) {
      return result.body
    }
    return `${target} ${result}`
  }
  async function create(body: MemberAccount['request']['create']['body']) {
    const target = memberAccountContract.create.summary
    const [err, result] = await to(MemberAccountApiInstance.value.create({ body }))
    if (err || !result) {
      return `${target} ${err}`
    }
    if (result.status === 201) {
      return result.body
    }
    return `${target} ${result}`
  }

  async function remove(params: MemberAccount['request']['remove']['params']) {
    const target = memberAccountContract.remove.summary
    const [err, result] = await to(MemberAccountApiInstance.value.remove({ params }))
    if (err || !result) {
      return `${target} ${err}`
    }
    if (result.status === 200) {
      return result.body
    }
    return `${target} ${result}`
  }

  async function update<
    Dto extends MemberAccount['request']['update'],
  >(params: Dto['params'], body: Dto['body']) {
    const target = memberAccountContract.update.summary
    const [err, result] = await to(MemberAccountApiInstance.value.update({ params, body }))
    if (err || !result) {
      return `${target} ${err}`
    }
    if (result.status === 200) {
      return result.body
    }
    return `${target} ${result}`
  }

  return {
    getList,
    getOne,
    create,
    remove,
    update,
  }
}
