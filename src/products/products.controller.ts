import {
    Controller,
    Get,
    Post,
    Param,
    Put,
    Delete,
    Body,
    ParseIntPipe,
} from '@nestjs/common';
import { Product, ProductsService } from './products.service';


@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    create(@Body() product: Omit<Product, 'id'>) {
        return this.productsService.create(product);
    }

    @Get()
    findAll() {
        return this.productsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() update: Partial<Product>,
    ) {
        return this.productsService.update(id, update);
    }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.delete(id);
    }
}
