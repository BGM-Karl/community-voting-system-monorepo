import type { ConfigService } from '@nestjs/config'
import process from 'node:process'
import { registerAs } from '@nestjs/config'

interface Config {
  mongoDbUri: string;
  gcpBucketName?: string;
}
const name = 'db'

export default registerAs(name, (): Config => {
  const username = process.env.MONGO_USERNAME
  const password = encodeURIComponent(process.env.MONGO_PASSWORD ?? '')
  const resource = process.env.MONGO_RESOURCE
  const mongoDbUri = `mongodb://${username}:${password}@${resource}`

  return {
    mongoDbUri,
    gcpBucketName: process.env.GCP_BUCKET_NAME,
  }
})

export function get(configService: ConfigService) {
  return configService.get(name) as Config
}
