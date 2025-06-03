// Import necessary decorators and utilities from NestJS core
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

// Import the UserService which contains business logic for user-related operations
import { UserService } from './user.service';

// Marks this class as a controller that handles HTTP requests related to "users"
@Controller('users') // This sets the base route to /users for all endpoints in this controller
export class UserController {

    // Constructor-based dependency injection
    constructor(
        private readonly userService: UserService, // Injects the UserService instance into the controller
    ) { }

    // Handles HTTP GET requests to the route `/users/:id`
    @Get(':id') // Route pattern with a dynamic parameter `id`
    getUser(
        @Param('id', ParseIntPipe) id: number, // Extracts `id` from the URL and parses it into a number
    ) {
        // Calls a method on the userService to get a mock user object
        // NOTE: In this mock version, the id is not actually used
        return this.userService.getMockUser();
    }
}
