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

import { SingleDataModule } from './single-data.module'
import { SingleDataService } from './single-data.service'

describe.skip('singleDataService', () => {
  let mongodb: MongoMemoryReplSet
  let mongoConnection: Connection

  let service: SingleDataService
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
      replSet: { storageEngine: 'wiredTiger' },
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

        SingleDataModule,
      ],
      providers: [],
    }).compile()

    service = module.get<SingleDataService>(SingleDataService)
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

  it('service 存在', () => {
    expect(service).toBeDefined()
  })

  describe('get', () => {
    it('取得預設資料', async () => {
      const data = await service.get()
      expect(data).toMatchObject({
        name: '',
        description: '',
        remark: '',
      })
    })
  })

  describe('update', () => {
    it('name 改為 cod', async () => {
      const data = await service.update({
        name: 'cod',
      })

      expect(data?.name).toBe('cod')
      expect(data?.timestamp.updatedAt).not.toBeUndefined()
    })

    it('name 不可改為 {data: 123}', async () => {
      const value: any = {
        name: { data: 123 },
      }

      await expect(service.update(value)).rejects.toThrow()
    })
  })

  /* describe('find', () => {
    it('預設值', async () => {
      const params = new FindSingleDataDto();
      const data = await service.find(params);

      expect(data).toEqual({
        total: 0,
        skip: 0,
        limit: 30,
        data: [],
      });
    });
  }); // */
})
