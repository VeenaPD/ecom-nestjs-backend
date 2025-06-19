import {
    Controller, Get, Post, Body, Param, Put, Delete, UsePipes, ValidationPipe, HttpCode, HttpStatus,
    UseGuards, Request, ForbiddenException // <-- Import UseGuards, Request, ForbiddenException
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, User } from '@prisma/client';

// Import Auth/AuthZ related decorators/guards
import { ApiBearerAuth, ApiForbiddenResponse, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse, ApiBody, ApiParam, ApiBadRequestResponse, ApiConflictResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport'; // For JWT authentication
import { AbilitiesGuard } from '../shared/guards/abilities.guard'; // Your CASL guard
import { CheckAbilities } from '../shared/decorators/abilities.decorator'; // Your CASL decorator
import { Action } from '../shared/enum/action.enum'; // Your Action enum
import { AppAbility, CaslAbilityFactory } from '../casl/casl-ability.factory'; // For injecting CaslAbilityFactory

@ApiTags('products')
@Controller('products')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly caslAbilityFactory: CaslAbilityFactory, // <-- Inject CaslAbilityFactory
    ) { }

    // Create Product: Only Admins can create products
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Create a new product (Admin only)', description: 'Adds a new product to the system. Requires Admin role.' })
    @ApiResponse({ status: 201, description: 'Product successfully created.', type: CreateProductDto })
    @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
    @ApiForbiddenResponse({ description: 'Forbidden: Requires Admin role.' })
    @ApiBadRequestResponse({ description: 'Invalid input data.' })
    @ApiBody({ type: CreateProductDto, description: 'Data for creating a product' })
    @UseGuards(AuthGuard('jwt'), AbilitiesGuard) // First auth, then check abilities
    @CheckAbilities((ability: AppAbility) => ability.can(Action.Create, 'Product')) // Checks if user can 'create' a 'Product'
    async create(@Body() createProductDto: CreateProductDto, @Request() req: { user: User }): Promise<Product> {
        // Pass the authorId from the authenticated user
        return this.productService.createProduct(createProductDto, req.user.id);
    }

    // Get All Products: Publicly accessible
    @Get()
    @ApiOperation({ summary: 'Get all products', description: 'Retrieves a list of all products.' })
    @ApiResponse({ status: 200, description: 'List of products.', type: [CreateProductDto] })
    async findAll(): Promise<Product[]> {
        return this.productService.findAllProducts();
    }

    // Get Product by ID: Publicly accessible
    @Get(':id')
    @ApiOperation({ summary: 'Get product by ID', description: 'Retrieves a single product by its unique ID.' })
    @ApiParam({ name: 'id', description: 'UUID of the product to retrieve', type: 'string', format: 'uuid' })
    @ApiResponse({ status: 200, description: 'The product found.', type: CreateProductDto })
    @ApiNotFoundResponse({ description: 'Product not found.' })
    async findOne(@Param('id') id: string): Promise<Product> {
        return this.productService.findProductById(id);
    }

    // Update Product: Admin can update any. User can update their OWN.
    @Put(':id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Update product (Admin or Owner)', description: 'Updates an existing product by ID. Requires Admin role or ownership.' })
    @ApiParam({ name: 'id', description: 'UUID of the product to update', type: 'string', format: 'uuid' })
    @ApiBody({ type: UpdateProductDto, description: 'Data for updating a product' })
    @ApiResponse({ status: 200, description: 'Product successfully updated.', type: UpdateProductDto })
    @ApiNotFoundResponse({ description: 'Product not found.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
    @ApiForbiddenResponse({ description: 'Forbidden: You do not have permission to update this product.' })
    @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
    // Policy handler function to check if user *can* update a Product (generic check)
    @CheckAbilities((ability: AppAbility) => ability.can(Action.Update, 'Product'))
    async update(
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
        @Request() req: { user: User } // To get user for ownership check
    ): Promise<Product> {
        const productToUpdate = await this.productService.findProductById(id); // Fetch the product instance

        // Perform the specific, instance-based permission check
        const ability = this.caslAbilityFactory.createForUser(req.user);
        if (!ability.can(Action.Update, productToUpdate)) {
            throw new ForbiddenException('You do not have permission to update this product.');
        }

        return this.productService.updateProduct(id, updateProductDto);
    }

    // Delete Product: Admin can delete any. User can delete their OWN.
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Delete product (Admin or Owner)', description: 'Deletes a product by ID. Requires Admin role or ownership.' })
    @ApiParam({ name: 'id', description: 'UUID of the product to delete', type: 'string', format: 'uuid' })
    @ApiResponse({ status: 204, description: 'Product successfully deleted.' })
    @ApiNotFoundResponse({ description: 'Product not found.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
    @ApiForbiddenResponse({ description: 'Forbidden: You do not have permission to delete this product.' })
    @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
    // Policy handler function to check if user *can* delete a Product (generic check)
    @CheckAbilities((ability: AppAbility) => ability.can(Action.Delete, 'Product'))
    async remove(
        @Param('id') id: string,
        @Request() req: { user: User }
    ): Promise<void> {
        const productToDelete = await this.productService.findProductById(id); // Fetch the product instance

        // Perform the specific, instance-based permission check
        const ability = this.caslAbilityFactory.createForUser(req.user);
        if (!ability.can(Action.Delete, productToDelete)) {
            throw new ForbiddenException('You do not have permission to delete this product.');
        }

        await this.productService.deleteProduct(id);
    }
}