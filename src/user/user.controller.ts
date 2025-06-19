// src/user/user.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, Request, UsePipes, ValidationPipe, HttpCode, HttpStatus, NotFoundException, UseGuards, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, Category, Role } from '@prisma/client'; // Import types from Prisma client
// Import Swagger Decorators
import {
  ApiTags, ApiOperation,
  ApiResponse, ApiBody, ApiParam, ApiBadRequestResponse, ApiConflictResponse, ApiNotFoundResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse
} from '@nestjs/swagger';
import { UserProfileDto } from './dto/user-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { AppAbility, CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { AbilitiesGuard } from 'src/shared/guards/abilities.guard';
import { CheckAbilities } from 'src/shared/decorators/abilities.decorator';
import { Action } from 'src/shared/enum/action.enum';

@ApiTags('users') // Group all user-related endpoints under 'users' tag
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService,
    private readonly caslAbilityFactory: CaslAbilityFactory, // <-- Inject CaslAbilityFactory
  ) { }

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

  // @Get()
  // async findAll(): Promise<User[]> {
  //   return this.userService.findAllUsers();
  // }

  // Get all users - requires ADMIN role
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all users (Admin only)', description: 'Retrieves a list of all registered users. Requires ADMIN role.' })
  @ApiResponse({ status: 200, description: 'List of users.', type: [CreateUserDto] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden: Requires Admin role.' })
  // @UseGuards(AuthGuard('jwt'), RolesGuard) // <-- First authenticate, then authorize roles
  // @Roles(Role.ADMIN) // <-- Only ADMIN role can access
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @CheckAbilities((ability: AppAbility) => ability.can(Action.Read, 'all')) // Check if user can read 'all' subjects
  async findAll(): Promise<User[]> {
    return this.userService.findAllUsers();
  }


  // @Get(':id')
  // @ApiOperation({ summary: 'Get user by ID', description: 'Retrieves a single user by their unique ID.' })
  // @ApiParam({ name: 'id', description: 'UUID of the user to retrieve', type: 'string', format: 'uuid' }) // Document param
  // @ApiResponse({ status: 200, description: 'The user found.', type: CreateUserDto })
  // @ApiNotFoundResponse({ description: 'User not found.' })
  // async findOne(@Param('id') id: string): Promise<User | null> {
  //   console.log("getByID executed");
  //   return this.userService.findUserById(id);
  // }

  // Get user by ID - requires ADMIN role, or the user themselves (more complex authorization)
  @Get(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user by ID (Admin or self)', description: 'Retrieves a single user by their unique ID. Requires ADMIN role or accessing own profile.' })
  @ApiParam({ name: 'id', description: 'UUID of the user to retrieve', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'The user found.', type: CreateUserDto })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden: Requires Admin role or accessing own profile.' })
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(Role.ADMIN, Role.USER) // Allowing ADMIN or USER to potentially access (guard will do the detailed check)
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  // Policy to check if user can Read 'User' subject (generic check)
  @CheckAbilities((ability: AppAbility) => ability.can(Action.Read, 'User'))
  async findOne(@Param('id') id: string, @Request() req: { user: User }): Promise<User> {
    // Implement self-access logic here if not ADMIN
    // if (req.user.role !== Role.ADMIN && req.user.id !== id) {
    //   throw new ForbiddenException('You can only view your own profile unless you are an Admin.');
    // }
    // return this.userService.findUserById(id);

    const userToView = await this.userService.findUserById(id); // Fetch the user instance

    // Perform the specific, instance-based permission check
    const ability = this.caslAbilityFactory.createForUser(req.user);
    if (!ability.can(Action.Read, userToView)) {
      throw new ForbiddenException('You do not have permission to view this user.');
    }
    return userToView;
  }

  @Get(':email/userinfo')
  async findUserByEmail(@Param('email') email: string): Promise<(User) | null> {
    console.log("getByEmail executed");
    return this.userService.findUserByEmail(email);
  }

  // @Put(':id')
  // async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
  //   // Hash password if it's being updated
  //   if (updateUserDto.password) {
  //     updateUserDto.password = updateUserDto.password; // Hash here or in service
  //   }
  //   return this.userService.updateUser(id, updateUserDto);
  // }
  // Update user profile - requires ADMIN role or the user themselves

  @Put(':id/profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update user profile (Admin or self)', description: 'Updates a user\'s profile details, including an optional nested shipping address. Requires ADMIN role or updating own profile.' })
  @ApiParam({ name: 'id', description: 'UUID of the user whose profile is being updated', type: 'string', format: 'uuid' })
  @ApiBody({ type: UserProfileDto, description: 'User profile data, including optional shipping address' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully.', type: UserProfileDto })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden: Requires Admin role or updating own profile.' })
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(Role.ADMIN, Role.USER) // Allowing ADMIN or USER
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  // Policy to check if user can Update 'User' subject (generic check)
  @CheckAbilities((ability: AppAbility) => ability.can(Action.Update, 'User'))
  async updateProfile(
    @Param('id') id: string,
    @Body() userProfileDto: UserProfileDto,
    @Request() req: { user: User }
  ): Promise<any> {
    // // Implement self-access logic here
    // if (req.user.role !== Role.ADMIN && req.user.id !== id) {
    //   throw new ForbiddenException('You can only update your own profile unless you are an Admin.');
    // }
    // // Implement actual update logic in UserService
    // // return this.userService.updateUserProfile(id, userProfileDto);
    // return { message: 'Profile data received and validated', data: userProfileDto };

    const userToUpdate = await this.userService.findUserById(id); // Fetch the user instance

    // Perform the specific, instance-based permission check
    const ability = this.caslAbilityFactory.createForUser(req.user);
    if (!ability.can(Action.Update, userToUpdate)) {
      throw new ForbiddenException('You do not have permission to update this user.');
    }

    // Call your userService method to update the profile
    return this.userService.updateUser(id, userProfileDto); // Assuming updateUser handles profile updates
  }


  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content for successful deletion
  // async remove(@Param('id') id: string): Promise<void> {
  //   await this.userService.deleteUser(id);
  // }

  // Delete user - requires ADMIN role
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content for successful deletion
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a user (Admin only)', description: 'Deletes a user account by ID. Requires ADMIN role.' })
  @ApiParam({ name: 'id', description: 'UUID of the user to delete', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'User successfully deleted.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiForbiddenResponse({ description: 'Forbidden: Requires Admin role.' })
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(Role.ADMIN) // Only ADMIN role can access
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @CheckAbilities((ability: AppAbility) => ability.can(Action.Delete, 'User')) // Check if user can Delete a 'User'
  async remove(@Param('id') id: string): Promise<void> {
    await this.userService.deleteUser(id);
  }


  // @Put(':id/profile') // e.g., PUT /users/:id/profile
  // @ApiOperation({ summary: 'Update user profile', description: 'Updates a user\'s profile details, including an optional nested shipping address.' })
  // @ApiParam({ name: 'id', description: 'UUID of the user whose profile is being updated', type: 'string', format: 'uuid' })
  // @ApiBody({ type: UserProfileDto, description: 'User profile data, including optional shipping address' })
  // @ApiResponse({ status: 200, description: 'User profile updated successfully.', type: UserProfileDto }) // Assuming response structure is similar
  // @ApiBadRequestResponse({ description: 'Invalid input data for profile or address.' })
  // @ApiNotFoundResponse({ description: 'User not found.' })
  // async updateProfile(
  //   @Param('id') id: string,
  //   @Body() userProfileDto: UserProfileDto,
  // ): Promise<any> { // Change 'any' to a proper response type if you define one
  //   console.log(`Updating profile for user ID: ${id}`);
  //   console.log('Received profile data:', userProfileDto);

  //   // In a real scenario, you'd use your UserService to update the user record
  //   // based on userProfileDto. You'd likely fetch the user first, then update fields.
  //   // Example:
  //   // const updatedUser = await this.userService.updateUserProfile(id, userProfileDto);
  //   // return updatedUser;

  //   return { message: 'Profile data received and validated', data: userProfileDto };
  // }


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
