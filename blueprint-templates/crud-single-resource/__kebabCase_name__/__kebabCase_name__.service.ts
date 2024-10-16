import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import flat from 'flat'

import { FilterQuery, Model } from 'mongoose'

import { defaultsDeep } from 'lodash'
import { PaginatedData, {{pascalCase name}}Contract } from '@community-voting-system/shared'
import { LoggerService } from '../../logger/logger.service'
import { UtilsService } from '../../utils/utils.service'

import { LogDocument } from '../../schema'
import { {{pascalCase name}}, {{pascalCase name}}Document } from './schema'

@Injectable()
export class {{pascalCase name}}Service {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly utilsService: UtilsService,
    @InjectModel({{pascalCase name}}.name)
    private model: Model<{{pascalCase name}}Document>,
    @InjectModel(`{{pascalCase name}}Log`)
    private logModel: Model<LogDocument>,
  ) {
    //
  }

  private async create() {
    // 建立資料
    const data: {{pascalCase name}} = defaultsDeep(
      {
        timestamp: {
          createdAt: this.utilsService.getDate(),
        },
      },
      new {{pascalCase name}}(),
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
    dto: {{pascalCase name}}Contract['request']['update']['body'],
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
    dto: {{pascalCase name}}Contract['request']['findLogs']['query'],
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
