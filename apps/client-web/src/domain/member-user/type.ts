import { UserContract } from '@community-voting-system/shared'
export type MemberUser = {
  request: {
    getSelf: UserContract['request']['getSelf'],
  },
  response: {
    getSelf: Extract<UserContract['response']['getSelf'], { status: 200 }>['body'],

  }
}