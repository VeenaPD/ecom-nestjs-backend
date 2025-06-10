import { Controller, Get, Post, Body, Param, Put, Delete, UsePipes, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, User } from '@prisma/client'; // Import types from Prisma client

@Controller('categories')
@UsePipes(new ValidationPipe({ 
  whitelist: true, // Strip properties not defined in DTO
  forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
  transform: true })) // Automatically transform payload to DTO instance
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.createCategory(
      createCategoryDto.name,
      createCategoryDto.description,
      createCategoryDto.userId
    );
  }

  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAllCategories();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Category | null> {
    return this.categoryService.findCategoryById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    return this.categoryService.updateCategory(id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
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