import type { INestApplication } from '@nestjs/common'
import type { TestingModule } from '@nestjs/testing'
import type { CollectionDataContract } from '@community-voting-system/shared'
import type { Connection } from 'mongoose'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

import { Test } from '@nestjs/testing'
import { pick } from 'lodash'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import { connect } from 'mongoose'
import { AppMockModule } from '../../app.module.mock'
import { JwtGuard } from '../../auth/guard/jwt.guard'
import { JwtGuardMock } from '../../auth/guard/jwt.guard.mock'
import { NoopInterceptor } from '../../common/interceptor'

import dbConfig from '../../configs/db.config'
import mainConfig from '../../configs/main.config'
import secretConfig from '../../configs/secret.config'
import storageConfig from '../../configs/storage.config'
import { createStorageFileApi } from '../../storage/storage.e2e'
import { createCollectionDataApi } from './collection-data.e2e'

describe('collectionData e2e', () => {
  let mongodb: MongoMemoryReplSet
  let mongoConnection: Connection
  let app: INestApplication
  let server: ReturnType<INestApplication['getHttpServer']>

  let storageFileApi: ReturnType<typeof createStorageFileApi>
  let collectionDataApi: ReturnType<typeof createCollectionDataApi>

  beforeAll(async () => {
    // 啟動記憶體模式的 MongoDB
    mongodb = await MongoMemoryReplSet.create({
      replSet: { storageEngine: 'wiredTiger' },
    })
    const uri = mongodb.getUri()
    mongoConnection = (await connect(uri)).connection

    // 建立模擬用的 Module，概念同 AppModule，同 main.ts 的過程
    const module: TestingModule = await Test
      .createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [mainConfig, dbConfig, secretConfig, storageConfig],
            envFilePath: [`env/.env.development`],
          }),
          MongooseModule.forRootAsync({
            useFactory: () => ({ uri }),
          }),

          AppMockModule,
        ],
        providers: [],
        controllers: [],
      })
      // JwtGuard 直接放行（如果需要測試登入，請自行修改）
      .overrideGuard(JwtGuard)
      .useClass(JwtGuardMock)
      // 關閉 CacheInterceptor
      .overrideInterceptor(CacheInterceptor)
      .useClass(NoopInterceptor)
      .compile()

    app = module.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    )
    await app.init()
    server = app.getHttpServer()

    storageFileApi = createStorageFileApi(server)

    collectionDataApi = createCollectionDataApi(server)
  })

  /** 測試結束，關閉 DB */
  afterAll(async () => {
    await mongoConnection.dropDatabase()
    await mongoConnection.close()
    await mongodb.stop()
  })

  async function clearAll() {
    const collections = await mongoConnection.db?.collections() ?? []
    await Promise.allSettled(
      Object.values(collections).map((collection) => {
        /** 刻意不清空 accounts collection，保留 mock 使用者資料
         *
         * 方便登入相關測試
         */
        if (collection.collectionName === 'accounts')
          return undefined
        return collection.deleteMany({})
      }),
    )
  }
  /** 每次測試開始前與結束時，都清空 collection 資料，以免互相影響 */
  beforeEach(async () => await clearAll())
  afterEach(async () => await clearAll())

  describe('建立 collection-data', () => {
    it('缺少必填參數', async () => {
      await collectionDataApi.create(undefined as any, 400)
    })
    it('必填參數', async () => {
      const expectData: CollectionDataContract['request']['create']['body'] = {
        name: 'test',
        description: '安安',
      }

      const result = await collectionDataApi.create(expectData)

      expect(result).toMatchObject(pick(expectData, ['name', 'description']))
      expect(result.timestamp).toBeDefined()
    })

    it('加入圖片', async () => {
      const image = await storageFileApi.create()

      const expectData: CollectionDataContract['request']['create']['body'] = {
        name: 'test',
        image: { file: image.id, alt: '' },
      }

      const body = await collectionDataApi.create(expectData)

      expect(body).toMatchObject({
        ...expectData,
        image: { file: image, alt: '' },
      })
      expect(body.timestamp).toBeDefined()
    })
  })

  describe('取得 collection-data', () => {
    it('預設值', async () => {
      const body = await collectionDataApi.find({
        limit: 10,
        skip: 0,
      })

      expect(body).toEqual({
        total: 0,
        skip: 0,
        limit: 10,
        data: [],
      })
    })

    it('取得指定筆數資料', async () => {
      const createParams: CollectionDataContract['request']['create']['body'] = {
        name: 'test',
      }

      await Promise.allSettled([
        collectionDataApi.create(createParams),
        collectionDataApi.create(createParams),
      ])

      {
        const result = await collectionDataApi.find()
        expect(result.total).toBe(2)
        expect(result.data).toHaveLength(2)
      }

      {
        const result = await collectionDataApi.find({ limit: 1 })
        expect(result.total).toBe(2)
        expect(result.data).toHaveLength(1)
      }
    })

    it('跳過指定筆數資料', async () => {
      const createParams: CollectionDataContract['request']['create']['body'] = {
        name: 'test',
      }

      const data01 = await collectionDataApi.create(createParams)
      const data02 = await collectionDataApi.create(createParams)

      const result = await collectionDataApi.find({ skip: 1 })
      expect(result.data[0]?.id).toBe(data02.id)
    })
  })

  describe('取得指定 collection-data', () => {
    it('取得指定資料', async () => {
      const createParams: CollectionDataContract['request']['create']['body'] = {
        name: 'test',
      }

      const data = await collectionDataApi.create(createParams)
      const newData = await collectionDataApi.findOne(data.id)

      expect(newData).toEqual(data)
    })
  })

  describe('更新指定 collection-data', () => {
    it('目標 ID 不存在', async () => {
      await collectionDataApi.findOne('639709b56f4c80dd5fd48a1f', 404)
    })

    it('修改 name 為 cod', async () => {
      const params: CollectionDataContract['request']['create']['body'] = {
        name: 'test',
      }

      const data = await collectionDataApi.create(params)
      const newData = await collectionDataApi.update(data.id, {
        name: 'cod',
      })

      expect(newData.name).toBe('cod')
    })

    it('上傳圖片', async () => {
      const params: CollectionDataContract['request']['create']['body'] = {
        name: 'test',
      }

      const data = await collectionDataApi.create(params)
      const image = await storageFileApi.create()
      const newData = await collectionDataApi.update(data.id, {
        image: { file: image.id, alt: '' },
      })

      expect(newData.image).toMatchObject({ file: image, alt: '' })
      expect(newData.timestamp.updatedAt).toBeDefined()
    })
  })

  describe('刪除指定 collection-data', () => {
    it('目標 ID 不存在', async () => {
      await collectionDataApi.remove('639709b56f4c80dd5fd48a1f', 404)
    })

    it('刪除資料', async () => {
      const params: CollectionDataContract['request']['create']['body'] = {
        name: 'test',
      }

      const data = await collectionDataApi.create(params)
      const newData = await collectionDataApi.remove(data.id)

      expect(newData.name).toBe(params.name)
      expect(newData.timestamp.deletedAt).toBeDefined()
    })

    it('刪除資料後，find 無法取得', async () => {
      const params: CollectionDataContract['request']['create']['body'] = {
        name: 'test',
      }

      const data = await collectionDataApi.create(params)
      await collectionDataApi.remove(data.id)
      const result = await collectionDataApi.find()

      expect(result.data).toHaveLength(0)
    })
  })

  describe('取得指定資料 logs', () => {
    it('未有任何紀錄', async () => {
      const data = await collectionDataApi.create({ name: 'name' })
      const result = await collectionDataApi.findLogs(data.id)

      expect(result.total).toBe(0)
    })

    it('1 筆變更紀錄', async () => {
      const data = await collectionDataApi.create({ name: 'name' })
      await collectionDataApi.update(data.id, { name: 'new-name' })

      const result = await collectionDataApi.findLogs(data.id)
      expect(result.total).toBe(1)
    })

    it('2 筆變更紀錄', async () => {
      const data = await collectionDataApi.create({ name: 'name' })
      await collectionDataApi.update(data.id, { name: 'new-name' })
      await collectionDataApi.update(data.id, { name: 'new-new-name' })

      const result = await collectionDataApi.findLogs(data.id)
      expect(result.total).toBe(2)
    })

    it('只能指定資料的變更紀錄', async () => {
      const data = await collectionDataApi.create({ name: 'name' })
      await collectionDataApi.update(data.id, { name: 'new-name' })

      const otherData = await collectionDataApi.create({ name: 'name' })
      const result = await collectionDataApi.findLogs(otherData.id)

      expect(result.total).toBe(0)
    })
  })
})
