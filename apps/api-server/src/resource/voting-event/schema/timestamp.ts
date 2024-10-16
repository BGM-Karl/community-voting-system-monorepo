import { VotingEvent as VotingEventOnZod } from '@community-voting-system/shared'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import Mongoose from 'mongoose'
import { toISOString } from 'src/schema'

type ITimestamp = VotingEventOnZod['timestamp']

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
    required: true,
    get: toISOString,
    // FIX: mongoose v8.5.2 getter 莫名其妙失去作用，只好改用 transform
    transform: toISOString,
  })
  startAt!: string

  @Prop({
    type: Mongoose.Schema.Types.Date,
    required: true,
    get: toISOString,
    // FIX: mongoose v8.5.2 getter 莫名其妙失去作用，只好改用 transform
    transform: toISOString,
  })
  endAt!: string

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
