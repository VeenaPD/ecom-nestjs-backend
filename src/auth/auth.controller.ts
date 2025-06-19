import { Controller, Post, Request, UseGuards, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiUnauthorizedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { TokensResponseDto } from './dto/tokens-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

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
    type: TokensResponseDto
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials (email or password).' })
  // Use AuthGuard('local') to trigger the LocalStrategy for authentication
  @UseGuards(AuthGuard('local'))
  async login(@Body() loginUserDto: LoginUserDto): Promise<TokensResponseDto> {
    // If we reach here, LocalStrategy has successfully validated the user.
    return this.authService.login(loginUserDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using a refresh token' })
  @ApiBody({ type: RefreshTokenDto, description: 'Refresh token to get a new access token' })
  @ApiResponse({ status: 200, description: 'New access token issued.', type: TokensResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token.' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokensResponseDto> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token') // Assuming logout might require access token for user context
  @ApiOperation({ summary: 'Logout user and invalidate refresh token' })
  @ApiResponse({ status: 204, description: 'User successfully logged out.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @UseGuards(AuthGuard('jwt')) // Protect this endpoint
  async logout(@Request() req: { user: User }, @Body() refreshTokenDto: RefreshTokenDto): Promise<void> {
    await this.authService.logout(req.user.id, refreshTokenDto.refreshToken);
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