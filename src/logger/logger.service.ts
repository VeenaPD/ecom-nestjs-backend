// Marks this class as injectable so it can be provided and used by other services/controllers via NestJS's DI system
import { Injectable } from '@nestjs/common';

@Injectable() // Enables this service to be injected where needed
export class LoggerService {

    // Constructor with a `level` parameter, defaulting to 'DEBUG' if not provided
    // This sets the log level (could be used to filter logs later if expanded)
    constructor(private readonly level: string = 'DEBUG') { }

    // Basic log method that prints a formatted log message to the console
    log(message: string) {
        console.log(`[${this.level}] ${message}`); // e.g., [DEBUG] Starting app...
    }

    // A utility method to log structured data (like a user object) with a custom label
    logWithContext(label: string, context: any) {
        // Converts the context object to JSON string and logs it with a label
        this.log(`${label}: ${JSON.stringify(context)}`);
    }
}
