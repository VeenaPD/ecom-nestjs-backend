// src/auth/auth.service.ts
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs'; // For password comparison
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt'; // For JWT signing
import { PrismaService } from 'src/database/prisma.service';
import { jwtConstants } from './constants';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  // Used by LocalStrategy to validate credentials
  async validateUser(email: string, pass: string): Promise<User | null> {
    // findUserByEmail in UserService must return the user object *including* the hashed password
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      return null; // User not found
    }

    // Compare the provided plain password with the hashed password from the database
    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      return null; // Invalid password
    }

    // Return the user object without the password hash for security
    const { password, ...result } = user;
    return result as User;
  }

  // Called after successful local strategy authentication to issue a JWT
  // async login(user: User): Promise<{ accessToken: string }> {
  //   // The payload should contain minimal, non-sensitive information
  //   // that uniquely identifies the user and their role (for authorization).
  //   const payload = {
  //     email: user.email,
  //     sub: user.id, // 'sub' (subject) is a standard JWT claim for the principal (user ID)
  //     role: user.role, // Include role for authorization
  //   };

  //   // Sign the payload to create the JWT
  //   return {
  //     accessToken: this.jwtService.sign(payload),
  //   };
  // }

  async login(loginDto: LoginUserDto): Promise<{ accessToken: string, refreshToken: string }> {
    const user = await this.userService.findUserByEmail(loginDto.email);
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    await this.saveRefreshToken(user.id, refreshToken); // Save refresh token to DB

    return { accessToken, refreshToken };
  }

  // New: Generate Access Token
  private async generateAccessToken(user: User): Promise<string> {
    const payload = { sub: user.id, username: user.email, role: user.role };
    // 'expiresIn' is configured in AuthModule's JwtModule.registerAsync
    // so no need to pass it here unless overriding
    return this.jwtService.sign(payload
  );
  }

  // New: Generate Refresh Token
  private async generateRefreshToken(user: User): Promise<string> {
    const refreshPayload = { sub: user.id }; // Refresh token payload can be simpler
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_ACCESS_TOKEN_EXPIRATION_TIME');

    console.log(`Generating refresh token with secret: ${refreshSecret ? 'Loaded' : 'NOT LOADED'} and expiresIn: ${refreshExpiresIn}`);

    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
    }

    return this.jwtService.sign(refreshPayload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });
  }

  // New: Save Refresh Token to Database
  private async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_ACCESS_TOKEN_EXPIRATION_TIME');
    const durationInSeconds = this.parseJwtDuration(refreshExpiresIn || '7d'); // Default to 7 days if undefined
    const expiresAt = new Date(Date.now() + durationInSeconds * 1000);

    // Invalidate any existing refresh token for this user if you want only one active at a time
    // For simplicity, we just create a new one here. For full session management,
    // you might want to revoke old ones or limit active sessions.
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: userId,
        expiresAt: expiresAt,
      },
    });
    console.log(`Refresh token saved for user ${userId}, expires at ${expiresAt}`);
  }

  // Helper to parse duration strings (e.g., '15m', '1h', '7d') to seconds
  private parseJwtDuration(duration: string): number {
    const units = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };
    const value = parseInt(duration.slice(0, -1));
    const unit = duration.slice(-1) as keyof typeof units;
    if (isNaN(value) || !units[unit]) {
      throw new BadRequestException('Invalid JWT duration format');
    }
    return value * units[unit];
  }


  // New: Refresh Token Logic
  async refreshToken(refreshToken: string): Promise<{ accessToken: string, refreshToken?: string }> {
    try {
      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
      if (!refreshSecret) {
        throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
      }

      // Verify the refresh token's signature and expiry
      const decodedToken = this.jwtService.verify(refreshToken, { secret: refreshSecret });
      console.log(`Refresh token decoded: ${JSON.stringify(decodedToken)}`);

      // Check if the refresh token exists in our database and is not revoked/expired
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true } // Include user to get user details
      });

      if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
        console.log(`Invalid or expired refresh token provided.`);
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = storedToken.user; // User object from storedToken
      if (!user) {
        console.log(`User not found for stored refresh token.`);
        throw new UnauthorizedException('User not found for refresh token');
      }

      // --- Refresh Token Rotation (Security Best Practice) ---
      // Invalidate the old refresh token
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      });
      console.log(`Old refresh token revoked for user ${user.email}`);

      // Generate new access and refresh tokens
      const newAccessToken = await this.generateAccessToken(user);
      const newRefreshToken = await this.generateRefreshToken(user);
      await this.saveRefreshToken(user.id, newRefreshToken); // Save the new refresh token

      console.log(`Tokens refreshed for user ${user.email}`);
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (e) {
      console.log(`Error during token refresh: ${e.message}`, e.stack);
      if (e.name === 'TokenExpiredError' || e.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Refresh token is invalid or expired.');
      }
      throw new UnauthorizedException('Failed to refresh token.');
    }
  }

  // New: Logout Logic (to revoke refresh token)
  async logout(userId: string, refreshToken: string): Promise<void> {
    // await this.prisma.refreshToken.updateMany({
    //   where: { userId, token: refreshToken, revoked: false },
    //   data: { revoked: true },
    // });

    // Revoke the specific refresh token
    const result = await this.prisma.refreshToken.updateMany({
      where: { userId, token: refreshToken, revoked: false },
      data: { revoked: true },
    });

    if (result.count === 0) {
      console.log(`Logout failed: Refresh token not found or already revoked for user ${userId}`);
      throw new BadRequestException('Refresh token not found or already logged out.');
    }
    console.log(`User ${userId} logged out. Refresh token revoked.`);
  }

}