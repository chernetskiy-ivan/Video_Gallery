import jwt from 'jsonwebtoken';
import { User } from '../db/entities/user.entity';
import { authService } from './auth.service';
import { userService } from './user.service';
import { RefreshToken } from '../db/entities/refreshToken.entity';
import { AppDataSource } from '../db/data-source';

class RefreshTokenService {
  async createRefreshToken(token: string): Promise<RefreshToken> {
    const refreshToken: RefreshToken = AppDataSource.getRepository(
      RefreshToken,
    ).create({ refreshToken: token });

    const decode: any = jwt.decode(token);

    const user: User | null = await userService.getUserById(decode.id);

    //тут вопрос надо ли в юзера сохранять токен так как в базе его нету с ним
    //надо проверить это как с токеном по отношению
    //и потом убрать и что-то сделать
    if (user) {
      user.refreshToken = refreshToken;
      refreshToken.user = user;
      await AppDataSource.getRepository(User).save(user);
    }

    return await AppDataSource.getRepository(RefreshToken).save(refreshToken);
  }

  async getRefreshToken(token: string): Promise<RefreshToken | null> {
    return await AppDataSource.getRepository(RefreshToken).findOne({
      where: { refreshToken: token },
    });
  }

  async updateRefreshToken(
    oldRefreshToken: string,
    newRefreshToken: string,
  ): Promise<void> {
    try {
      await AppDataSource.getRepository(RefreshToken).update(
        { refreshToken: oldRefreshToken },
        { refreshToken: newRefreshToken },
      );
    } catch (e) {
      throw new Error(`Can't update refresh_toke`);
    }
  }

  async refresh(token: string): Promise<object> {
    const isTokenExist: RefreshToken | null = await this.getRefreshToken(token);

    if (isTokenExist) {
      const decode: any = jwt.decode(token);

      const new_access_token: string = authService.generateAccessToken(
        decode.id,
      );
      const new_refresh_token: string = authService.generateRefreshToken(
        decode.id,
      );

      await this.updateRefreshToken(token, new_refresh_token);

      return {
        access_token: new_access_token,
        refresh_token: new_refresh_token,
      };
    }

    throw new Error('Invalide refresh_token');
  }

  decodeIdFromToken(token: string): number {
    const decodeData: any = jwt.decode(token);
    return decodeData.id;
  }
}

export const refreshTokenService: RefreshTokenService =
  new RefreshTokenService();
