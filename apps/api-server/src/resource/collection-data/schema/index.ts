import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import mongooseAutopopulate from 'mongoose-autopopulate'
import {
  Timestamp,
  TimestampSchema,
} from '../../../schema'

@Schema({
  toObject: { getters: true, virtuals: true },
  toJSON: { getters: true, virtuals: true },
})
export class CollectionData {
  /** mongoose 原有的 id，但原本是 optional，這裡改為 required */
  id!: string

  @Prop({ required: true })
  name: string = ''

  @Prop()
  description: string = ''

  @Prop()
  remark: string = ''

  @Prop({
    type: TimestampSchema,
    required: true,
  })
  timestamp!: Timestamp
}
export const CollectionDataSchema
  = SchemaFactory.createForClass(CollectionData)
export type CollectionDataDocument = HydratedDocument<CollectionData>

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
CollectionDataSchema.plugin(mongooseAutopopulate)
