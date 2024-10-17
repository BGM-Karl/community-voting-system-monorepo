import {
  PaginatedData,
  VotingEventContract,
} from '@community-voting-system/shared'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import to from 'await-to-js'

import flat from 'flat'
import { defaultsDeep } from 'lodash'
import { FilterQuery, Model } from 'mongoose'
import { AccountService } from 'src/account/account.service'

import { parseObjectId } from 'src/common/utils'
import { LoggerService } from '../../logger/logger.service'
import { LogDocument } from '../../schema'
import { UtilsService } from '../../utils/utils.service'
import { VotingEvent, VotingEventDocument } from './schema'

export enum UpdateError {
  TARGET_DOES_NOT_EXIST = 'target-does-not-exist',
}
export enum RemoveError {
  TARGET_DOES_NOT_EXIST = 'target-does-not-exist',
}

@Injectable()
export class VotingEventService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly utilsService: UtilsService,
    @InjectModel(VotingEvent.name)
    private model: Model<VotingEventDocument>,
    @InjectModel(`VotingEventLog`)
    private logModel: Model<LogDocument>,
    private readonly accountService: AccountService,

  ) {
    //
  }

  create(dto: VotingEventContract['request']['create']['body']) {
    // 建立資料
    const data: VotingEvent = defaultsDeep(
      {
        timestamp: {
          createdAt: this.utilsService.getDate(),
          startAt: dto.startAt,
          endAt: dto.endAt,
        },
      },
      dto,
      new VotingEvent(),
    )

    return this.model.create(data)
  }

  async vote(userId: string, id: string, dto: VotingEventContract['request']['vote']['body']) {
    const [findUserError, user] = await to(this.accountService.findById(userId))
    if (findUserError || !user) {
      console.error(`Vote failed: ${findUserError}`)
      return
    }

    {
      // 檢查是否已經投過票
      const [error, result] = await to(this.model.findOne({
        '_id': parseObjectId(id),
        'result.optionResults.voterIds': parseObjectId(userId),
      }))
      if (error) {
        console.error(`檢查是否已經投過票失敗: ${error}`)
        throw new Error('檢查是否已經投過票失敗')
      }
      if (result) {
        throw new Error('已經投過票')
      }
    }

    const additionalWeight = user.weight // 增加的weight
    const optionId = dto.optionIdList[0]
    if (!optionId) {
      throw new Error('optionId is required')
    }
    const optionObjectId = parseObjectId(optionId)

    const [error, results] = await to(this.model.aggregate([
      {
        $match: { 'options._id': optionObjectId },
      },
      {
        $project: {
          optionResults: {
            $filter: {
              input: '$result.optionResults',
              as: 'result',
              cond: { $eq: ['$$result.optionId', optionId] },
            },
          },
        },
      },
    ]))
    if (error) {
      console.error(`Vote failed: ${error}`)
      return
    }
    if (results.length > 0 && results[0].optionResults.length > 0) {
      // 如果結果存在，則進行更新
      const [error, result] = await to(this.model.updateOne(
        {
          '_id': parseObjectId(id),
          'options._id': optionObjectId,
          'result.optionResults.optionId': optionId,
        },
        {
          $inc: {
            'result.participatingHouseholds': 1,
            'result.participatingWeight': additionalWeight,
            'result.optionResults.$.votes': 1,
            'result.optionResults.$.weight': additionalWeight,
          },
          $push: {
            'result.optionResults.$.voterIds': userId,
          },
          // $addToSet: {
          //   'result.optionResults.$.voterIds': voterId, // 添加投票者ID，避免重複
          // },
        },
      ))
      if (error) {
        console.error(`Voting results更新失敗: ${error}`)
        return
      }
    }
    else {
      // 取得 option
      const [error, result] = await to(this.model.findOne(
        { '_id': parseObjectId(id), 'options._id': optionObjectId },

      ))
      const option = result?.options.find((option) => option.id === optionId)
      if (error || !option) {
        console.error(`取得選項失敗: ${error}`)
        throw new Error('取得選項失敗')
      }

      // 如果結果不存在，則新增一個並進行更新
      const newOptionResult = {
        content: option.content, // 投票的選項內容
        optionId: option.id, // 投票的選項ID
        votes: 1,
        weight: additionalWeight,
        voterIds: [
          userId,
        ],
      }

      {
        const [error, result] = await to(this.model.updateOne(
          { '_id': parseObjectId(id), 'options._id': optionObjectId },
          {
            $push: { 'result.optionResults': newOptionResult },
            $inc: {
              'result.participatingHouseholds': 1,
              'result.participatingWeight': additionalWeight,
            },
          },
        ))
        if (error) {
          console.error(`建立Voting results失敗: ${error}`)
          return
        }
      }
    }
    return this.findOne(results[0]._id)
  }

  /** 特別注意，如果資料可能破萬筆，請不要使用 skip 實現分頁查詢，
   * 因為 skip 實際上還是會掃描跳過的文件，會有額外的性能損耗。
   *
   * 請用 startId 的方式實現分頁查詢，詳見下文的方法二：
   *
   * [Method two: range query (+ limit)](https://isotropic.co/how-to-implement-pagination-in-mongodb/)
   */
  async find(dto?: VotingEventContract['request']['find']['query']) {
    const { skip = 0, limit = 10 } = dto ?? {}

    const match: FilterQuery<VotingEventDocument> = {
      'timestamp.deletedAt': {
        $exists: false,
      },
    }

    const [total, data] = await Promise.all([
      this.model.countDocuments(match),
      this.model.find(match).skip(skip).limit(limit).exec(),
    ])

    return {
      total: total ?? 0,
      skip,
      limit,
      data: data ?? [],
    }
  }

  findOne(id: string) {
    return this.model.findById(id).exec()
  }

  async update(
    id: string,
    dto: VotingEventContract['request']['update']['body'],
    editorId?: string,
  ) {
    const oldData = await this.findOne(id)
    if (!oldData) {
      throw new Error(UpdateError.TARGET_DOES_NOT_EXIST)
    }

    const updateData = {
      ...dto,
      timestamp: {
        updatedAt: this.utilsService.getDate(),
      },
    }
    if (dto.startAt)
      updateData['timestamp.startAt'] = dto.startAt
    if (dto.endAt)
      updateData['timestamp.endAt'] = dto.endAt

    const flatData = flat(updateData, { safe: true }) as any
    const newData = await this.model
      .findByIdAndUpdate(id, { $set: flatData }, { new: true })

    if (newData) {
      this.utilsService.addLog(this.logModel, {
        sourceId: oldData._id.toString(),
        oldData: oldData.toJSON(),
        newData: newData.toJSON(),
        description: dto.description,
        editor: editorId,
      })
    }

    return newData
  }

  async remove(id: string) {
    const document = await this.findOne(id)
    if (!document) {
      throw new Error(RemoveError.TARGET_DOES_NOT_EXIST)
    }

    return this.model
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

  async findLogs(id: string, dto: VotingEventContract['request']['findLogs']['query']) {
    const { skip = 0, limit = 10 } = dto

    const match: FilterQuery<LogDocument> = {
      sourceId: id,
    }

    const [
      total = 0,
      data = [],
    ] = await Promise.all([
      this.logModel.countDocuments(match),
      this.logModel
        .find(match)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit),
    ])

    const result: PaginatedData<LogDocument> = {
      total,
      skip,
      limit,
      data,
    }
    return result
  }
}
