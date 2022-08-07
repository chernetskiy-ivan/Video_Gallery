import express from 'express';
import { User } from '../db/entities/user.entity';
import { UserDto } from './dto/UserDto';
import { RefreshToken } from '../db/entities/refreshToken.entity';
import { AppDataSource } from '../db/data-source';
import { refreshTokenService } from './refreshToken.service';

class UserService {
  async createUser({ email, password }: UserDto): Promise<User> {
    const user: User = AppDataSource.getRepository(User).create({
      email,
      password,
    });
    return await AppDataSource.getRepository(User).save(user);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await AppDataSource.getRepository(User).findOne({
      where: {
        email,
      },
    });
  }

  async getUserById(id: number): Promise<User | null> {
    return await AppDataSource.getRepository(User).findOne({
      where: {
        id,
      },
    });
  }

  async getUsersRefreshToken(userId: number): Promise<RefreshToken | null> {
    const refreshTokens: any = await AppDataSource.getRepository(
      RefreshToken,
    ).find({
      relations: ['user'],
    });

    if (refreshTokens) {
      return refreshTokens.filter(function (token: RefreshToken) {
        if (token.user.id === userId) {
          return true;
        }
      })[0];
    }
    return null;
  }

  getUserIdFromToken(req: express.Request): number | undefined {
    const token: string | undefined = req.headers.authorization?.split(' ')[1];
    if (token) {
      return refreshTokenService.decodeIdFromToken(token);
    }
  }
}

export const userService: UserService = new UserService();
