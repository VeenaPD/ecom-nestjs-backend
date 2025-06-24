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
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // ForwardRef is needed if UserModule also imports AuthModule (circular dependency)
    forwardRef(() => UserModule), // For UserService dependency in AuthService/JwtStrategy
    DatabaseModule.forRootAsync(),
    ConfigModule,
    PassportModule, // Provides AuthGuard for different strategies
    // JwtModule.register({
    //   secret: jwtConstants.secret, // Your JWT secret
    //   signOptions: { expiresIn: jwtConstants.expirationTime }, // Token expiration time (e.g., 1 hour)
    // }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME');

        // --- Add these additional debug logs here ---
        console.log(`DEBUG (AuthModule): expiresIn value from ConfigService: ${expiresIn}`);
        console.log(`DEBUG (AuthModule): Type of expiresIn: ${typeof expiresIn}`);
        console.log(`DEBUG (AuthModule): Boolean conversion of expiresIn: ${!!expiresIn}`);
        // --- End additional debug logs ---

        if (!secret) {
          throw new Error('JWT_SECRET is not defined in environment variables');
        }

        console.log("expiredin value in registerAsync", secret, expiresIn || '15m');
        
        return {
          secret: secret,
          signOptions: {
            expiresIn: expiresIn || '15m', // <-- This is where it should be set
          },
        };
      },
      inject: [ConfigService],
    }),

  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [UserModule, JwtModule, PassportModule], // Export for other modules to use AuthGuard, JwtService
})
export class AuthModule { }
