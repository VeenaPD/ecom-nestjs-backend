// Importing decorators and utilities from NestJS common package
import {
    Controller,       // Marks the class as a controller to handle incoming requests
    Get,              // Decorator for HTTP GET endpoint
    Post,             // Decorator for HTTP POST endpoint
    Param,            // Extracts route parameters
    Put,              // Decorator for HTTP PUT endpoint
    Delete,           // Decorator for HTTP DELETE endpoint
    Body,             // Extracts request body
    ParseIntPipe,     // Pipes used to automatically convert and validate route params
} from '@nestjs/common';

// Importing Product type and ProductsService
import { Product, ProductsService } from './products.service';


// Decorator to define the route prefix. All routes will be prefixed with /products
@Controller('products')
export class ProductsController {
    // Injecting ProductsService via constructor-based dependency injection
    constructor(private readonly productsService: ProductsService) { }

    // Handles POST /products
    @Post()
    create(
        @Body() product: Omit<Product, 'id'>, // Extracts the body and ensures it doesn't include `id` (usually auto-generated)
    ) {
        return this.productsService.create(product); // Calls service method to create a product
    }

    // Handles GET /products
    @Get()
    findAll() {
        return this.productsService.findAll(); // Calls service method to fetch all products
    }

    // Handles GET /products/:id
    @Get(':id')
    findOne(
        @Param('id', ParseIntPipe) id: number, // Extracts `id` from route and parses it into a number
    ) {
        return this.productsService.findOne(id); // Calls service method to fetch one product by ID
    }

    // Handles PUT /products/:id
    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number, // Route param converted to number
        @Body() update: Partial<Product>,      // Request body can contain a partial Product object
    ) {
        return this.productsService.update(id, update); // Calls service method to update the product
    }

    // Handles DELETE /products/:id
    @Delete(':id')
    delete(
        @Param('id', ParseIntPipe) id: number, // Route param parsed to number
    ) {
        return this.productsService.delete(id); // Calls service method to delete the product
    }
}
