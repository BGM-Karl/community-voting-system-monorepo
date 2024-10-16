import type { VotingEvent } from './voting-event.contract'
import { votingEventContract } from '@community-voting-system/shared'
import to from 'await-to-js'
import { computed } from 'vue'
import { useClient } from '../../common/api'

export function useVotingEventApi(
) {
  const VotingEventApiInstance = computed(() => {
    return useClient(votingEventContract)
  })

  async function getList(query: VotingEvent['request']['getList']['query']) {
    const target = votingEventContract.find.summary
    const [err, result] = await to(VotingEventApiInstance.value.find({ query }))
    if (err || !result) {
      return `${target} ${err}`
    }
    if (result.status === 200) {
      return result.body
    }
    return `${target} ${result}`
  }

  async function getOne(params: VotingEvent['request']['getOne']['params']) {
    const target = votingEventContract.findOne.summary
    const [err, result] = await to(VotingEventApiInstance.value.findOne({ params }))
    if (err || !result) {
      return `${target} ${err}`
    }
    if (result.status === 200) {
      return result.body
    }
    return `${target} ${result}`
  }
  async function create(body: VotingEvent['request']['create']['body']) {
    const target = votingEventContract.create.summary
    const [err, result] = await to(VotingEventApiInstance.value.create({ body }))
    if (err || !result) {
      return `${target} ${err}`
    }
    if (result.status === 201) {
      return result.body
    }
    return `${target} ${result}`
  }

  async function remove(params: VotingEvent['request']['remove']['params']) {
    const target = votingEventContract.remove.summary
    const [err, result] = await to(VotingEventApiInstance.value.remove({ params }))
    if (err || !result) {
      return `${target} ${err}`
    }
    if (result.status === 200) {
      return result.body
    }
    return `${target} ${result}`
  }

  async function update<
    Dto extends VotingEvent['request']['update'],
  >(params: Dto['params'], body: Dto['body']) {
    const target = votingEventContract.update.summary
    const [err, result] = await to(VotingEventApiInstance.value.update({ params, body }))
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
