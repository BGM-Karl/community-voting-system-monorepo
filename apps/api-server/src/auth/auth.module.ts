import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccountModule } from '../account/account.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtRefreshTokenStrategy } from './strategy/Jwt-refresh-token.strategy';
import { UtilsModule } from '../utils/utils.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    LoggerModule,
    AccountModule,
    JwtModule.register({}),
    PassportModule,
    UtilsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {
  //
}
