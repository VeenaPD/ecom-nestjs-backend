// Marks the service as injectable via NestJS dependency injection system
import { Injectable } from '@nestjs/common';

// Define a TypeScript interface to represent the shape of a Product object
export interface Product {
    id: number;           // Unique identifier
    name: string;         // Product name
    price: number;        // Product price
    description: string;  // Description of the product
}

@Injectable() // Tells NestJS that this class can be injected into other components (like controllers)
export class ProductsService {
    // Local in-memory array to store products (mocking a database)
    private products: Product[] = [];

    // Counter to simulate auto-incrementing IDs (like a database would do)
    private idCounter = 1;

    /**
     * Create a new product entry
     * @param product - Product data without the ID
     * Omit<Product, 'id'> removes `id` key from the Product type
     */
    create(product: Omit<Product, 'id'>): Product {
        // Creates a new product by generating an id and combining it with input data
        const newProduct = { id: this.idCounter++, ...product };

        // Stores the new product in the local array
        this.products.push(newProduct);

        // Returns the created product
        return newProduct;
    }

    /**
     * Returns all products
     */
    findAll(): Product[] {
        return this.products;
    }

    /**
     * Finds a single product by its ID
     * @param id - Product ID
     * @returns the product if found, otherwise undefined
     */
    findOne(id: number): Product | undefined {
        // Uses Array.prototype.find to locate product by ID
        return this.products.find((p) => p.id === id);
    }

    /**
     * Updates an existing product
     * @param id - Product ID
     * @param update - Partial product data (not all fields required)
     * @returns updated product or null if not found
     */
    update(id: number, update: Partial<Product>): Product | null {
        // Find the index of the product to update
        const index = this.products.findIndex((p) => p.id === id);

        // If product not found, return null
        if (index === -1) return null;

        // Merge existing product with update fields
        this.products[index] = { ...this.products[index], ...update };

        // Return the updated product
        return this.products[index];
    }

    /**
     * Deletes a product by ID
     * @param id - Product ID
     * @returns true if deletion succeeded, false if not found
     */
    delete(id: number): boolean {
        // Find index of the product to delete
        const index = this.products.findIndex((p) => p.id === id);

        // If not found, return false
        if (index === -1) return false;

        // Remove the product from array using splice
        this.products.splice(index, 1);

        // Indicate deletion was successful
        return true;
    }
}
