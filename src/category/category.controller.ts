import { Controller, Get, Post, Body, Param, Put, Delete, UsePipes, ValidationPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, Role, User } from '@prisma/client'; // Import types from Prisma client
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiConflictResponse, ApiNotFoundResponse, ApiBearerAuth, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger'; // Import Swagger Decorators
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';

@ApiTags('categories') // Group all category-related endpoints
@Controller('categories')
@UsePipes(new ValidationPipe({
  whitelist: true, // Strip properties not defined in DTO
  forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
  transform: true
})) // Automatically transform payload to DTO instance
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  // @Post()
  // @HttpCode(HttpStatus.CREATED)
  // @ApiOperation({ summary: 'Create a new category', description: 'Adds a new product category to the system.' })
  // @ApiResponse({ status: 201, description: 'Category successfully created.', type: CreateCategoryDto })
  // @ApiConflictResponse({ description: 'Category with this name already exists.' })
  // @ApiBody({ type: CreateCategoryDto, description: 'Data for creating a category' })
  // // @UseGuards(AuthGuard('jwt')) // You'd typically have an AuthGuard here
  // async create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
  //   return this.categoryService.createCategory(
  //     createCategoryDto.name,
  //     createCategoryDto.description,
  //     createCategoryDto.userId
  //   );
  // }

  // Create category - requires ADMIN role
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new category (Admin only)', description: 'Adds a new product category to the system. Requires ADMIN role.' })
  @ApiResponse({ status: 201, description: 'Category successfully created.', type: CreateCategoryDto })
  @ApiConflictResponse({ description: 'Category with this name already exists.' })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden: Requires Admin role.' })
  @ApiBody({ type: CreateCategoryDto, description: 'Data for creating a category' })
  @UseGuards(AuthGuard('jwt'), RolesGuard) // <-- Protect with JWT and RolesGuard
  @Roles(Role.ADMIN) // <-- Only ADMIN role can create categories
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.createCategory(createCategoryDto.name, createCategoryDto.description, createCategoryDto.userId);
  }

  // Get all categories - public access
  @Get()
  @ApiOperation({ summary: 'Get all categories', description: 'Retrieves a list of all product categories.' })
  @ApiResponse({ status: 200, description: 'List of categories.', type: [CreateCategoryDto] })
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAllCategories();
  }

  // Get category by ID - public access
  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID', description: 'Retrieves a single category by its unique ID.' })
  @ApiParam({ name: 'id', description: 'UUID of the category to retrieve', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'The category found.', type: CreateCategoryDto })
  @ApiNotFoundResponse({ description: 'Category not found.' })
  async findOne(@Param('id') id: string): Promise<Category | null> {
    return this.categoryService.findCategoryById(id);
  }

  // @Put(':id')
  // async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<Category> {
  //   return this.categoryService.updateCategory(id, updateCategoryDto);
  // }

  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async remove(@Param('id') id: string): Promise<void> {
  //   await this.categoryService.deleteCategory(id);
  // }

   // Update category - requires ADMIN role
   @Put(':id')
   @ApiBearerAuth('access-token')
   @ApiOperation({ summary: 'Update category (Admin only)', description: 'Updates an existing product category by ID. Requires ADMIN role.' })
   @ApiParam({ name: 'id', description: 'UUID of the category to update', type: 'string', format: 'uuid' })
   @ApiBody({ type: UpdateCategoryDto, description: 'Data for updating a category' })
   @ApiResponse({ status: 200, description: 'Category successfully updated.', type: UpdateCategoryDto })
   @ApiNotFoundResponse({ description: 'Category not found.' })
   @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
   @ApiForbiddenResponse({ description: 'Forbidden: Requires Admin role.' })
   @UseGuards(AuthGuard('jwt'), RolesGuard)
   @Roles(Role.ADMIN) // Only ADMIN role can update categories
   async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<Category> {
     return this.categoryService.updateCategory(id, updateCategoryDto);
   }
 
   // Delete category - requires ADMIN role
   @Delete(':id')
   @HttpCode(HttpStatus.NO_CONTENT)
   @ApiBearerAuth('access-token')
   @ApiOperation({ summary: 'Delete category (Admin only)', description: 'Deletes a product category by ID. Requires ADMIN role.' })
   @ApiParam({ name: 'id', description: 'UUID of the category to delete', type: 'string', format: 'uuid' })
   @ApiResponse({ status: 204, description: 'Category successfully deleted.' })
   @ApiNotFoundResponse({ description: 'Category not found.' })
   @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
   @ApiForbiddenResponse({ description: 'Forbidden: Requires Admin role.' })
   @UseGuards(AuthGuard('jwt'), RolesGuard)
   @Roles(Role.ADMIN) // Only ADMIN role can delete categories
   async remove(@Param('id') id: string): Promise<void> {
     await this.categoryService.deleteCategory(id);
   }

  // --- Relationship Endpoints ---

  @Get(':id/creator')
  async findCategoryCreator(@Param('id') id: string): Promise<(Category & { user: User }) | null> {
    return this.categoryService.findCategoryByIdWithCreator(id);
  }

  @Get('with-creators')
  async findAllWithCreators(): Promise<(Category & { user: User })[]> {
    return this.categoryService.findAllCategoriesWithCreator();
  }

  @Put(':id/assign-to-user/:userId')
  async assignCategory(
    @Param('id') categoryId: string,
    @Param('userId') newUserId: string,
  ): Promise<Category> {
    return this.categoryService.assignCategoryToUser(categoryId, newUserId);
  }
}