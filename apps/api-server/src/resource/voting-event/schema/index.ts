import { VotingEvent as VotingEventOnZod } from '@community-voting-system/shared'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import dayjs from 'dayjs'
import { HydratedDocument } from 'mongoose'
import mongooseAutopopulate from 'mongoose-autopopulate'
import { VotingEventOption, VotingEventOptionSchema } from './option'
import { VotingEventResult, VotingEventResultSchema } from './result'
import { Timestamp, TimestampSchema } from './timestamp'

type VotingEventOnDb = Omit<VotingEventOnZod, 'timestamp' | 'status'>
@Schema({
  toObject: { getters: true, virtuals: true },
  toJSON: { getters: true, virtuals: true },
})
// status: z.enum(['Not started', 'In progress', 'Ended']).describe('Current status'),

export class VotingEvent implements VotingEventOnDb {
  /** mongoose 原有的 id，但原本是 optional，這裡改為 required */
  id!: string

  status: 'Not started' | 'In progress' | 'Ended' = 'Not started'

  @Prop()
  isEndedEarly: boolean = false

  @Prop()
  title: string = ''

  @Prop()
  description: string = ''

  @Prop()
  requiredParticipationRate: number = 0.5

  @Prop()
  requiredWeightRate: number = 0.5

  @Prop()
  maxSelectableOptions: number = 0

  @Prop()
  totalHouseholds: number = 0

  @Prop()
  totalWeight: number = 0

  @Prop({
    type: [VotingEventOptionSchema],
  })
  options: VotingEventOption[] = []

  @Prop({
    type: VotingEventResultSchema,
  })
  result: VotingEventResult = new VotingEventResult()

  @Prop({
    type: TimestampSchema,
    required: true,
  })
  timestamp!: Timestamp
}
export const VotingEventSchema
  = SchemaFactory.createForClass(VotingEvent)
export type VotingEventDocument = HydratedDocument<VotingEvent>

/** 使用自動填充
 *
 * @example
 * ```ts
 * @Prop({
 *   type: Mongoose.Schema.Types.ObjectId,
 *   ref: Course.name,
 *   autopopulate: true,
 * })
 * ```
 */
VotingEventSchema.plugin(mongooseAutopopulate)

// status 虛擬屬性
VotingEventSchema.virtual('status').get(function (this: VotingEventDocument) {
  // 尚未開始
  if (dayjs().isBefore(this.timestamp.startAt)) {
    return 'Not started'
  }
  // Ended
  if (dayjs().isAfter(this.timestamp.endAt)) {
    return 'Ended'
  }
  // In progress
  if (dayjs().isAfter(this.timestamp.startAt) && dayjs().isBefore(this.timestamp.endAt)) {
    return 'In progress'
  }
})
