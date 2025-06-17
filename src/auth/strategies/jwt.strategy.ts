import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { UserService } from '../../user/user.service'; // Needed to validate user from JWT payload
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      // Specifies how to extract the JWT from the request (from Authorization header as a Bearer token)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Do not ignore token expiration; Passport will handle this automatically
      secretOrKey: jwtConstants.secret, // The secret key to verify the token's signature
    });
  }

  // This method is called by Passport.js after it successfully verifies the JWT's signature.
  // The 'payload' is the decoded JWT payload (e.g., { email, sub: userId, role }).
  async validate(payload: any): Promise<User> {
    // You can perform additional checks here, e.g.,
    // 1. Check if the user still exists in the database (using payload.sub which is userId).
    // 2. Check if the user is active/not banned.
    // 3. Populate more user data into req.user if needed.

    const user = await this.userService.findUserById(payload.sub); // Assuming payload.sub is the user's ID
    if (!user) {
      throw new UnauthorizedException('User not found or no longer active');
    }

    // IMPORTANT: Never return the password hash here.
    // This 'user' object will be attached to 'req.user' in your controller.
    const { password, ...result } = user;
    return result as User;
  }
}