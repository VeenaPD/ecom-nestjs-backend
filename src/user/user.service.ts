// Marks this class as injectable so that it can be injected via NestJS's dependency injection system
import { Injectable } from '@nestjs/common';

// Imports the LoggerService so we can use it for logging inside this service
import { LoggerService } from '../logger/logger.service';

@Injectable() // Allows NestJS to manage and inject this service into other classes (like controllers)
export class UserService {

    // Constructor-based dependency injection of LoggerService
    constructor(private readonly logger: LoggerService) { }

    // A mock method that simulates fetching a user (useful for testing or examples)
    getMockUser() {
        // Create a mock user object
        const user = { id: 1, name: 'John Doe' };

        // Logs a simple message using the injected LoggerService
        this.logger.log('Fetched user');

        // Logs a more detailed, structured message using logWithContext
        this.logger.logWithContext('User context', user);

        // Returns the mock user object
        return user;
    }
}
