import type { Account, AccountContract, FlattenObject } from '@community-voting-system/shared'
import { accountContract, accountSchema } from '@community-voting-system/shared'

export const memberAccountSchema = accountSchema
export const memberAccountContract = accountContract

export const updateMemberAccountDtoSchema = memberAccountContract.update.body
export const createMemberAccountDtoSchema = memberAccountContract.create.body

export interface MemberAccount {
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

export const memberAccountCreatorFormDefault: MemberAccount['request']['create']['body'] = {
  username: '',
  name: '',
  password: '',
  weight: 0,
}

export type MemberAccountItemDeepKeys = keyof FlattenObject<MemberAccount['basic']>
export const isMemberAccount = (data: unknown): data is ReturnType<typeof memberAccountSchema.parse> => memberAccountSchema.safeParse(data).success
