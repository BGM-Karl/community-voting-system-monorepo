import { ACCOUNT_ROLE, AccountRole } from '@community-voting-system/shared'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import Mongoose, { HydratedDocument } from 'mongoose'
import mongooseAutopopulate from 'mongoose-autopopulate'
import { Timestamp, toISOString } from '../../schema'

@Schema({
  _id: false,
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class AccountTimestamp extends Timestamp {
  @Prop({
    type: Mongoose.Schema.Types.Date,
    get: toISOString,
  })
  disabledAt?: string
}

@Schema({
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class Account {
  /** mongoose 原有的 id，但原本是 optional，這裡改為 required */
  id!: string

  @Prop({ type: String, enum: ACCOUNT_ROLE })
  role: AccountRole = ACCOUNT_ROLE.BASIC

  @Prop()
  username: string = ''

  @Prop()
  description: string = ''

  @Prop({ select: false })
  password: string = ''

  @Prop()
  name: string = ''

  @Prop()
  weight: number = 0

  @Prop({ select: false })
  refreshToken: string = ''

  @Prop({ type: SchemaFactory.createForClass(AccountTimestamp) })
  timestamp!: AccountTimestamp
}
export type AccountDocument = HydratedDocument<Account>
export const AccountSchema = SchemaFactory.createForClass(Account)

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
AccountSchema.plugin(mongooseAutopopulate)
