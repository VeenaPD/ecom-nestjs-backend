import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Tells Passport to use the 'email' field from the request body as the username
      passwordField: 'password', // Tells Passport to use the 'password' field
    });
  }

  // This method is called by Passport.js when the 'local' strategy is activated.
  // It receives the email and password from the request.
  async validate(email: string, password: string): Promise<any> {
    // authService.validateUser will try to find the user and compare passwords.
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      // If validateUser returns null, authentication failed.
      throw new UnauthorizedException('Invalid credentials');
    }
    // If validation succeeds, return the user object.
    // Passport will attach this user object to 'req.user'.
    return user;
  }
}