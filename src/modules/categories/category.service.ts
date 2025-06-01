import { Injectable } from '@nestjs/common';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
    private categories: Category[] = [];
    private idCounter = 1;

    create(category: Omit<Category, 'id'>): Category {
        const newCategory = { id: this.idCounter++, ...category };
        this.categories.push(newCategory);
        return newCategory;
    }

    findAll() {
        return this.categories;
    }
    
    findOne(id: number): Category | undefined {
        return this.categories.find(category => category.id === id);
    }

    update(id: number, data: Partial<Omit<Category, 'id'>>): Category | null {
        const category = this.findOne(id);
        if (!category) return null;
        Object.assign(category, data);
        return category;
    }

    delete(id: number): void {
        this.categories = this.categories.filter(category => category.id !== id);
    }
}
