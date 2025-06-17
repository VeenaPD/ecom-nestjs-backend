// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs'; // For password comparison
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt'; // For JWT signing

@Injectable()
export class AuthService {
  constructor(
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
  async login(user: User): Promise<{ accessToken: string }> {
    // The payload should contain minimal, non-sensitive information
    // that uniquely identifies the user and their role (for authorization).
    const payload = {
      email: user.email,
      sub: user.id, // 'sub' (subject) is a standard JWT claim for the principal (user ID)
      role: user.role, // Include role for authorization
    };

    // Sign the payload to create the JWT
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}