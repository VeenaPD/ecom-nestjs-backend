import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { LoggerService } from 'src/logger/logger.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService,
        private readonly logger: LoggerService,
    ) { }

    @Get(':id')
    getUser(@Param('id', ParseIntPipe) id: number) {
        this.logger.log('Getting user...');
        this.logger.logUserContext(); // logs user info via logger
        return this.userService.getMockUser();    
    }
}