import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from 'src/db/entities/user.entity';
import { UserDto } from './dto/UserDto';
import { userService } from './user.service';
import { RefreshToken } from 'src/db/entities/refreshToken.entity';
import { refreshTokenService } from './refreshToken.service';

class AuthService {
  async login({ email, password }: UserDto): Promise<object> {
    const user: User | null = await userService.getUserByEmail(email);

    if (user) {
      const passwordEquals = await bcrypt.compare(password, user.password);
      if (passwordEquals) {
        const access_token: string = this.generateAccessToken(user.id);
        const refresh_token: string = this.generateRefreshToken(user.id);

        //does user alredy have refresToken
        const existingRefreshToken: RefreshToken | null =
          await userService.getUsersRefreshToken(user.id);

        if (existingRefreshToken) {
          await refreshTokenService.updateRefreshToken(
            existingRefreshToken.refreshToken,
            refresh_token,
          );
          return {
            access_token,
            refresh_token: refresh_token,
          };
        }

        await refreshTokenService.createRefreshToken(refresh_token);

        return {
          access_token,
          refresh_token,
        };
      }
    }

    throw new Error('Invalid data input');
  }

  logout() {
    return 'logout';
  }

  generateAccessToken(id: number): string {
    const payload = {
      id,
    };
    return jwt.sign(payload, String(process.env.JWT_SECRET), {
      expiresIn: process.env.TOKEN_TIMELIFE_ACCESS,
    });
  }

  generateRefreshToken(id: number): string {
    const payload = {
      id,
    };
    return jwt.sign(payload, String(process.env.JWT_SECRET), {
      expiresIn: process.env.TOKEN_TIMELIFE_REFRESH,
    });
  }

  async refresh(refresh_token: string): Promise<object> {
    return await refreshTokenService.refresh(refresh_token);
  }
}

export const authService: AuthService = new AuthService();
