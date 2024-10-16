import type { TestingModule } from '@nestjs/testing'
import type { Connection } from 'mongoose'
import { Readable } from 'node:stream'
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

import { StorageModule } from '../../storage/storage.module'
import { StorageService } from '../../storage/storage.service'
import { UtilsModule } from '../../utils/utils.module'
import { {{pascalCase name}}Controller } from './{{kebabCase name}}.controller'
import { {{pascalCase name}}Module } from './{{kebabCase name}}.module'

describe.skip('{{camelCase name}}Service', () => {
  let mongodb: MongoMemoryReplSet
  let mongoConnection: Connection

  let controller: {{pascalCase name}}Controller
  let storageService: StorageService

  const img: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test-file.png',
    encoding: '7bit',
    mimetype: 'image/png',
    buffer: Buffer.from('test-buffer'),
    size: 1024,
    stream: new Readable(),
    destination: 'uploads/',
    filename: 'test-file.png',
    path: 'uploads/test-file.png',
  }

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
        StorageModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [mainConfig, dbConfig, secretConfig, storageConfig],
          envFilePath: [`env/.env.development`],
        }),
        MongooseModule.forRootAsync({
          useFactory: () => ({ uri }),
        }),

        {{pascalCase name}}Module,
      ],
      providers: [],
      controllers: [],
    }).compile()

    controller = module.get<{{pascalCase name}}Controller>({{pascalCase name}}Controller)
    storageService = module.get<StorageService>(StorageService)
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
