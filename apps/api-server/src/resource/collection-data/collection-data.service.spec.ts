import type { TestingModule } from '@nestjs/testing'
import type { CollectionDataContract } from '@community-voting-system/shared'
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
import { CollectionDataModule } from './collection-data.module'
import {
  CollectionDataService,
  RemoveError,
  UpdateError,
} from './collection-data.service'

describe.skip('collectionDataService', () => {
  let mongodb: MongoMemoryReplSet
  let mongoConnection: Connection

  let service: CollectionDataService
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

        CollectionDataModule,
      ],
      providers: [],
    }).compile()

    service = module.get<CollectionDataService>(CollectionDataService)
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

  describe('create', () => {
    it('缺少必填參數', async () => {
      const params: any = {}
      await expect(service.create(params)).rejects.toThrow()
    })
  })

  describe('find', () => {
    it('預設值', async () => {
      const params: CollectionDataContract['request']['find']['query'] = {
        limit: 10,
        skip: 0,
      }
      const data = await service.find(params)

      expect(data).toEqual({
        ...params,
        total: 0,
        data: [],
      })
    })

    it('取得 2 筆資料', async () => {
      const createParams: CollectionDataContract['request']['create']['body'] = {
        name: 'test',
      }
      await Promise.all([
        service.create(createParams),
        service.create(createParams),
      ])

      const data = await service.find({
        limit: 10,
        skip: 0,
      })

      expect(data.total).toBe(2)
    })
  })

  describe('findOne', () => {
    it('取得指定資料', async () => {
      const createParams: CollectionDataContract['request']['create']['body'] = {
        name: 'test',
      }
      const createdData = await service.create(createParams)
      const findData = await service.findOne(createdData._id.toString())

      expect(findData?.toObject()).toEqual(createdData.toObject())
    })

    it('iD 不為 ObjectId', async () => {
      await expect(service.findOne('')).rejects.toThrow()
    })

    it('取得不存在資料', async () => {
      const findData = await service.findOne('639709b56f4c80dd5fd48a1f')
      expect(findData).toBeNull()
    })
  })

  describe('update', () => {
    it('目標 ID 不存在', async () => {
      await expect(
        service.update('639709b56f4c80dd5fd48a1f', {}),
      ).rejects.toThrowError(UpdateError.TARGET_DOES_NOT_EXIST)
    })

    it('修改 name 為 cod', async () => {
      const params: CollectionDataContract['request']['create']['body'] = {
        name: 'test',
      }
      const data = await service.create(params)
      const newData = await service.update(data._id.toString(), {
        name: 'cod',
      })

      expect(newData?.name).toBe('cod')
    })
  })

  describe('remove', () => {
    it('目標 ID 不存在', async () => {
      await expect(
        service.remove('639709b56f4c80dd5fd48a1f'),
      ).rejects.toThrowError(RemoveError.TARGET_DOES_NOT_EXIST)
    })

    it('刪除建立資料', async () => {
      const params: CollectionDataContract['request']['create']['body'] = {
        name: 'test',
      }
      const data = await service.create(params)
      await service.remove(data._id.toString())

      const findData = await service.findOne(data._id.toString())
      expect(findData?.timestamp.deletedAt).toBeTruthy()
    })
  })

  /* describe('find', () => {
    it('預設值', async () => {
      const params = new CollectionDataContract['request']['find']['query']();
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
