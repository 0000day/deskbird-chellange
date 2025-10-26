import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<UserResponseDto[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<UserResponseDto | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto, currentUserId: number): Promise<UserResponseDto> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!existingUser) {
      throw new BadRequestException('User not found');
    }

    // Remove email from update data - emails cannot be changed
    const { email, ...updateData } = updateUserDto;

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email address is already registered');
    }

    // Hash password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role: createUserDto.role || 'USER',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: number, currentUserId: number): Promise<void> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!existingUser) {
      throw new BadRequestException('User not found');
    }

    // Prevent users from deleting themselves
    if (id === currentUserId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    // Hard delete the user
    await this.prisma.user.delete({
      where: { id },
    });
  }
}