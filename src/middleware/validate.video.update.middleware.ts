import express from 'express';
import { User } from '../db/entities/user.entity';
import { userService } from '../services/user.service';
import { IUpdateVideo } from '../services/interfaces/IUpdateVideo';

export const validateVideoUpdateMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const userId: number | undefined = await userService.getUserIdFromToken(
      req,
    );

    if (userId) {
      const options: IUpdateVideo = req.body;

      if (options) {
        if (options.mode) {
          if (options.openFor) {
            if (options.openFor?.length != 0) {
              throw new Error(
                'Invalide body. If video mode is true, put openFor empty',
              );
            }
          }
        } else {
          if (options.openFor) {
            if (options.openFor?.length == 0) {
              throw new Error(
                'Invalide body. If video mode is false, openFor must not be empty',
              );
            }
          } else {
            throw new Error(
              'Invalide body. If video mode is false, detect users email in openFor property',
            );
          }
        }

        const user: User | null = await userService.getUserById(userId);

        if (user) {
          if (options.openFor) {
            if (options.openFor?.indexOf(user.email) != -1) {
              throw new Error(
                'Invalid body. Do not mention author email in openFor property',
              );
            }
          }
        } else {
          throw new Error('Unexpected error');
        }
      } else {
        throw new Error('Unauthorized');
      }
    } else {
      throw new Error('No update data');
    }

    next();
  } catch (e: any) {
    if (e.message == 'Unauthorized') {
      return res.status(401).json({ error: e.message });
    }
    return res.status(500).json({ error: e.message });
  }
};
