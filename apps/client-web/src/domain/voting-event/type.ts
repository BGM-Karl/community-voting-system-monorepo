import { VotingEventContract } from '@community-voting-system/shared'
export type VotingEvent = {
  request: {
    create: VotingEventContract['request']['create']['body'],
    update: VotingEventContract['request']['update']['body'],
    remove: VotingEventContract['request']['remove']['params'],
    findOne: VotingEventContract['request']['findOne']['params'],
    find: VotingEventContract['request']['find']['query'],
  },
  response: {
    findOne: Extract<VotingEventContract['response']['findOne'], { status: 200 }>['body'],
    find: Extract<VotingEventContract['response']['find'], { status: 200 }>['body'],
    create: Extract<VotingEventContract['response']['create'], { status: 201 }>['body'],
    update: Extract<VotingEventContract['response']['update'], { status: 200 }>['body'],
    remove: Extract<VotingEventContract['response']['remove'], { status: 200 }>['body'],
  }
}