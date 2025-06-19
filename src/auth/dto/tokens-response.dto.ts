import { ApiProperty } from '@nestjs/swagger';

export class TokensResponseDto {
    @ApiProperty({ description: 'The new access token' })
    accessToken: string;

    @ApiProperty({ description: 'The new refresh token (if rotated)' })
    refreshToken?: string; // Optional if you don't rotate refresh tokens
}