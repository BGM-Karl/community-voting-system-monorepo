import {
  Log as ILog,
  Timestamp as ITimestamp,
} from '@community-voting-system/shared'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import Mongoose, { HydratedDocument } from 'mongoose'
import mongooseAutopopulate from 'mongoose-autopopulate'
import { parseObjectId } from '../common/utils'

export function toISOString(date?: Date) {
  if (!date)
    return date
  try {
    return date.toISOString()
  }
  catch (error) {
    return date
  }
}

@Schema({
  _id: false,
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class Timestamp implements ITimestamp {
  @Prop({
    type: Mongoose.Schema.Types.Date,
    required: true,
    get: toISOString,
    // FIX: mongoose v8.5.2 getter 莫名其妙失去作用，只好改用 transform
    transform: toISOString,
  })
  createdAt!: string

  @Prop({
    type: Mongoose.Schema.Types.Date,
    get: toISOString,
    // FIX: mongoose v8.5.2 getter 莫名其妙失去作用，只好改用 transform
    transform: toISOString,
  })
  updatedAt?: string

  @Prop({
    type: Mongoose.Schema.Types.Date,
    get: toISOString,
    // FIX: mongoose v8.5.2 getter 莫名其妙失去作用，只好改用 transform
    transform: toISOString,
  })
  deletedAt?: string
}
export const TimestampSchema = SchemaFactory.createForClass(Timestamp)

@Schema({
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class Log<Data = undefined> implements ILog<Data> {
  /** mongoose 原有的 id，但原本是 optional，這裡改為 required */
  id!: string

  @Prop({ index: true })
  sourceId!: string

  @Prop({ type: Mongoose.Schema.Types.Mixed })
  changes: ILog['changes'] = []

  @Prop({ type: Mongoose.Schema.Types.Mixed })
  oldData?: Data

  @Prop()
  description: string = ''

  @Prop({
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    autopopulate: true,
    set: parseObjectId,
    index: true,
  })
  editor?: ILog['editor']

  @Prop({
    type: TimestampSchema,
    required: true,
  })
  timestamp!: Timestamp
}
export const LogSchema = SchemaFactory.createForClass(Log)
LogSchema.plugin(mongooseAutopopulate)

export type LogDocument<T = undefined> = HydratedDocument<Log<T>>
