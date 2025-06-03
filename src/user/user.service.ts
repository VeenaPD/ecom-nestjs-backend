import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class UserService {
    constructor(private readonly logger: LoggerService) { }

    getMockUser() {
        const id = 1;
        const user = { id, name: 'John Doe' };
        this.logger.log(`Fetched user ${id}`);
        return user;
    }
}
