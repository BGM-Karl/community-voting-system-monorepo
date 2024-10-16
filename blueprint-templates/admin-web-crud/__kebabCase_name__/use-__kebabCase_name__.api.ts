import type { {{pascalCase name}} } from './{{kebabCase name}}.contract'
import to from 'await-to-js'
import { computed } from 'vue'
import { useClient } from '../../common/api'
import { {{camelCase name}}Contract } from './{{kebabCase name}}.contract'

export function use{{pascalCase name}}Api(
) {
  const {{pascalCase name}}ApiInstance = computed(() => {
    return useClient({{camelCase name}}Contract)
  })

  async function getList(query: {{pascalCase name}}['request']['getList']['query']) {
    const target = {{camelCase name}}Contract.find.summary
    const [err, result] = await to({{pascalCase name}}ApiInstance.value.find({ query }))
    if (err || !result) {
      return `${target} ${err}`
    }
    if (result.status === 200) {
      return result.body
    }
    return `${target} ${result}`
  }

  async function getOne(params: {{pascalCase name}}['request']['getOne']['params']) {
    const target = {{camelCase name}}Contract.findOne.summary
    const [err, result] = await to({{pascalCase name}}ApiInstance.value.findOne({ params }))
    if (err || !result) {
      return `${target} ${err}`
    }
    if (result.status === 200) {
      return result.body
    }
    return `${target} ${result}`
  }
  async function create(body: {{pascalCase name}}['request']['create']['body']) {
    const target = {{camelCase name}}Contract.create.summary
    const [err, result] = await to({{pascalCase name}}ApiInstance.value.create({ body }))
    if (err || !result) {
      return `${target} ${err}`
    }
    if (result.status === 201) {
      return result.body
    }
    return `${target} ${result}`
  }

  async function remove(params: {{pascalCase name}}['request']['remove']['params']) {
    const target = {{camelCase name}}Contract.remove.summary
    const [err, result] = await to({{pascalCase name}}ApiInstance.value.remove({ params }))
    if (err || !result) {
      return `${target} ${err}`
    }
    if (result.status === 200) {
      return result.body
    }
    return `${target} ${result}`
  }

  async function update<
    Dto extends {{pascalCase name}}['request']['update'],
  >(params: Dto['params'], body: Dto['body']) {
    const target = {{camelCase name}}Contract.update.summary
    const [err, result] = await to({{pascalCase name}}ApiInstance.value.update({ params, body }))
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
