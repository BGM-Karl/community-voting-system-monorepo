import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

// 投票選項
@Schema({ toObject: { getters: true, virtuals: true }, toJSON: { getters: true, virtuals: true } })
export class VotingEventOption {
  id!: string

  @Prop()
  content: string = ''
}
export const VotingEventOptionSchema = SchemaFactory.createForClass(VotingEventOption)
export type VotingEventOptionDocument = HydratedDocument<VotingEventOption>
