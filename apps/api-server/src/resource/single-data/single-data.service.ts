import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { PaginatedData, SingleDataContract } from '@community-voting-system/shared'

import flat from 'flat'

import { defaultsDeep } from 'lodash'
import { FilterQuery, Model } from 'mongoose'
import { LoggerService } from '../../logger/logger.service'
import { LogDocument } from '../../schema'

import { UtilsService } from '../../utils/utils.service'
import { SingleData, SingleDataDocument } from './schema'

@Injectable()
export class SingleDataService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly utilsService: UtilsService,
    @InjectModel(SingleData.name)
    private model: Model<SingleDataDocument>,
    @InjectModel(`SingleDataLog`)
    private logModel: Model<LogDocument>,
  ) {
    //
  }

  private async create() {
    // 建立資料
    const data: SingleData = defaultsDeep(
      {
        timestamp: {
          createdAt: this.utilsService.getDate(),
        },
      },
      new SingleData(),
    )

    return this.model.create(data)
  }

  async get() {
    const result = await this.model.find().exec()
    const data = result?.[0]

    if (!data) {
      return this.create()
    }

    return data
  }

  async update(
    dto: SingleDataContract['request']['update']['body'],
    editorId?: string,
  ) {
    const oldData = await this.get()

    const updateData = {
      ...dto,
      timestamp: {
        updatedAt: this.utilsService.getDate(),
      },
    }

    const flatData = flat(updateData, { safe: true }) as any
    const newData = await this.model
      .findByIdAndUpdate(oldData._id, { $set: flatData }, { new: true })

    if (newData) {
      this.utilsService.addLog(this.logModel, {
        sourceId: oldData._id.toString(),
        oldData: oldData.toJSON(),
        newData: newData.toJSON(),
        description: dto?.updateDescription,
        editor: editorId,
      })
    }

    return newData
  }

  async findLogs(
    dto: SingleDataContract['request']['findLogs']['query'],
  ) {
    const target = await this.get()

    const { skip = 0, limit = 10 } = dto

    const match: FilterQuery<LogDocument> = {
      sourceId: target._id.toString(),
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
