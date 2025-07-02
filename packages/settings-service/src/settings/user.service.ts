import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserRole, UserStatus } from '@fugata/shared';

type UserUpdateData = Partial<Omit<User, 'passwordHash'>> & {
  password?: string;
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(username: string, email: string, password: string, role: UserRole, merchantIds: string[] = []): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      email,
      passwordHash,
      role,
      merchantIds,
      status: UserStatus.ACTIVE,
    });
    return this.userRepository.save(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async update(id: string, data: UserUpdateData): Promise<User | null> {
    const updateData: Partial<User> = { ...data };
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }
    await this.userRepository.update(id, updateData);
    return this.userRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findAll(filters?: {
    merchantId?: string;
  }): Promise<User[]> {
    if (filters?.merchantId) {
      return this.userRepository.find({ where: { merchantIds: In([filters.merchantId]) } });
    }
    return this.userRepository.find();
  }
} 