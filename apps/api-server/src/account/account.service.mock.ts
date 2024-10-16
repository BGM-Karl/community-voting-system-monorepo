import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import to from 'await-to-js'

import flat from 'flat'
import bcrypt from 'bcrypt'

import { defaults } from 'lodash'
import { pipe } from 'remeda'
import {
  AccountContract,
} from '@community-voting-system/shared'
import { LoggerService } from '../logger/logger.service'
import { UtilsService } from '../utils/utils.service'

import { Account, AccountDocument } from './schema'

export enum CreateError {
  FIND_BY_USERNAME = 'find-by-username',
  /** username 已存在，請嘗試其他名稱 */
  USERNAME_DUPLICATE = 'username-duplicate',
  FIND_BY_FIREBASE_ID = 'find-by-firebase-id',
  ACCOUNT_EXISTED = 'account-existed',
}

@Injectable()
export class AccountService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly utilsService: UtilsService,
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
  ) {
    //
  }

  /** 建立帳號
   *
   * 詳細錯誤型別為 CreateError
   */
  async create(dto: AccountContract['request']['create']['body']) {
    const { username, password } = dto

    if (username !== '') {
      // 檢查 username 是否重複
      const [findByUsernameError, existUsername] = await to(
        this.findByUsername(dto.username),
      )
      if (findByUsernameError) {
        throw new Error(CreateError.FIND_BY_USERNAME)
      }

      if (existUsername) {
        throw new Error(CreateError.USERNAME_DUPLICATE)
      }
    }

    // 建立資料
    const data: Account = defaults(
      {
        timestamp: {
          createdAt: this.utilsService.getDate(),
        },
      },
      dto,
      new Account(),
    )

    if (password) {
      const salt = await bcrypt.genSalt()
      data.password = await bcrypt.hash(password, salt)
    }

    const result = await this.accountModel.create(data)
    return result._id.toString()
  }

  getTotalNumber() {
    return this.accountModel
      .countDocuments({
        'timestamp.deletedAt': {
          $exists: false,
        },
      })
      .exec()
  }

  find(dto: AccountContract['request']['find']['query']) {
    const { skip = 0, limit = 30 } = dto
    return this.accountModel
      .find({
        'timestamp.deletedAt': {
          $exists: false,
        },
      })
      .skip(skip)
      .limit(limit)
      .lean()
  }

  findById(id: string, includeSecret = false): Promise<AccountDocument | null> {
    const task = pipe(this.accountModel.findById(id), (query) => {
      if (!includeSecret)
        return query

      return query.select('+password +firebaseIds +refreshToken')
    })

    return task.lean()
  }

  async findByUsername(
    username: string,
    includeSecret = false,
  ) {
    const task = pipe(this.accountModel.find({ username }), (query) => {
      if (!includeSecret)
        return query

      return query.select('+password +oAuthProviders +refreshToken')
    })

    const [err, result] = await to(task.exec())
    if (err) {
      return Promise.reject(err)
    }
    const [account] = result
    return account
  }

  async findByFirebaseId(
    id: string,
    includeSecret = false,
  ) {
    const task = pipe(
      this.accountModel.find({
        firebaseIds: id,
      }),
      (query) => {
        if (!includeSecret)
          return query

        return query.select('+password +oAuthProviders +refreshToken')
      },
    )

    const [err, result] = await to(task.exec())
    if (err) {
      return Promise.reject(err)
    }
    const [account] = result
    return account
  }

  update(id: string, dto: AccountContract['request']['update']['body']): Promise<AccountDocument | null> {
    const updateData = {
      ...dto,
      timestamp: {
        updatedAt: this.utilsService.getDate(),
      },
    }

    const data = flat(updateData, { safe: true }) as any
    return this.accountModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec()
  }

  /** 更新 Refresh Token */
  updateRefreshToken(id: string, token: string) {
    return this.accountModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            refreshToken: token,
          },
        },
        { new: true },
      )
      .exec()
  }

  remove(id: string): Promise<AccountDocument | null> {
    return this.accountModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            'timestamp.deletedAt': this.utilsService.getDate(),
          },
        },
        { new: true },
      )
      .exec()
  }
}
