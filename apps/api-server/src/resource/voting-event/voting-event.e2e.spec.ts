import type { VotingEventContract } from '@community-voting-system/shared'
import type { INestApplication } from '@nestjs/common'
import type { TestingModule } from '@nestjs/testing'
import type { Connection } from 'mongoose'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

import { Test } from '@nestjs/testing'
import dayjs from 'dayjs'
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
import { createVotingEventApi } from './voting-event.e2e'

describe('votingEvent e2e', () => {
  let mongodb: MongoMemoryReplSet
  let mongoConnection: Connection
  let app: INestApplication
  let server: ReturnType<INestApplication['getHttpServer']>

  let votingEventApi: ReturnType<typeof createVotingEventApi>

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

    votingEventApi = createVotingEventApi(server)
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
        if (collection.collectionName === 'accounts')
          return undefined
        return collection.deleteMany({})
      }),
    )
  }
  /** 每次測試開始前與結束時，都清空 collection 資料，以免互相影響 */
  beforeEach(async () => await clearAll())
  afterEach(async () => await clearAll())

  describe('建立 voting-event', () => {
    // it('缺少必填參數', async () => {
    //   await votingEventApi.create(undefined as any, 400)
    // })
    it('必填參數', async () => {
      const expectData: VotingEventContract['request']['create']['body'] = {
        options: [],
        description: '測試投票',
        title: '一場測試的投票',
        maxSelectableOptions: 0,
        totalHouseholds: 0,
        totalWeight: 0,
        startAt: dayjs().toISOString(),
        endAt: dayjs().add(14, 'day').toISOString(),
      }

      const result = await votingEventApi.create(expectData)

      expect(result).toMatchObject(pick(expectData, ['name', 'description']))
      expect(result.timestamp).toBeDefined()
    })
  })

  describe('取得 voting-event', () => {
    it('預設值', async () => {
      const body = await votingEventApi.find({
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
      const createParams: VotingEventContract['request']['create']['body'] = {
        options: [],
        description: '一場測試的投票',
        title: '測試投票',
        maxSelectableOptions: 0,
        totalHouseholds: 0,
        totalWeight: 0,
        startAt: dayjs().toISOString(),
        endAt: dayjs().add(14, 'day').toISOString(),
      }

      await Promise.allSettled([
        votingEventApi.create(createParams),
        votingEventApi.create(createParams),
      ])

      {
        const result = await votingEventApi.find()
        expect(result.total).toBe(2)
        expect(result.data).toHaveLength(2)
      }

      {
        const result = await votingEventApi.find({ limit: 1 })
        expect(result.total).toBe(2)
        expect(result.data).toHaveLength(1)
      }
    })

    it('跳過指定筆數資料', async () => {
      const createParams: VotingEventContract['request']['create']['body'] = {
        options: [],
        description: '一場測試的投票',
        title: '測試投票',
        maxSelectableOptions: 0,
        totalHouseholds: 0,
        totalWeight: 0,
        startAt: dayjs().toISOString(),
        endAt: dayjs().add(14, 'day').toISOString(),
      }

      const data01 = await votingEventApi.create(createParams)
      const data02 = await votingEventApi.create(createParams)

      const result = await votingEventApi.find({ skip: 1 })
      expect(result.data[0]?.id).toBe(data02.id)
    })
  })

  describe('取得指定 voting-event', () => {
    it('取得指定資料', async () => {
      const createParams: VotingEventContract['request']['create']['body'] = {
        options: [],
        description: '一場測試的投票',
        title: '測試投票',
        maxSelectableOptions: 0,
        totalHouseholds: 0,
        totalWeight: 0,
        startAt: dayjs().toISOString(),
        endAt: dayjs().add(14, 'day').toISOString(),
      }

      const data = await votingEventApi.create(createParams)
      const newData = await votingEventApi.findOne(data.id)

      expect(newData).toEqual(data)
    })
  })

  describe('更新指定 voting-event', () => {
    it('目標 ID 不存在', async () => {
      await votingEventApi.findOne('639709b56f4c80dd5fd48a1f', 404)
    })

    it('修改 name 為 cod', async () => {
      const params: VotingEventContract['request']['create']['body'] = {
        options: [],
        description: '一場測試的投票',
        title: '測試投票',
        maxSelectableOptions: 0,
        totalHouseholds: 0,
        totalWeight: 0,
        startAt: dayjs().toISOString(),
        endAt: dayjs().add(14, 'day').toISOString(),
      }

      const data = await votingEventApi.create(params)
      const newData = await votingEventApi.update(data.id, {
        title: 'cod',
      })

      expect(newData.title).toBe('cod')
    })
  })

  describe('delete指定 voting-event', () => {
    it('目標 ID 不存在', async () => {
      await votingEventApi.remove('639709b56f4c80dd5fd48a1f', 404)
    })

    it('delete資料', async () => {
      const params: VotingEventContract['request']['create']['body'] = {
        options: [],
        description: '一場測試的投票',
        title: '測試投票',
        maxSelectableOptions: 0,
        totalHouseholds: 0,
        totalWeight: 0,
        startAt: dayjs().toISOString(),
        endAt: dayjs().add(14, 'day').toISOString(),
      }

      const data = await votingEventApi.create(params)
      const newData = await votingEventApi.remove(data.id)

      expect(newData.title).toBe(params.title)
      expect(newData.timestamp.deletedAt).toBeDefined()
    })

    it('delete資料後，find 無法取得', async () => {
      const params: VotingEventContract['request']['create']['body'] = {
        options: [],
        description: '一場測試的投票',
        title: '測試投票',
        maxSelectableOptions: 0,
        totalHouseholds: 0,
        totalWeight: 0,
        startAt: dayjs().toISOString(),
        endAt: dayjs().add(14, 'day').toISOString(),
      }

      const data = await votingEventApi.create(params)
      await votingEventApi.remove(data.id)
      const result = await votingEventApi.find()

      expect(result.data).toHaveLength(0)
    })
  })

  describe('取得指定資料 logs', () => {
    it('未有任何紀錄', async () => {
      const data = await votingEventApi.create({
        options: [],
        description: '一場測試的投票',
        title: '測試投票',
        maxSelectableOptions: 0,
        totalHouseholds: 0,
        totalWeight: 0,
        startAt: dayjs().toISOString(),
        endAt: dayjs().add(14, 'day').toISOString(),
      })
      const result = await votingEventApi.findLogs(data.id)

      expect(result.total).toBe(0)
    })

    it('1 筆變更紀錄', async () => {
      const data = await votingEventApi.create({
        options: [],
        description: '一場測試的投票',
        title: '測試投票',
        maxSelectableOptions: 0,
        totalHouseholds: 0,
        totalWeight: 0,
        startAt: dayjs().toISOString(),
        endAt: dayjs().add(14, 'day').toISOString(),
      })
      await votingEventApi.update(data.id, { title: 'new-title' })

      const result = await votingEventApi.findLogs(data.id)
      expect(result.total).toBe(1)
    })

    it('2 筆變更紀錄', async () => {
      const data = await votingEventApi.create({
        options: [],
        description: '一場測試的投票',
        title: '測試投票',
        maxSelectableOptions: 0,
        totalHouseholds: 0,
        totalWeight: 0,
        startAt: dayjs().toISOString(),
        endAt: dayjs().add(14, 'day').toISOString(),
      })
      await votingEventApi.update(data.id, { title: 'new-title' })
      await votingEventApi.update(data.id, { title: 'new-new-title' })

      const result = await votingEventApi.findLogs(data.id)
      expect(result.total).toBe(2)
    })

    it('只能指定資料的變更紀錄', async () => {
      const data = await votingEventApi.create({
        options: [],
        description: '一場測試的投票',
        title: '測試投票',
        maxSelectableOptions: 0,
        totalHouseholds: 0,
        totalWeight: 0,
        startAt: dayjs().toISOString(),
        endAt: dayjs().add(14, 'day').toISOString(),
      })
      await votingEventApi.update(data.id, { title: 'new-title' })

      const otherData = await votingEventApi.create({
        options: [],
        description: '一場測試的投票',
        title: '測試投票',
        maxSelectableOptions: 0,
        totalHouseholds: 0,
        totalWeight: 0,
        startAt: dayjs().toISOString(),
        endAt: dayjs().add(14, 'day').toISOString(),
      })
      const result = await votingEventApi.findLogs(otherData.id)

      expect(result.total).toBe(0)
    })
  })
})
