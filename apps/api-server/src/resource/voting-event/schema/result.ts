import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { VotingEventOptionResult, VotingEventOptionResultSchema } from './option-result'
// 投票結果
@Schema({ toObject: { getters: true, virtuals: true }, toJSON: { getters: true, virtuals: true }, _id: false })
export class VotingEventResult {
  @Prop()
  participatingHouseholds: number = 0

  @Prop()
  participatingWeight: number = 0

  @Prop({
    type: [VotingEventOptionResultSchema],
  })
  optionResults: VotingEventOptionResult[] = []
}
export const VotingEventResultSchema = SchemaFactory.createForClass(VotingEventResult)
export type VotingEventResultDocument = HydratedDocument<VotingEventResult>
