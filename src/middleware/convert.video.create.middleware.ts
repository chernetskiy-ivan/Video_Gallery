import express from 'express';
import { User } from 'src/db/entities/user.entity';
import { userService } from '../services/user.service';
import { VideoPayloadDto } from '../services/dto/VideoPayloadDto';

export const convertVideoCreateMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const createVideoPayload: VideoPayloadDto = req.body;

    //convert mode string to boolean
    if (String(createVideoPayload.mode) === 'true') {
      createVideoPayload.mode = true;
    } else if (String(createVideoPayload.mode) === 'false') {
      createVideoPayload.mode = false;
    } else {
      throw new Error('Video mode must be true or false');
    }

    //if mode - true, openFor must be empty
    if (createVideoPayload.mode) {
      if (createVideoPayload.openFor.length != 0) {
        throw new Error(
          'Invalide body. If video mode is true, put openFor empty',
        );
      }
    } else {
      //convert openFor string to array
      const openForArr: string[] = String(createVideoPayload.openFor).split(
        ',',
      );
      createVideoPayload.openFor = openForArr;

      //validate emails
      for (const email of openForArr) {
        const user: User | null = await userService.getUserByEmail(email);
        if (!user) {
          throw new Error('Invalide email for private video');
        }
      }
    }

    next();
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
};
