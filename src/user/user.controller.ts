// src/user/user.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, UsePipes, ValidationPipe, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, Category } from '@prisma/client'; // Import types from Prisma client
import { TrimAndLowercasePipe } from 'src/shared/pipes/trim-and-lowercase/trim-and-lowercase.pipe';

@Controller('users')
@UsePipes(new ValidationPipe({
  whitelist: true,               // Strip properties not defined in DTO
  forbidNonWhitelisted: true,    // Throw error if non-whitelisted properties exist
  transform: true,               // Automatically transform payload to DTO instance
  transformOptions: {
    enableImplicitConversion: true // Convert primitive types (e.g., "123" to 123)
  }
}))
export class UserController {
  constructor(private readonly userService: UserService) { }

  // @Post()
  // @HttpCode(HttpStatus.CREATED) // Set HTTP status code for creation
  // async create(@Body() createUserDto: CreateUserDto): Promise<User> {
  //   // In a real app, you'd hash the password here or in the service
  //   const passwordHash = createUserDto.password; // For demo, assuming it's already hashed or handled
  //   return this.userService.createUser(
  //     createUserDto.email,
  //     passwordHash,
  //     createUserDto.firstName,
  //     createUserDto.lastName,
  //     createUserDto.role
  //   );
  // }

  // NEW: User Registration Endpoint
  @Post('register') // This will be POST /users/register
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    // Pass the plain password to the service for hashing and creation
    const registeredUser = await this.userService.registerUser(
      createUserDto.email,  // This email will be pre-transformed by @Transform in DTO
      createUserDto.password, // Plain password from DTO
      createUserDto.firstName,
      createUserDto.lastName,
      createUserDto.role,
    );
    // Remove sensitive data (like password hash) before sending response
    const { password, ...result } = registeredUser;
    return result as User; // Return user without password hash
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAllUsers();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    return this.userService.findUserById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    // Hash password if it's being updated
    if (updateUserDto.password) {
      updateUserDto.password = updateUserDto.password; // Hash here or in service
    }
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content for successful deletion
  async remove(@Param('id') id: string): Promise<void> {
    await this.userService.deleteUser(id);
  }

  // --- Relationship Endpoints ---

  @Post(':id/categories')
  @HttpCode(HttpStatus.CREATED)
  async createWithCategories(
    @Param('id') userId: string,
    @Body('categoryIds') categoryIds: string[], // Expect an array of category IDs
  ): Promise<User & { categories: Category[] }> {
    // This is a simplified example. In a real app, you might have a dedicated DTO for this.
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return this.userService.createUserWithCategories(user.email, user.password, categoryIds);
  }

  @Get(':id/categories')
  async findUserCategories(@Param('id') id: string): Promise<(User & { categories: Category[] }) | null> {
    return this.userService.findUserWithCategories(id);
  }

  @Get('with-category-names') // Example of a more complex query
  async findAllUsersWithCategoryNames(): Promise<{ id: string; email: string; categories: { name: string }[] }[]> {
    return this.userService.findAllUsersWithCategoryNames();
  }
}