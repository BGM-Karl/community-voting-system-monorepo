import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import flat from 'flat'

import { FilterQuery, Model } from 'mongoose'

import { defaultsDeep } from 'lodash'
import {
  {{pascalCase name}}Contract,
  PaginatedData,
} from '@community-voting-system/shared'
import { LoggerService } from '../../logger/logger.service'
import { UtilsService } from '../../utils/utils.service'

import { LogDocument } from '../../schema'
import { {{pascalCase name}}, {{pascalCase name}}Document } from './schema'

export enum UpdateError {
  TARGET_DOES_NOT_EXIST = 'target-does-not-exist',
}
export enum RemoveError {
  TARGET_DOES_NOT_EXIST = 'target-does-not-exist',
}

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

  create(dto: {{pascalCase name}}Contract['request']['create']['body']) {
    // 建立資料
    const data: {{pascalCase name}} = defaultsDeep(
      {
        timestamp: {
          createdAt: this.utilsService.getDate(),
        },
      },
      dto,
      new {{pascalCase name}}(),
    )

    return this.model.create(data)
  }

  /** 特別注意，如果資料可能破萬筆，請不要使用 skip 實現分頁查詢，
   * 因為 skip 實際上還是會掃描跳過的文件，會有額外的性能損耗。
   *
   * 請用 startId 的方式實現分頁查詢，詳見下文的方法二：
   *
   * [Method two: range query (+ limit)](https://isotropic.co/how-to-implement-pagination-in-mongodb/)
   */
  async find(dto?: {{pascalCase name}}Contract['request']['find']['query']) {
    const { skip = 0, limit = 10 } = dto ?? {}

    const match: FilterQuery<{{pascalCase name}}Document> = {
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
    dto: {{pascalCase name}}Contract['request']['update']['body'],
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

    const flatData = flat(updateData, { safe: true }) as any
    const newData = await this.model
      .findByIdAndUpdate(id, { $set: flatData }, { new: true })

    if (newData) {
      this.utilsService.addLog(this.logModel, {
        sourceId: oldData._id.toString(),
        oldData: oldData.toJSON(),
        newData: newData.toJSON(),
        description: dto.updateDescription,
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

  async findLogs(id: string, dto: {{pascalCase name}}Contract['request']['findLogs']['query']) {
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
