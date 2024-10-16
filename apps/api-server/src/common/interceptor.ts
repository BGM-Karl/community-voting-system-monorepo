import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'

@Injectable()
export class NoopInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ) {
    // 直接進行下一個攔截器或路由處理器，不執行任何快取相關操作
    return next.handle()
  }
}
