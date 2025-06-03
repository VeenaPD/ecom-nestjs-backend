import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class LoggerService {
  constructor(
    private readonly level: string,
    private readonly userService: UserService,
  ) {}

  log(message: string) {
    console.log(`[${this.level}] ${message}`);
  }

  logUserContext() {
    const user = this.userService.getMockUser();
    this.log(`User context: ${JSON.stringify(user)}`);
  }
}
