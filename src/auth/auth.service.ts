// src/auth/auth.service.ts
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs'; // For password comparison
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt'; // For JWT signing
import { PrismaService } from 'src/database/prisma.service';
import { jwtConstants } from './constants';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private jwtService: JwtService,
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
    return this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: jwtConstants.expirationTime || 3600,
    });
  }

  // New: Generate Refresh Token
  private async generateRefreshToken(user: User): Promise<string> {
    const refreshPayload = { sub: user.id, username: user.email }; // Simpler payload for refresh token
    return this.jwtService.sign(refreshPayload, {
      secret: jwtConstants.refreshSecret, // Use a different secret for refresh tokens!
      expiresIn: jwtConstants.refreshExpirationTime || '7d', // Longer expiry
    });
  }

  // New: Save Refresh Token to Database
  private async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    // Invalidate any existing refresh tokens for this user if you want only one active at a time
    // await this.prisma.refreshToken.updateMany({
    //   where: { userId, revoked: false },
    //   data: { revoked: true }
    // });

    // Calculate expiry time (e.g., 7 days from now)
    const expiresIn = jwtConstants.refreshExpirationTime || '7d';
    // You might need a helper to parse '7d' to a Date object,
    // or store `expiresInSeconds` in config and calculate: `new Date(Date.now() + expiresInSeconds * 1000)`
    const durationInSeconds = this.parseJwtDuration(expiresIn); // Implement this helper
    const expiresAt = new Date(Date.now() + durationInSeconds * 1000);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: userId,
        expiresAt: expiresAt,
      },
    });
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
      const decodedToken = this.jwtService.verify(refreshToken, {
        secret: jwtConstants.refreshSecret,
      });

      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = await this.userService.findUserById(decodedToken.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Invalidate the old refresh token (optional, but good for refresh token rotation)
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      });

      const newAccessToken = await this.generateAccessToken(user);
      const newRefreshToken = await this.generateRefreshToken(user); // Rotate refresh token
      await this.saveRefreshToken(user.id, newRefreshToken); // Save the new refresh token

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw e; // Re-throw specific unauthorized exceptions
      }
      // Handle JWT errors (e.g., TokenExpiredError, JsonWebTokenError)
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // New: Logout Logic (to revoke refresh token)
  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, token: refreshToken, revoked: false },
      data: { revoked: true },
    });
  }
}