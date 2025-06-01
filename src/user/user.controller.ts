import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    createUser(@Body() data: Omit<User, 'id'>) {
        return this.userService.create(data);
    }

    @Get()
    getAllUsers() {
        return this.userService.findAll();
    }

    @Get('id')
    getUserById(@Param('id') id: string) {
        return this.userService.findOne(+id);
    }

    @Put(':id')
    updateUser(@Param('id') id: string, @Body() data: Partial<Omit<User, 'id'>>) {
        return this.userService.update(+id, data);
    }

    @Delete(':id')
    deleteUser(@Param('id') id: string) {
        this.userService.delete(+id);
        return { deleted: true };
    }

}
