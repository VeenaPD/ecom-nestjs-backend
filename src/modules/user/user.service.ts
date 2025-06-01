import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
    private users: User[] = [];
    private idCounter = 1;

    create(user: Omit<User, 'id'>): User {
        const newUser = {id: this.idCounter++, ...user};
        this.users.push(newUser);
        return newUser;
    }

    findAll() {
        return this.users;
    }

    findOne(id: number): User | undefined {
        return this.users.find(user => user.id === id);
    }

    update(id: number, data: Partial<Omit<User, 'id'>>): User | null {
        const user = this.findOne(id);
        if(!user) return null;
        Object.assign(user, data);
        return user;
    }

    delete(id: number): void {
        this.users = this.users.filter(user => user.id !== id);
    }
}
