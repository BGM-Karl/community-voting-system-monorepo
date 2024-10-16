import type { INestApplication } from '@nestjs/common'
import type { TestingModule } from '@nestjs/testing'
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
import { {{pascalCase name}} } from './schema'
import { create{{pascalCase name}}Api } from './{{kebabCase name}}.e2e'

describe('{{camelCase name}} e2e', () => {
  let mongodb: MongoMemoryReplSet
  let mongoConnection: Connection
  let app: INestApplication
  let server: ReturnType<INestApplication['getHttpServer']>

  let storageFileApi: ReturnType<typeof createStorageFileApi>
  let {{camelCase name}}Api: ReturnType<typeof create{{pascalCase name}}Api>

  beforeAll(async () => {
    mongodb = await MongoMemoryReplSet.create({
      replSet: { storageEngine: 'wiredTiger' },
    })
    const uri = mongodb.getUri()
    mongoConnection = (await connect(uri)).connection

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
    {{camelCase name}}Api = create{{pascalCase name}}Api(server)
  })

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

  describe('取得 {{kebabCase name}}', () => {
    it('取得預設資料', async () => {
      const data = await {{camelCase name}}Api.get()

      expect(data).toMatchObject(
        pick(new {{pascalCase name}}(), ['name', 'description', 'remark']),
      )
    })
  })

  describe('修改 {{kebabCase name}}', () => {
    it('正確修改資料', async () => {
      const expected = {
        name: 'name',
      }
      const data = await {{camelCase name}}Api.update(expected)

      expect(data).toMatchObject(expected)
    })

    it('提供錯誤型別', async () => {
      const expected: any = {
        name: {},
      }

      await {{camelCase name}}Api.update(expected, 400)
    })

    it('上傳圖片', async () => {
      const image = await storageFileApi.create()

      const expected = {
        image: { file: image.id },
      }

      const data = await {{camelCase name}}Api.update(expected)

      expect(data.image).toMatchObject({
        file: image,
      })
    })
  })

  describe('取得 {{kebabCase name}} log', () => {
    it('未有任何紀錄', async () => {
      const result = await {{camelCase name}}Api.findLogs()

      expect(result.total).toBe(0)
    })

    it('1 筆變更紀錄', async () => {
      await {{camelCase name}}Api.get()
      await {{camelCase name}}Api.update({ name: 'new-name' })

      const result = await {{camelCase name}}Api.findLogs()
      expect(result.total).toBe(1)
    })

    it('2 筆變更紀錄', async () => {
      await {{camelCase name}}Api.get()
      await {{camelCase name}}Api.update({ name: 'new-name' })
      await {{camelCase name}}Api.update({ name: 'new-new-name' })

      const result = await {{camelCase name}}Api.findLogs()
      expect(result.total).toBe(2)
    })
  })
})
