import { Controller, Post, Request, UseGuards, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiUnauthorizedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { User } from '@prisma/client';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK) // Explicitly set 200 OK for successful login
  @ApiOperation({ summary: 'User login', description: 'Authenticates a user with email and password and returns an access token (JWT).' })
  @ApiBody({ type: LoginUserDto, description: 'User credentials' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns access token.',
    schema: { example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' } }
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials (email or password).' })
  // Use AuthGuard('local') to trigger the LocalStrategy for authentication
  @UseGuards(AuthGuard('local'))
  async login(@Request() req: { user: User }): Promise<{ accessToken: string }> {
    // If we reach here, LocalStrategy has successfully validated the user.
    // The user object (without password) is now available on req.user.
    return this.authService.login(req.user);
  }

  @Get('profile')
  @ApiBearerAuth('access-token') // Document that this endpoint requires a Bearer token
  @ApiOperation({ summary: 'Get current user profile', description: 'Retrieves the profile of the authenticated user using their JWT.' })
  @ApiResponse({ status: 200, description: 'User profile data (excluding password).', type: LoginUserDto }) // Or a dedicated UserProfileResponseDto
  @ApiUnauthorizedResponse({ description: 'Unauthorized access (missing or invalid JWT).' })
  // Use AuthGuard('jwt') to trigger the JwtStrategy for authentication
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Request() req: { user: User }): User {
    // If we reach here, JwtStrategy has successfully validated the JWT.
    // The user object (without password) is now available on req.user.
    return req.user;
  }
}