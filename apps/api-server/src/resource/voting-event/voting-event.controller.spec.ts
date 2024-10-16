import type { TestingModule } from '@nestjs/testing'
import type { Connection } from 'mongoose'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { Test } from '@nestjs/testing'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import { connect } from 'mongoose'

import dbConfig from '../../configs/db.config'
import mainConfig from '../../configs/main.config'
import secretConfig from '../../configs/secret.config'

import storageConfig from '../../configs/storage.config'
import { LoggerModule } from '../../logger/logger.module'

import { UtilsModule } from '../../utils/utils.module'
import { VotingEventController } from './voting-event.controller'
import { VotingEventModule } from './voting-event.module'

describe.skip('votingEventService', () => {
  let mongodb: MongoMemoryReplSet
  let mongoConnection: Connection

  let controller: VotingEventController

  beforeAll(async () => {
    mongodb = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    })
    const uri = mongodb.getUri()
    mongoConnection = (await connect(uri)).connection

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule,
        UtilsModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [mainConfig, dbConfig, secretConfig, storageConfig],
          envFilePath: [`env/.env.development`],
        }),
        MongooseModule.forRootAsync({
          useFactory: () => ({ uri }),
        }),

        VotingEventModule,
      ],
      providers: [],
      controllers: [],
    }).compile()

    controller = module.get<VotingEventController>(VotingEventController)
  })

  afterAll(async () => {
    await mongoConnection.dropDatabase()
    await mongoConnection.close()
    await mongodb.stop()
  })

  async function clearAll() {
    const collections = await mongoConnection.db?.collections() ?? []
    for (const collection of collections) {
      await collection.deleteMany({})
    }
  }
  /** 每次測試開始前與結束時，都清空 collection 資料，以免互相影響 */
  beforeEach(async () => await clearAll())
  afterEach(async () => await clearAll())

  it('controller 存在', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    expect(0).toBe(0)
  })

  describe('find', () => {
    expect(0).toBe(0)
  })

  describe('findOne', () => {
    expect(0).toBe(0)
  })

  describe('update', () => {
    expect(0).toBe(0)
  })
})
