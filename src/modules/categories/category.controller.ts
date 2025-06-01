import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';

@Controller('categories')
export class CategoriesController {

    constructor(private readonly categoryService: CategoryService) {}

    @Post()
    createCategory(@Body() data: Omit<Category, 'id'>) {
        return this.categoryService.create(data);
    }

    @Get()
    getAllCategories() {
        console.log("categories list all called");
        return this.categoryService.findAll();
    }

    @Get(':id')
    getCategoryById(@Param('id') id: string) {
        return this.categoryService.findOne(+id);
    }

    @Put(':id')
    updateCategory(@Param('id') id: string, @Body() data: Partial<Omit<Category, 'id'>>) {
        return this.categoryService.update(+id, data);
    }

    @Delete(':id')
    deleteCategory(@Param('id') id: string) {
        this.categoryService.delete(+id);
        return { deleted: true };
    }
}
