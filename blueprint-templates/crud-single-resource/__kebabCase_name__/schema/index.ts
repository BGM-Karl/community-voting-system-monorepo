import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongooseAutopopulate from 'mongoose-autopopulate'
import { HydratedDocument } from 'mongoose'
import {
  Timestamp,
  TimestampSchema,
} from '../../../schema'

@Schema({
  toObject: { getters: true },
  toJSON: { getters: true },
})
export class {{pascalCase name }} {
  /** mongoose 原有的 id，但原本是 optional，這裡改為 required */
  id!: string

  @Prop()
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
export const {{ pascalCase name }}Schema = SchemaFactory.createForClass({{ pascalCase name }})
export type {{pascalCase name }}Document = HydratedDocument < {{pascalCase name }}>

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
  {{pascalCase name }}Schema.plugin(mongooseAutopopulate)
