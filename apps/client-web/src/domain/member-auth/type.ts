import { AuthContract } from '@community-voting-system/shared'
export type MemberAuth = {
  request: {
    localLogin: AuthContract['request']['localLogin']['body'],
    logout: AuthContract['request']['logout']['body'],
    refresh: AuthContract['request']['refresh'],

  },
  response: {
    localLogin: Extract<AuthContract['response']['localLogin'], { status: 200 }>['body'],
    logout: Extract<AuthContract['response']['logout'], { status: 200 }>['body'],
    refresh: Extract<AuthContract['response']['refresh'], { status: 200 }>['body'],

  }
}