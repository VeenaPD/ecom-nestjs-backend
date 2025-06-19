import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt'; // Import JwtModule
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    // ForwardRef is needed if UserModule also imports AuthModule (circular dependency)
    forwardRef(() => UserModule), // For UserService dependency in AuthService/JwtStrategy
    DatabaseModule.forRootAsync(),
    PassportModule, // Provides AuthGuard for different strategies
    JwtModule.register({
      secret: jwtConstants.secret, // Your JWT secret
      signOptions: { expiresIn: jwtConstants.expirationTime }, // Token expiration time (e.g., 1 hour)
    }),
  ],  
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [UserModule, JwtModule, PassportModule], // Export for other modules to use AuthGuard, JwtService
})
export class AuthModule {}
