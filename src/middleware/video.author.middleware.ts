import express from 'express';
import { userService } from '../services/user.service';
import { videoService } from '../services/video.service';

export const openForAuthorMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const userId: number | undefined = await userService.getUserIdFromToken(
      req,
    );

    if (userId) {
      const videoId = Number(req.params.videoId);

      const isAutor = await videoService.isAutorByUserIdAndVideoId(
        userId,
        videoId,
      );

      if (!isAutor) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    } else {
      throw new Error('Unauthorized');
    }

    next();
  } catch (e: any) {
    if (e.message == 'Unauthorized') {
      return res.status(401).json({ error: e.message });
    }
    if (e.message == 'Video not found') {
      return res.status(404).json({ error: e.message });
    }
    return res.status(500).json({ error: e.message });
  }
};
