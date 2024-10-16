import type { Account, AccountContract, FlattenObject } from '@community-voting-system/shared'
import { accountContract, accountSchema } from '@community-voting-system/shared'

export const {{camelCase name}}Schema = accountSchema
export const {{camelCase name}}Contract = accountContract

export const update{{pascalCase name}}DtoSchema = {{camelCase name}}Contract.update.body
export const create{{pascalCase name}}DtoSchema = {{camelCase name}}Contract.create.body

export interface {{pascalCase name}} {
  basic: Account;
  request: {
    create: AccountContract['request']['create'];
    getOne: AccountContract['request']['findOne'];
    getList: AccountContract['request']['find'];
    update: AccountContract['request']['update'];
    remove: AccountContract['request']['remove'];

  };
  response: {
    create: Extract<AccountContract['response']['create'], { status: 201 }>['body'];
    getOne: Extract<AccountContract['response']['findOne'], { status: 200 }>['body'];
    getList: Extract<AccountContract['response']['find'], { status: 200 }>['body'];
    update: Extract<AccountContract['response']['update'], { status: 200 }>['body'];
    remove: Extract<AccountContract['response']['remove'], { status: 200 }>['body'];
  };
}

export const {{camelCase name}}CreatorFormDefault: {{pascalCase name}}['request']['create']['body'] = {
  username: '',
  name: '',
  password: '',
  weight: 0,
}

export type {{pascalCase name}}ItemDeepKeys = keyof FlattenObject<{{pascalCase name}}['basic']>
export const is{{pascalCase name}} = (data: unknown): data is ReturnType<typeof {{camelCase name}}Schema.parse> => {{camelCase name}}Schema.safeParse(data).success
