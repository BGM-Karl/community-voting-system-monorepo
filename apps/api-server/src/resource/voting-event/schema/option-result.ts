import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

// 選項的投票結果
@Schema({ toObject: { getters: true, virtuals: true }, toJSON: { getters: true, virtuals: true }, _id: false })
export class VotingEventOptionResult {
  @Prop()
  content: string = ''

  @Prop()
  optionId: string = ''

  @Prop()
  votes: number = 0

  @Prop()
  weight: number = 0

  // @Prop({
  //   type: Mongoose.Schema.Types.ObjectId,
  //   ref: Account.name,
  //   autopopulate: true,
  //   set: parseObjectId,
  // })
  // voterIds: string[] = []

  @Prop({
    type: [String],
  })
  voterIds: string[] = []
}
export const VotingEventOptionResultSchema = SchemaFactory.createForClass(VotingEventOptionResult)
export type VotingEventOptionResultDocument = HydratedDocument<VotingEventOptionResult>
