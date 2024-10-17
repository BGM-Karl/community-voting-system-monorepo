import type { FlattenObject, VotingEventContract, VotingEvent as VotingEventType } from '@community-voting-system/shared'
import { votingEventContract, votingEventSchema } from '@community-voting-system/shared'
import dayjs from 'dayjs'

export const updateVotingEventDtoSchema = votingEventContract.update.body
export const createVotingEventDtoSchema = votingEventContract.create.body

export interface VotingEvent {
  basic: VotingEventType;
  request: {
    create: VotingEventContract['request']['create'];
    getOne: VotingEventContract['request']['findOne'];
    getList: VotingEventContract['request']['find'];
    update: VotingEventContract['request']['update'];
    remove: VotingEventContract['request']['remove'];

  };
  response: {
    create: Extract<VotingEventContract['response']['create'], { status: 201 }>['body'];
    getOne: Extract<VotingEventContract['response']['findOne'], { status: 200 }>['body'];
    getList: Extract<VotingEventContract['response']['find'], { status: 200 }>['body'];
    update: Extract<VotingEventContract['response']['update'], { status: 200 }>['body'];
    remove: Extract<VotingEventContract['response']['remove'], { status: 200 }>['body'];
  };
}

export const votingEventCreatorFormDefault: VotingEvent['request']['create']['body'] = {
  options: [],
  description: '',
  title: '',
  maxSelectableOptions: 0,
  totalHouseholds: 0,
  totalWeight: 0,
  requiredParticipationRate: 0.75,
  requiredWeightRate: 0.75,
  // YYYY-MM-DD HH:mm
  startAt: dayjs().format('YYYY-MM-DD HH:mm'),
  endAt: dayjs().add(5, 'minutes').format('YYYY-MM-DD HH:mm'),
}

export type VotingEventItemDeepKeys = keyof FlattenObject<VotingEvent['basic']>
export const isVotingEvent = (data: unknown): data is ReturnType<typeof votingEventSchema.parse> => votingEventSchema.safeParse(data).success
