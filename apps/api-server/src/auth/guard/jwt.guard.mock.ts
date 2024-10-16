import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtGuardMock extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean {
    return true
  }
}
