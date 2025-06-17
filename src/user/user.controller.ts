// src/user/user.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, UsePipes, ValidationPipe, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, Category } from '@prisma/client'; // Import types from Prisma client
// Import Swagger Decorators
import {
  ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBadRequestResponse, ApiConflictResponse, ApiNotFoundResponse
} from '@nestjs/swagger';
import { UserProfileDto } from './dto/user-profile.dto';

@ApiTags('users') // Group all user-related endpoints under 'users' tag
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
  @ApiOperation({ summary: 'Register a new user account', description: 'Creates a new user with the provided email, password, and optional details. Hashes the password and checks for duplicate emails.' })
  @ApiResponse({ status: 201, description: 'User successfully registered.', type: CreateUserDto }) // Type hint for response
  @ApiBadRequestResponse({ description: 'Invalid input data.' }) // For validation errors
  @ApiConflictResponse({ description: 'User with this email already exists.' }) // For duplicate email
  @ApiBody({ type: CreateUserDto, description: 'Data for user registration' }) // Explicitly define request body
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
  @ApiOperation({ summary: 'Get user by ID', description: 'Retrieves a single user by their unique ID.' })
  @ApiParam({ name: 'id', description: 'UUID of the user to retrieve', type: 'string', format: 'uuid' }) // Document param
  @ApiResponse({ status: 200, description: 'The user found.', type: CreateUserDto })
  @ApiNotFoundResponse({ description: 'User not found.' })
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


  @Put(':id/profile') // e.g., PUT /users/:id/profile
  @ApiOperation({ summary: 'Update user profile', description: 'Updates a user\'s profile details, including an optional nested shipping address.' })
  @ApiParam({ name: 'id', description: 'UUID of the user whose profile is being updated', type: 'string', format: 'uuid' })
  @ApiBody({ type: UserProfileDto, description: 'User profile data, including optional shipping address' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully.', type: UserProfileDto }) // Assuming response structure is similar
  @ApiBadRequestResponse({ description: 'Invalid input data for profile or address.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  async updateProfile(
    @Param('id') id: string,
    @Body() userProfileDto: UserProfileDto,
  ): Promise<any> { // Change 'any' to a proper response type if you define one
    console.log(`Updating profile for user ID: ${id}`);
    console.log('Received profile data:', userProfileDto);

    // In a real scenario, you'd use your UserService to update the user record
    // based on userProfileDto. You'd likely fetch the user first, then update fields.
    // Example:
    // const updatedUser = await this.userService.updateUserProfile(id, userProfileDto);
    // return updatedUser;

    return { message: 'Profile data received and validated', data: userProfileDto };
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