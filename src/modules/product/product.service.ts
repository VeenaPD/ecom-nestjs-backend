import { Injectable } from '@nestjs/common';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
    private products: Product[] = [];
    private idCounter = 1;

    create(product: Omit<Product, 'id'>): Product {
        const newProduct = { id: this.idCounter++, ...product };
        this.products.push(newProduct);
        return newProduct;
    }

    findAll(): Product[] {
        console.log("products list all called in service");
        return this.products;
    }

    findOne(id: number): Product | undefined {
        return this.products.find(p => p.id === id);
    }

    update(id: number, data: Partial<Omit<Product, 'id'>>): Product | null {
        const product = this.findOne(id);
        if (!product) return null;
        Object.assign(product, data);
        return product;
    }

    delete(id: number): void {
        this.products = this.products.filter(p => p.id !== id);
    }
}
