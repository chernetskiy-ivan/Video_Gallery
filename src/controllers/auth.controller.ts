import express from 'express';
import * as bcrypt from 'bcryptjs';
import { User } from '../db/entities/user.entity';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { validationResult } from 'express-validator';
import { errorLogsService } from '../services/logs.service';

class AuthController {
  async register(req: express.Request, res: express.Response): Promise<object> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Registration error', errors });
      }

      const { email, password } = req.body;
      const candidate: User | null = await userService.getUserByEmail(email);

      if (!candidate) {
        const hashPassword: string = await bcrypt.hash(password, 5);
        await userService.createUser({ email, password: hashPassword });
        return res
          .status(200)
          .json({ success: 'User was created successfully' });
      }

      return res.status(404).json({ error: 'This user is alredy exists' });
    } catch (e: any) {
      errorLogsService.logErrors(e.message);
      return res.status(400).json({ message: 'Registration error' });
    }
  }

  async login(req: express.Request, res: express.Response): Promise<object> {
    try {
      const { email, password } = req.body;
      const access_token_and_refresh_token = await authService.login({
        email,
        password,
      });
      return res.status(200).send(access_token_and_refresh_token);
    } catch (e: any) {
      errorLogsService.logErrors(e.message);
      return res.status(400).json({ error: 'Invalid data input' });
    }
  }

  async refresh(req: express.Request, res: express.Response): Promise<object> {
    try {
      const { refresh_token } = req.body;
      const new_access_token_and_refresh_token = await authService.refresh(
        refresh_token,
      );
      return res.status(200).send(new_access_token_and_refresh_token);
    } catch (e: any) {
      errorLogsService.logErrors(e.message);
      return res.status(400).json({ error: 'Invalid refresh_token' });
    }
  }
}

export const authController = new AuthController();
